const Rank = require("../models/rank.js")
const fetch = require("node-fetch");
require("dotenv").config(); 
const moment = require('moment');
require('moment-timezone');
moment.tz.setDefault('Asia/Seoul')


////////
// 날짜 관련함수
////////

/**
 * 오늘 일자 반환
 * @returns YYYYMMDD형태의 오늘일자 반환
 */
function today(){
    return moment().format("YYYYMMDD")
  };


/**
 * 특정일자를 반환하거나 변수가 없을경우 defalut 일자를 반환한다.
 * @param {*} date YYYYMMDD 형태의 8자리
 * @returns YYYYMMDD형태의 8자리
 */
function getDate(date){
    let now = today()
    if(date){
        now = moment(`${date}`, "YYYYMMDD")
    }
    return moment(now).format("YYYYMMDD") 
}


/**
 * 요청일자가 올바른 형태인지 확인하는 함수
 * @param {number} req YYYYMMDD 형태의 8자리
 * @returns 형식이 아니면 false 반환
 */
const checkDaily = (req) => {
    const result = moment(req, "YYYYMMDD", "ture").isValid()
    const checkday = today()
    if(result && Number(req) <= checkday && Number(req) >= 20100101 ){
        return true}
    else{
        return false
        } 
}



////////
// 요청Url 관련 함수
////////

/**
 * kobis(한국영상진흥원) 요청 Url 함수(key포함)
 *  *요청일데이터는 요청시 데이터의 일자를 조회해야한다.
 * @param {*} date YYYYMMDD 형태의 8자리
 * @returns 요청일자를 적용한 Url 반환
 */
const getKobisUrl = (date) => {
    let targetDt = getDate(date)
    reqURL = 'http://www.kobis.or.kr/kobisopenapi/webservice/rest/boxoffice/searchDailyBoxOfficeList.json'
    const kobisApiKey = process.env.KOFIC_API_KEY
    const kobisurl = `${reqURL}?key=${kobisApiKey}&targetDt=${targetDt}`;
    return kobisurl
}


////////
// kobis 데이터 요청관련 함수
////////

/**
 * kobis(한국영상진흥원) 요청일자의 랭킹 데이터 반환
 * 반환된 데이터를 json형태로 변환한다.
 * @param {*} date YYYYMMDD 형태의 요청일자
 * @returns 요청일자의 랭킹 데이터 반환
 */
const getKobisDailyRankData = async(date) => {
    const requrl = getKobisUrl(date)
    try{
    const response = await fetch(requrl)
    let result = response.json()
    return result
    }catch (err){
        return "kobis서버에서 error가 발생하였습니다. 나중에 다시 시도해주세요"
    }
}


/**
 * kobisDB의 데이터 업데이트 현황을 파악하는 함수
 * @param {*} data YYYYMMDD 형태의 요청일자
 * @returns 해당일자의 데이터가 있으면 true 없으면 flase반환
 */
const confirmKobisDB = async(data) =>{
    let kobisData = data
    let rankData = kobisData['boxOfficeResult']['dailyBoxOfficeList']
    if (rankData.length !=0){
        return true
    }
    else {
        return false
    }
}


/**
 * kobis(한국영상진흥원) 요청일자의 랭킹 데이터 반환
 * 요청데이터의 일자의 정보가 없다면 전일자의 데이터를 반환한다.
 * @param {*} date YYYYMMDD 형태의 요청일자
 * @returns 요청일자의 랭킹 데이터 반환 or 전일일자 데이터 반환
 */
const getKobisData = async(date) => {
    const kobisData = await getKobisDailyRankData(date)
    const confirmKobis = await confirmKobisDB(kobisData)

    let daily = kobisData['boxOfficeResult']["showRange"]
    let rankData = kobisData['boxOfficeResult']['dailyBoxOfficeList']

    if (confirmKobis){
        dataset ={
            daily : daily,
            rankData : rankData
            }
            return dataset

    }else{
        let fixDate = date-1
        const fixData = await getKobisDailyRankData(fixDate)
        daily = fixData['boxOfficeResult']["showRange"]
        rankData = fixData['boxOfficeResult']['dailyBoxOfficeList']

        dataset = {
            daily : daily,
            rankData : rankData
        }
        return dataset
    }
}



////////
// db관련 함수
////////


