const mongoose = require("mongoose");

/** 각 영화별 랭킹정보 */
/**
 * dailyranking중 각 영화가 가져야할 종목들
 */
const RankSchema = mongoose.Schema({
  movieCode : {type : Number},
  movieTitle : {type : String},
  rank : {type : Number}
})

/** 일간 ranking순위 */
const DailyRankSchema = mongoose.Schema({
  daily: {
    type: Number,
    maxLength: 50,
    unique: true,
  }, 
  ranking : [RankSchema]
});


// 모델의 이름과 스키마를 이용해 모델의 정의함.
const Rank = mongoose.model("rank", RankSchema);
const DailyRank = mongoose.model("dailyrank", DailyRankSchema);

module.exports = {Rank, DailyRank};
