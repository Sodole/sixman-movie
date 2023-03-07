const Movie = require("../models/movie.js")
const Rank = require("../models/rank.js")
const moment = require('moment');
require('moment-timezone');
const fetch = require("node-fetch");
const { model } = require("mongoose");
require("dotenv").config(); 
moment.tz.setDefault('Asia/Seoul')



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


// 요청Url관련 함수들

/**
 * kobis(한국영상진흥원) 요청 Url 함수(key포함)
 * @param {number} date YYYYMMDD 형태의 8자리
 * @returns 요청일자를 적용한 Url 반환
 */
const getKobisUrl = (movieCd) => {
    const movieCode = movieCd
    reqURL = 'http://www.kobis.or.kr/kobisopenapi/webservice/rest/movie/searchMovieInfo.json'
    const kobisApiKey = process.env.KOFIC_API_KEY
    const kobisurl = `${reqURL}?key=${kobisApiKey}&movieCd=${movieCode}`;
    return kobisurl
}


/**
 * db에서 dailyrank 오브젝트를 읽어오는 함수
 * @param {*} date YYYYMMDD 형태의 8자리
 * @returns 일자에 맞는 데이터 반환 
 */
const getRank = async (date) => {
        const checkDate = getDate(date)
        const rankResult = await Rank.DailyRank.findOne({ daily : checkDate }, {_id:false, __v:false});
        return rankResult
    }


/**
 * dailyRank의 code를 하나의 배열로 만들어서 되돌려주는 함수
 * @param {*} date YYYYMMDD 형태의 8자리
 * @returns 일자에 맞는 rankCD 배열 전달
 */
const getRankCode = async (date) =>{
    const data = await getRank(date)
    let ranking = data["ranking"]
    let rankCdSet = []
    for(let i =0; i <10; i++){
        rankCdSet.push(ranking[i])
    }
    return rankCdSet
}


/**
 * movie url 배열을 얻는 함수
 * @param {*} date YYYYMMDD 형태의 8자리
 * @returns 일자에 맞는 movieUrl함수를 추출한다.
 */
const getMovieUrl = async(date) =>{
    const rankCode = await getRankCode(date)
    let result =[]
    for(let i =0; i <10; i++){
        result.push(getKobisUrl(rankCode[i]["movieCode"]))
    }
    return result
}


/**
 * 배열이 있는지 확인하는 함수
 */
const confirmMoviedb =()=> {
    return 
}

/**
 * 일자에 맞춰 kobis에 요청한 각 순번에 대한 데이터를 받아오는 함수
 * @param {*} num 원하는 순번을 입력한다
 * @param {*} date YYYYMMDD 형태의 8자리
 * @returns fetch의 결과값
 */
const getMovieData = async(num, date = today() ) =>{
    const movieUrl = await getMovieUrl(date)
    const reqUrl = movieUrl[num]
    const response = await fetch(reqUrl)
    const result = response.json()
    return result
}




/**
 * naver에서 movie정보를 받아오는 함수
 * @param {*} title 영화제목을 이름으로 넣는다
 * @returns 네이버의 영화정보를 출력한다.
 */
const getNaMovieData = async(title) =>{
    const client_id = process.env.client_id
    const client_secret = process.env.client_secret
    const reqTitle = title
    const api_url = `https://openapi.naver.com/v1/search/movie.json?query=${reqTitle}`
    const response = await fetch(api_url, {
        method: "GET",
        headers: {
            'Content-Type': 'application/json',
            'X-Naver-Client-Id':client_id,
            'X-Naver-Client-Secret': client_secret
        },
    })
    const data = response.json()
    return data
}


/**
 * 받아온정보를 parsing해서 원하는 형태로 가공한다.
 * @param {*} title 
 */
const getPosterdata = async(title) =>{
    const data = await getNaMovieData(title)
    const result = {
        image : data["items"][0]["image"],
        userRank : data["items"][0]["userRating"]
    }
    return result
}


/**
 * movie system에 맞는 dataSet만들어 주는 함수
 * @param {*} num 랭킹의 숫자
 * @param {*} date YYYYMMDD 형태의 8자리
 * @returns movieDataset을 반환함
 */
const createMovieData = async(num, date = today()) =>{
    const movieData = await getMovieData(num, date)
    const finalData = movieData["movieInfoResult"]["movieInfo"]
    const title = finalData["movieNm"]
    const naverData = await getPosterdata(title)
    let movieSet = {
        movieCd : finalData["movieCd"],
        koTitle : finalData["movieNm"],
        enTitle : finalData["movieNmEn"],
        enOriginTitle : finalData["movieNmOg"],
        prdtYear : finalData["prdtYear"],
        openDt : finalData["openDt"],
        nation : finalData["nations"],
        showTm : finalData["showTm"],
        directors : finalData["directors"],
        genreNm : finalData["genres"],
        actor : finalData["actors"],
        posterUrl : naverData["image"],
        userRating : naverData["userRank"]
    }
    return movieSet
}


