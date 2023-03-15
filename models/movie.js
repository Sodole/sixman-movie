const mongoose = require("mongoose");

// movie정보에 대한 스키마

/**
 * 수많은 영화 데이터를 저장하기 위한 스키마
 */
const MovieSchema = mongoose.Schema({
  movieCode: {
    type: Number,
    unique: true,
  },
  koTitle: { type: String},
  enTitle:{type: String},
  enOriginTitle:{ type: String},
  prdtYear:{type: Number},
  openDt : { type: Number},
  nation :[Object],
  showTm:{ type: Number},
  directors:[Object],
  genreNm: [Object],
  actor : [Object],
  tmdbID : {type:Number},
  tmdbOverview : {type:String},
  genreIds : [Number],
  userRating : {type:Number},
  posterUrl : {type:String},
  updateDate : {type:Number}
});

// 모델의 이름과 스키마를 이용해 모델의 정의함.
const Movie = mongoose.model("Movie", MovieSchema);

module.exports = { Movie };
