const express = require('express');
const router = express.Router();
const Movie = require("../controllers/movie");


router.get("/",Movie.getmovie)
  // User 데이터 모델과 연결된 객체 생성 후 req.body 삽입
  // const rank = new Rank(req.body);

  // // save 메서드를 통해 원격 저장소에 데이터 저장.
  // rank.save((err, userInfo) => {
  //   // 에러면 false 반환
  //   if (err) return res.json({ suceess: false, err });
  //   // 성공적이면 200 상태 코드 날리고 true 값 돌려주기
  //   return res.status(200).json({ suceess: true });



module.exports = router;
