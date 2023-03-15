const Movie = require("../models/movie.js")
const Rank = require("../models/rank.js")
const moment = require('moment');
require('moment-timezone');
const fetch = require("node-fetch");
const { model } = require("mongoose");
require("dotenv").config(); 
moment.tz.setDefault('Asia/Seoul')
const rank = require("./rank")

////////
// 날짜 관련함수
////////


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
        const date = getDate(req)
        return date
    }
    else{
        const date = getDate() -1
        return date
        } 
}



////////
// 요청Url 관련 함수
////////


/**
 * kobis(한국영상진흥원) 요청 Url 함수(key포함)
 * @param {number} date YYYYMMDD 형태의 8자리
 * @returns 요청영화코드를 적용한 Url 반환
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
    const checkDate = checkDaily(date)
    const rankResult = await Rank.DailyRank.exists({daily : {$eq:checkDate}})
    if(rankResult){
        const Result = await Rank.DailyRank.findOne({ daily : checkDate }, {_id:false, __v:false});
        return Result
    }else{
        try{
        await rank.saveRank(checkDate)
        }catch (err){
            return console.log(err)
        }finally{
            const result = await Rank.DailyRank.findOne({ daily : checkDate }, {_id:false, __v:false});
            return await result
        }
        
    }
}


////////
// 기존 db관련 함수
////////

/**
 * dailyRank의 code를 하나의 배열로 만들어서 되돌려주는 함수
 * @param {*} date YYYYMMDD 형태의 8자리
 * @returns 일자에 맞는 rankCD 배열 전달
 */
