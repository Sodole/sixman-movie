const express = require('express');
const router = express.Router();
const request = require("request");

/* GET home page. */
router.get('/', function(req, res, next) {
  
  request.get({
    url : 'http://www.kobis.or.kr/kobisopenapi/webservice/rest/boxoffice/searchDailyBoxOfficeList.json?key=61458b83ba224805675a721852d0a91e&targetDt=20230220'
  }, function(error, response, body) {
    let data = JSON.parse(body);
    let result = data.boxOfficeResult.dailyBoxOfficeList;
    let data_result = result.map((result) => {
      return [result.rank, result.movieNm];
    })


    res.send(`${data_result}`)
  });
});



module.exports = router;
