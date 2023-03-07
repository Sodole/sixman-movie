const Rank = require("../models/rank.js")
const fetch = require("node-fetch");
require("dotenv").config(); 
const moment = require('moment');
require('moment-timezone');
moment.tz.setDefault('Asia/Seoul')


//일자관련함수 

/**
 * 오늘 알자 반환 함수
 * @returns YYYYMMDD형태의 오늘일자 반환
 */
function today(){
    return moment().format("YYYYMMDD")
  };

/**
 * 일자를 반환하는 함수(default = 어제일자)
 * @param {number} date YYYYMMDD 형태의 8자리
 * @returns YYYYMMDD형태의 8자리
 */
function getDate(date){
    let now = today()
    if(date){
        now = moment(`${date}`, "YYYYMMDD")
    }
    return moment(now).format("YYYYMMDD") 
}


// 요청Url관련 함수들


/**
 * kobis(한국영상진흥원) 요청 Url 함수(key포함)
 * @param {number} date YYYYMMDD 형태의 8자리
 * @returns 요청일자를 적용한 Url 반환
 */
const getKobisUrl = (date) => {
    let targetDt = getDate(date) -1
    reqURL = 'http://www.kobis.or.kr/kobisopenapi/webservice/rest/boxoffice/searchDailyBoxOfficeList.json'
    const kobisApiKey = process.env.KOFIC_API_KEY
    const kobisurl = `${reqURL}?key=${kobisApiKey}&targetDt=${targetDt}`;
    return kobisurl
}


// 데이터 요청관련 함수

// /**
//  * Apiurl을 넣으면 요청한 url의 데이터를 json으로 파싱해준다(비동기)
//  * @param {string} url 요청시 scretkey를 포함한 url이 필요 
//  * @returns 요청한 rul의 값을 json형태로 변환해서 전달해준다
//  * 사용시 async함수에 url을 넣어서 await로 값을 반환해서 사용 추천
//  */
// const openApiData = async(url) => {
//     const requrl = url
//     const response = await fetch(requrl)
//     let result = response.json()
//     return result
// }

/**
 * kobis(한국영상진흥원) 요청일자 데이터 반환 함수
 * @param {number} date YYYYMMDD 형태의 8자리
 * @returns 요청일자 data 반환
 */
const getKobisData = async(date) => {
    const requrl = getKobisUrl(date)
    const response = await fetch(requrl)
    let result = response.json()
    return result
}

// db관련 함수

/**
 * Rank Top10을 만들고 ranking에 들어갈 배열로 만들어준다.
 * @param {number} date YYYYMMDD 형태의 8자리
 * @returns ranking의 들어갈 배열로 반환
 */
const getRankSet = async(date) => {
    const data = await getKobisData(date)
    let rankData = data['boxOfficeResult']['dailyBoxOfficeList']
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
        return rankSet
    }


/**
 * dailyrank에 저장할 형태로 가공해주는 함수이다.
 * @param {number} date YYYYMMDD 형태의 8자리
 * @returns 요청일자의 data를 저장할형태로 만들어준다
 */
const createRank = async(date) => {
    const targetDt = getDate(date)
    const data = await getRankSet(date)
    let dailyRank = {
            daily : targetDt,
            ranking : data
        }
    return dailyRank
    }
   

/**
 * 가공한 데이터를 dailyrank에 저장해주는 함수
 * @param {number} date YYYYMMDD 형태의 8자리
 * mongoDB에 데이터를 저장한다.
 */
const saveRank = async (date) => {
    const data = await createRank(date)
    const daily = new Rank.DailyRank(data)
    daily.save()
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
 * 일자가 올바른 형태인지 확인하는 함수
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
 * 데이터가 있는지 확인하고 없으면 만들어서 반환, 있으면 반환해주는함수
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
        await saveRank(checkDate)
        let data = await getRank(checkDate)
        return data
    }
}


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


// module.exports.findRank = async (req, res) => {
//     let { daily } = req.params;
//     daily = Number(daily)
//     const rankResult = await Rank.exists({ daily : {$eq: daily }});
//     try{
//         if(rankResult){
//             let result = await Rank.findOne({ daily : daily }, {_id:false, __v:false});
//             res.send(result);
//         } 
//         if(!rankResult){
//             await createdDailyRank(daily);
//             let result = await Rank.findOne({ daily :daily }, {_id:false, __v:false});
//             res.send(result);
//         }
//     }
//     catch(err){
//         console.log(err);
//         res.send("server errorcode : 500");
//     }
// }

module.exports = {readRank}