const getRankCode = async (date) =>{
    const data = await getRank(date)
    if(data){
    let ranking = data["ranking"]
    let rankCdSet = []
    for(let i =0; i <10; i++){
        rankCdSet.push(ranking[i])
    }
    return rankCdSet
    }else{
        const YesterDayData = await getRank(date-1)
        let ranking = YesterDayData["ranking"]
        let rankCdSet = []
        for(let i =0; i <10; i++){
            rankCdSet.push(ranking[i])
        }
        return rankCdSet
    }
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


////////
// kobis 데이터 요청관련 함수
////////

/**
 * 일자에 맞춰 kobis에 요청한 각 순번에 대한 데이터를 받아오는 함수
 * @param {*} num 원하는 순번을 입력한다
 * @param {*} date YYYYMMDD 형태의 8자리
 * @returns fetch의 결과값
 */
const getMovieData = async(num, date = today() ) =>{
    const movieUrl = await getMovieUrl(date)
    const reqUrl = movieUrl[num]
    console.log("kobis 요청발생")
    const response = await fetch(reqUrl)
    const result = response.json()
    return result
}



////////
// theMovie DataBase 관련 함수
////////
/**
 * TMDB(themovie) 요청 Url 함수(key포함)
 * @param {String} title 영화title
 * @returns 요청영화title를 적용한 Url 반환
 */
const getTMDBUrl = (title) => {
    let query = title
    let reqURL = 'https://api.themoviedb.org/3/search/movie'
    const TMDB_API_KEY = process.env.TMDB_API_KEY
    const tmdbUrl = `${reqURL}?api_key=${TMDB_API_KEY}&query=${query}&language=ko-KR`;
    return tmdbUrl
}


/**
 * 일자에 맞춰 kobis에 요청한 각 순번에 대한 데이터를 받아오는 함수
 * @param {*} num 원하는 순번을 입력한다
 * @param {*} date YYYYMMDD 형태의 8자리
 * @returns fetch의 결과값
 */
const getTMDBData = async(title) =>{
    const movieUrl = getTMDBUrl(title)
    console.log("tmdb 요청발생")
    const response = await fetch(movieUrl)
    const result = response.json()
    return result
}


/**
 * 받아온 tmdb정보를 parsing해서 원하는 형태로 가공한다.
 * tmdb api영화정보와 kobis의 영화 정보가 일치하는지 확인하는 과정을 거쳐 정확한 자료를 받아오도록 한다.
 * @param {*} title 
 * @return 영화 포스터 URL
 */
const getTMDBDataSet = async(title) =>{
    const data = await getTMDBData(title)
    const tmdbDummy = data["results"][0]
    let posterPath = tmdbDummy["poster_path"]
    let result = {
        tmdbID:tmdbDummy["id"],
        tmdbOverview:tmdbDummy["overview"],
        genreIds:tmdbDummy["genre_ids"],
        voteAverage :tmdbDummy["vote_average"],
        posterUrl : `https://image.tmdb.org/t/p/w500/${posterPath}`
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
    console.log(movieData)
    const finalData = await movieData["movieInfoResult"]["movieInfo"]
    const title = await finalData["movieNm"]
    let updateDt = getDate(date)
    const tmdbDataDummy = await getTMDBDataSet(title)
    let movieSet = {
        movieCode : finalData["movieCd"],
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
        tmdbID : tmdbDataDummy["tmdbID"],
        tmdbOverview : tmdbDataDummy["tmdbOverview"],
        genreIds : tmdbDataDummy["genreIds"],
        userRating : tmdbDataDummy["voteAverage"],
        posterUrl : tmdbDataDummy["posterUrl"],
        updateDate : updateDt
    }
    return movieSet
}


/**
 * movieCode를 얻는 함수
 * @param {*} num  n번째
 * @param {*} date YYYYMMDD 형태의 8자리
 * @returns KobisMovieCode
 */
const getMovieCode = async(num,date) => {
    const rankCode = await getRankCode(date)
    const movieCode = rankCode[num]["movieCode"]
    return movieCode
}


/**
 * Movie에 원하는 일자의 데이터가 있는지 확인한다.
 * 없을시 null값을 반환한다.
 * @param {*} date 
 */
const checkMovie = async(num, date) => {
    const movieCode = await getMovieCode(num,date)
    const rankResult = await Movie.Movie.exists({movieCode : {$eq:movieCode}})
    return rankResult    
    }



/**
 * Movie를 한개 읽어오는 함수
 * @param {*} movieCode YYYYMMDD 형태의 8자리
 * @returns code에 맞는 데이터 반환 
 */
const getMovie = async (num, date) => {
    const movieCode = await getMovieCode(num,date)   
    const rankResult = await Movie.Movie.findOne({ movieCode : movieCode }, {_id:false, __v:false});
        return rankResult
    }

/**
 * movie의 dataset을 받아서 저장하는함수
 * @param {*} num rank의 순번
 * @param {*} date YYYYMMDD 형태의 8자리
 */
const saveMovie = async(num, date = today()) =>{
    const checkResult = await checkMovie(num, date)
    if(checkResult){
        return
    }
    else{
        const data = await createMovieData(num, date)
        const newMovie = new Movie.Movie(data)
        newMovie.save()
    }    
}




const readMovie = async(req, res) => {
    const {daily, rank} = req.params
    let date = getDate(daily)
    if(checkDaily(daily)){
        if(rank < 10){
            if(daily == today()){
                date = getDate(daily-1)
            }
            else{
                date = getDate(daily)
            }
    
        const checkMovies = await checkMovie(rank, date)
            if(checkMovies){
                const data = await getMovie(rank, date)
                    res.json(data)
            }
            else{
                try{
                // const data = await createMovieData(rank,date)
                await saveMovie(rank,daily)
                const data = await getMovie(rank, date)
                    if(data==null){
                        res.json(data)
                    }    
                    else{
                        res.json(data)
                    }
                }
                catch (err){
                    console.log(err)
                    res.send("해당 데이터가 없습니다.")
                }
            }
        }
        else{
            res.send("0~9 범위내로 보내주세요")
        }
    }   
    else{
        res.send("해당일에 데이터가 없습니다. YYYYMMDD/0~9형식으로 보내주세요")
    }
}


module.exports = {readMovie}