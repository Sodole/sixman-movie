const Rank = require("../models/rank.js")
const moment = require('moment');
require('moment-timezone');
const fetch = require("node-fetch");
require("dotenv").config(); 
moment.tz.setDefault('Asia/Seoul')


function getYesterday(){
    return moment().format("YYYYMMDD")-1
  };

function createYesterdayRank(){
    reqURL = 'http://www.kobis.or.kr/kobisopenapi/webservice/rest/boxoffice/searchDailyBoxOfficeList.json'
    const kofisApiKey = process.env.KOFIC_API_KEY
    const targetDt = getYesterday()
    console.log(typeof(targetDt))
    const url = `${reqURL}?key=${kofisApiKey}&targetDt=${targetDt}`;
     fetch(url).then(res => res.json())
    .then((data)=> data['boxOfficeResult']['dailyBoxOfficeList']).catch(console.log)
    .then((result) => {
        setData = [];
        for (let i = 0; i < result.length; i++) {
            let sets = {
                rank : parseInt(result[i].rank),
                title : result[i].movieNm
            }
            setData.push(sets)
            }
        let saveData = {
            daily: `${targetDt}`,
            ranking: setData,
          }
        const new_rank = new Rank(saveData);
        try {
            new_rank.save();
        }
        catch(err){
            console.log(err)
        }
})}

function createdDailyRank(date){
    reqURL = 'http://www.kobis.or.kr/kobisopenapi/webservice/rest/boxoffice/searchDailyBoxOfficeList.json'
    const kofisApiKey = process.env.KOFIC_API_KEY
    const targetDt = Number(date)
    const url = `${reqURL}?key=${kofisApiKey}&targetDt=${targetDt}`;
     fetch(url).then(res => res.json())
    .then((data)=> data['boxOfficeResult']['dailyBoxOfficeList']).catch(console.log)
    .then((result) => {
        setData = [];
        for (let i = 0; i < result.length; i++) {
            let sets = {
                rank : parseInt(result[i].rank),
                title : result[i].movieNm
            }
            setData.push(sets)
            }
        let saveData = {
            daily: `${targetDt}`,
            ranking: setData,
          }
        try{
        const new_rank = new Rank(saveData);
        new_rank.save();
        }
        catch{
            console.log(err)
        }
})}



module.exports.getRank = async (req, res) => {
    let yesterday = getYesterday();
    const rankResult = await Rank.exists({ daily : {$eq:yesterday }});

    try{
        if(rankResult){
            let result = await Rank.findOne({ daily : yesterday }, {_id:false, __v:false});
            res.send(result);
        } 
        else{
            await createYesterdayRank();
            let result = await Rank.findOne({ daily : yesterday }, {_id:false, __v:false});
            res.send(result);
        }
    }
    catch(err){
        console.log(err);
        res.send("server errorcode : 500");
    }
}

module.exports.findRank = async (req, res) => {
    let { daily } = req.params;
    daily = Number(daily)
    const rankResult = await Rank.exists({ daily : {$eq: daily }});
    try{
        if(rankResult){
            let result = await Rank.findOne({ daily : daily }, {_id:false, __v:false});
            res.send(result);
        } 
        if(!rankResult){
            await createdDailyRank(daily);
            let result = await Rank.findOne({ daily :daily }, {_id:false, __v:false});
            res.send(result);
        }
    }
    catch(err){
        console.log(err);
        res.send("server errorcode : 500");
    }
}