/**
 * movie의 dataset을 받아서 저장하는함수
 * @param {*} num rank의 순번
 * @param {*} date YYYYMMDD 형태의 8자리
 */
const saveMovie = async(num, date = today()) =>{
    const data = await createMovieData(num, date)
    const newMovie = new Movie.Movie(data)
    newMovie.save()
}



const readMovie = async(req, res) => {
    const {daily, rank} = req.params
    try{
        let data = await createMovieData(rank, daily)
        if(checkDaily(daily)){
            try{
                if(data == null){
                    data = await createMovieData(date)
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
    catch{
        res.send("없는주소입니다.")
    }
    }


module.exports = {readMovie}

// /**
//  * 데이터가 있는지 확인하고 없으면 만들어서 반환, 있으면 반환해주는함수
//  * @param {*} date YYYYMMDD 형태의 8자리
//  * @returns 데이터를 보낸다.
//  */
// const confirmMovie = async (date) => {
//     const checkDate = getDate(date)
//     const checkData = await checkRank(checkDate)
//     if(checkData){
//         let result = await getRank(checkDate)
//         return result
//     }
//     else{
//         await saveRank(checkDate)
//         let data = await getRank(checkDate)
//         return data
//     }
// }












// module.exports.getmovie2 = async (req, res) => {


// var client_id = process.env.client_id
// var client_secret = process.env.RTrGTdMG1i
// var api_url = 'https://openapi.naver.com/v1/search/blog?query='
// // + encodeURI(req.query.query); // JSON 결과
// var request = require('request');
// var options = {
//     url: api_url,
//     headers: {'X-Naver-Client-Id':client_id, 'X-Naver-Client-Secret': client_secret}
// };
//    request.get(options, function (error, response, body) {
//     console.log(response.statusCode)
//      if (!error && response.statusCode == 200) {
//        console.log(response)
//         console.log(body)
//        res.writeHead(200, {'Content-Type': 'text/json;charset=utf-8'});
//        res.end(body);
//      } else {
//     //    res.status(response.statusCode).end();
//     console.log(res.statusCode)
//     //    console.log('error = ' + response.statusCode);
//      }
//    });
//  }

// module.exports.getmovie = async (req, res) => {
//     let yesterday = getYesterday();
//     const rankResult = await Rank.exists({ daily : {$eq:yesterday }});

//     try{
//         if(rankResult){
//             let result = await Rank.findOne({ daily : yesterday }, {_id:false, __v:false});
//             res.send(result);
//         } 
//         else{
//             await createYesterdayRank();
//             let result = await Rank.findOne({ daily : yesterday }, {_id:false, __v:false});
//             res.send(result);
//         }
//     }
//     catch(err){
//         console.log(err);
//         res.send("server errorcode : 500");
//     }
// }


  
// module.exports.find = async (req, res) => {
// try {
//     const { daily } = req.params;

//     // req.params.daily가 있을 시 해당 날짜의 ranking 정보를 리턴한다.
//     if (daily) {
//     // dailt가 일치하는 rank object 하나 찾는다.
//     const rank = await Rank.findOne({ daily });

//     // 해당 유저 정보가 존재하지 않으면 404를 리턴한다.
//     if (!rank) return res.status(404).send("ranking not found");
//     return res.send(rank);
//     }
// } catch (err) {
//     return res.status(500).send(err);
// }
// };

// module.exports.findrank = async (req, res) => {
//     try {
//         const { daily, rank } = req.params;
        
//         // req.params.daily가 있을 시 해당 날짜의 ranking 정보를 리턴한다.
//         if (daily) {
//         // dailt가 일치하는 rank object 하나 찾는다.
//         const day_rank = await Rank.findOne({ daily });
//         target_rank = day_rank.ranking[rank-1]
        
//         // 해당 rank 정보가 존재하지 않으면 404를 리턴한다.
//         if (!rank) return res.status(404).send("ranking not found");
//         return res.send(target_rank);
//         }
//         // // req.params.rank가 없으면 모든 유저 정보를 리턴한다.
//         // const ranks = await Rank.find({});
//         // return res.send(ranks);
//     } catch (err) {
//         return res.status(500).send(err);
//     }
//     };

// module.exports.create = async (req, res) => {
//     try {
//         const { daily, ranking } = req.body;
//         // 새로운 rank 도큐먼트를 생성 후 저장
//         const new_rank = new Rank({ daily, ranking });
    
//           await new_rank.save();
//           return res.send("저장됨");
//         } catch (err) {
//           return res.status(500).send(err);
//         }
//     };


//   module.exports.remove = async (req, res) => {
//     try {
//       const { userId } = req.params;
//       // userId를 가진 유저 정보를 찾는다.
//       const user = await User.findOne({ userId });
  
//       // userId를 가진 유저가 없으면 404를 리턴한다.
//       if (!user) return res.status(404).send("user not found");
  
//       // 유저 정보를 삭제한다.
//       await user.remove();
//       return res.send();
//     } catch (err) {
//       return res.status(500).send(err);
//     }
//   };