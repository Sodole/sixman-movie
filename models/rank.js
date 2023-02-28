const mongoose = require("mongoose");

const RankSchema = mongoose.Schema({
  daily: {
    type: Number,
    maxLength: 50,
    unique: true,
  }, 
  ranking : [{rank: {type:Number}, title:{type:String}}]
});

// 모델의 이름과 스키마를 이용해 모델의 정의함.
const Rank = mongoose.model("rank", RankSchema);


module.exports = Rank;
