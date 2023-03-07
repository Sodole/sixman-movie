const Movie = require("../models/movie.js")
const Rank = require("../models/rank.js")
const moment = require('moment');
require('moment-timezone');
const fetch = require("node-fetch");
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
const getKobisData = (movieCd) => {
    const movieCode = movieCd
    reqURL = 'http://www.kobis.or.kr/kobisopenapi/webservice/rest/boxoffice/searchMovieInfo.json'
    const kobisApiKey = process.env.KOFIC_API_KEY
    const kobisurl = `${reqURL}?key=${kobisApiKey}&movieCode=${movieCode}`;
    return kobisurl
}



/**
 * dailyrank 오브젝트를 읽어오는 함수
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
    let data = await getRank(date)
    let ranking = data["ranking"]
    let rankCdSet = []
    for(let i =0; i <10; i++){
        rankCdSet.push(ranking[i]["movieCode"])
    }
    return rankCdSet
}

const getMovieUrl = async(date) =>{
    let rankCode = await getRankCode(date)
    let result =[]
    for(let i =0; i <10; i++){
        result.push(getKobisData(rankCode[i]))
    }
    return result
}


const getMovieData = async(url) =>{

    const requrl = getKobisUrl(date)
    const response = await fetch(requrl)
    let result = response.json()
    return result
}



const getActor = async(date)=>{
    
}








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












module.exports.getmovie = async (req, res) => {
    let yesterday = getYesterday()

    // let result = await Rank.findOne({ daily : yesterday }, {_id:false, __v:false});

    // ranking = result["ranking"];
    const reqURL = 'http://api.koreafilm.or.kr/openapi-data2/wisenut/search_api/search_json2.jsp?collection=kmdb_new2'
    const kmdbApiKey = process.env.KMDB_API_KEY
    const detail = "N"
    const listCount = 50
    // const releaseDts = "20230222"
    const title = "마루이"
    // const movieId = "20202026"
            

    // for(let i = 0; i < ranking.length; i ++){        
        // const title = ranking[i]["title"]
        // &title=${title}
        // const url = `${reqURL}&detail=${detail}&listCount=${listCount}&ServiceKey=${kmdbApiKey}&releaseDts=${releaseDts}`;
        const url = `${reqURL}&detail=${detail}&listCount=${listCount}&ServiceKey=${kmdbApiKey}&title=${title}`;
        {fetch(url).then(res => res.json())
        .then((data)=> console.log(data)).catch(console.log)
        }}
    // .then((result) => {
    //     setData = [];
    //     for (let i = 0; i < result.length; i++) {
    //         let sets = {
    //             rank : parseInt(result[i].rank),
    //             title : result[i].movieNm
    //         }
    //         setData.push(sets)
    //         }
    //     let saveData = {
    //         daily: `${targetDt}`,
    //         ranking: setData,
    //       }
    //     const new_rank = new Rank(saveData);
    //     try {
    //         new_rank.save();
    //     }
    //     catch(err){
    //         console.log(err)
    //     }

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