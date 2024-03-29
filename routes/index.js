const express = require('express');
const router = express.Router();
const admin = require("firebase-admin");
const { getDatabase } = require('firebase-admin/database');
const moment = require('moment');
require('moment-timezone');
const fetch = require("node-fetch");
require("dotenv").config(); 

moment.tz.setDefault('Asia/Seoul')

// firebase configuration
// key file to json
const serviceAccount = require("../sixman-movie-firebase-adminsdk-3pmew-1b43afd0c5.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://sixman-movie-default-rtdb.asia-southeast1.firebasedatabase.app"
});

const db = getDatabase();

function getYesterday(){
  return moment().format("YYYYMMDD")-1
};


// router.get('/movie', function(req,res,next){
//   reqURL = 'http://www.kobis.or.kr/kobisopenapi/webservice/rest/boxoffice/searchDailyBoxOfficeList.json'
//   const kofisApiKey = process.env.KOFIC_API_KEY
//   const targetDt = getYesterday()
//   const url = `${reqURL}?key=${kofisApiKey}&targetDt=${targetDt}`;
//   const ref = db.ref(`dailyrank/${targetDt}`);


//   fetch(url).then(res => res.json())
//   .then((result)=> result['boxOfficeResult']['dailyBoxOfficeList']).catch(console.log)
//   .then((data) => {
//     const result = {};
//     for (let i = 0; i < data.length; i++) {
//     result[data[i].rank] = data[i].movieNm;
//     }
//     return result
//   }).then((data) =>{
//   ref.set(data);
//   res.send(data)
//   })
// });

function get_day(day){
  const daily = getYesterday()
  const ref = db.ref(`dailyrank/${daily}/${day}`);
  ref.once('value', (data) => {
    let set_data = data.val();
    return set_data
}, (error) => {
    console.log('fail:' + error.name);
})
  // let movieinfo = `dailyrank/${daily}/${day}`
  // return movieinfo
}

router.get('/', function(req,res,next){
  const daily = getYesterday()
  // const ref = db.ref(`dailyrank/${daily}/`);

  // let rankingnumber= get_day(3)
  // console.log(get_day(3))
  
  const ref = db.ref(`movieinfo/더 퍼스트 슬램덩크`)

  ref.once('value', (data) => {
      res.send(data.val());
  }, (error) => {
      console.log('fail:' + error.name);
  })
});

module.exports = router;








// const express = require('express');
// const router = express.Router();
// const admin = require("firebase-admin");
// const { getDatabase } = require('firebase-admin/database');
// require("dotenv").config(); 

// // Fetch the service account key JSON file contents
// const serviceAccount = require("../sixman-movie-firebase-adminsdk-3pmew-1b43afd0c5.json");

// // Initialize the app with a service account, granting admin privileges
// admin.initializeApp({
//   credential: admin.credential.cert(serviceAccount),
//   // The database URL depends on the location of the database
//   databaseURL: "https://sixman-movie-default-rtdb.asia-southeast1.firebasedatabase.app"
// });

// const db = getDatabase();
// const ref = db.ref('/');


// router.get('/', function(req,res,next){
//     ref.set({
//         alanisawesome: {
//           date_of_birth: 'June 23, 1912',
//           full_name: 'Alan Turing'
//         },
//         gracehop: {
//           date_of_birth: 'December 9, 1906',
//           full_name: 'Grace Hopper'
//         }
//       });
//     res.send("ok")
//     });

// router.get('/read', function(res,res,next){
//     ref.on('value', (snapshot) => {
//         console.log(snapshot.val());
//     }, (error) => {
//         console.log('fail:' + error.name);
//     })
//     res.send("ok")
// });

// // GET 
// router.get('/', function(req, res, next){
//     res.end();
// });

// // CREATE rank
// router.post('/', function(req, res, next){
//     res.end();
// });

// // UPDATE 
// router.put('/', function(req, res, next){
//     res.end();
// });

// // DELETE 
// router.delete('/', function(req, res, next){
//     res.end();
// });

// module.exports = db
// module.exports = router;


/** rank관련 routing */
// router.get('/:daily?', Rank.readRank);

// router.get('/:daily/:rank?', Rank.findrank);



// // GET 
// router.get('/', function(req, res, next){
//     res.end();
// });

// // CREATE rank
// router.post('/', function(req, res, next){
//     res.end();
// });

// // UPDATE 
// router.put('/', function(req, res, next){
//     res.end();
// });

// // DELETE 
// router.delete('/', function(req, res, next){
//     res.end();
// });


// router.get("/:daily/:rank?",Movie.readMovie)
  // User 데이터 모델과 연결된 객체 생성 후 req.body 삽입
  // const rank = new Rank(req.body);

  // // save 메서드를 통해 원격 저장소에 데이터 저장.
  // rank.save((err, userInfo) => {
  //   // 에러면 false 반환
  //   if (err) return res.json({ suceess: false, err });
  //   // 성공적이면 200 상태 코드 날리고 true 값 돌려주기
  //   return res.status(200).json({ suceess: true });