/**
 * Rank Top10을 만들고 ranking에 들어갈 배열로 만들어준다.
 * @param {number} date YYYYMMDD 형태의 요청일자
 * @returns ranking의 들어갈 배열로 반환
 * ranking이 업데이트 되지않았을시 업데이트 되지 않았다는 문자열 return
 */
const getRankSet = async(date) => {
    const data = await getKobisData(date)
    const rankData  = data["rankData"]
    const daily = data["daily"]

    let rankSet = []
    for (let i = 0; i < rankData.length; i++) {
        let rank = new Rank.Rank
        rank = {
            movieCode : parseInt(rankData[i].movieCd),
            movieTitle : rankData[i].movieNm,
            rank : parseInt(rankData[i].rank),
        }
        rankSet.push(rank)
        }

    let resultSet = {
        daily : daily,
        rankSet : rankSet
    }
    return resultSet
    }


/**
 * dailyrank에 저장할 형태로 가공해주는 함수이다.
 * @param {number} date YYYYMMDD 형태의 8자리
 * @returns 요청일자의 data를 저장할형태로 만들어준다
 */
const createRankForm = async(date) => {
    const data = await getRankSet(date)
    const targetDt = data["daily"].slice(0,8);
    const dataSet = data["rankSet"]
    let dailyRank = {
            daily : Number(targetDt),
            ranking : dataSet
        }
    return dailyRank
    }

   

/**
 * 가공한 데이터를 dailyrank에 저장해주는 함수
 * @param {number} date YYYYMMDD 형태의 8자리
 * mongoDB에 데이터를 저장한다.
 */
const saveRank = async (date) => {
    const data = await createRankForm(date)
    const dailyRank = new Rank.DailyRank(data)
    dailyRank.save()
}


/**
 * dailyrank에 원하는 일자의 데이터가 있는지 확인한다.
 * 없을시 null값을 반환한다.
 * @param {*} date 
 */
const checkRank = async(date) => {
    const checkDate = getDate(date)
    const rankResult = await Rank.DailyRank.exists({daily : {$eq:checkDate}})
    return rankResult
}



/**
 * Rank를 한개 읽어오는 함수
 * @param {*} date YYYYMMDD 형태의 8자리
 * @returns 일자에 맞는 데이터 반환 
 */
const getRank = async (date) => {
        const checkDate = getDate(date)
        const rankResult = await Rank.DailyRank.findOne({ daily : checkDate }, {_id:false, __v:false});
        return rankResult
    }


/**
 * 데이터가 있는지 확인하고 없으면 새로운 데이터의 확인 및
 * 새로운 데이터가 있으면 만들어서 반환, 없으면 전일자 확인 반환해주는함수
 * @param {*} date YYYYMMDD 형태의 8자리
 * @returns 데이터를 보낸다.
 */
const confirmRank = async (date) => {
    const checkDate = getDate(date)
    const checkData = await checkRank(checkDate)
    if(checkData){
        let result = await getRank(checkDate)
        return result
    }
    else{
        let kobisData = await getKobisDailyRankData(checkDate)
        let confirmData = await confirmKobisDB(kobisData)
        if(confirmData){
            await saveRank(checkDate)
            let result = await getRank(checkDate)
            return result
        }else{
            let confirmDate = checkDate -1
            let confirmData = await checkRank(confirmDate)
            if(confirmData){
                let result = await getRank(confirmDate)
                return result
            }else{
                await saveRank(confirmDate)
                let result = await getRank(confirmDate)
                return result
            }
        }
    }
}



////////
// route 관련 함수
////////
/**
 * 요청에 대한 Rank를 반환해준다.
 * route에 연결할 함수이다.
 * @param {*} req daily 유무에 따라
 * @param {*} res
 */ 
const readRank = async(req, res) => { 
    const {daily} = req.params
    let data = ""

    if(checkDaily(daily)){
        let date = getDate(daily)
        data = await confirmRank(date)
        try{
            if(data == null){
                data = await getRank(date)
                res.json(data)
            }
            else{
            res.json(data)
        }
        }
        catch(err){
            console.log(err);
            res.send("server errorcode : 500");
        }
    }
    else{
        res.send("YYYYMMDD형식에 맞추어 보내주세요")
    }
}



module.exports = {readRank}