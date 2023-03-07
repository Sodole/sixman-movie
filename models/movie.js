const mongoose = require("mongoose");

// movie정보에 대한 스키마

/**
 * movie의 actor부분을 저장하기위한 subSchema
 */
// const actorSchema = mongoose.Schema({
//   koName: {
//     type:String,
//     maxLength : 50,
//   },
//   enName : {
//     type:String,
//     maxLength : 50,
//   },
//   cast :{
//     type:String,
//     maxLength : 50,
//   }
// })

/**
 * 수많은 영화 데이터를 저장하기 위한 스키마
 */
const movieSchema = mongoose.Schema({
  movieCode: {
    type: Number,
    unique: true,
  },
  koTitle: { type: String},
  enTitle:{type: String},
  enOriginTitle:{ type: String},
  prdtYear:{type: Number},
  openDt : { type: Number},
  nation :{ type: String},
  showTm:{ type: Number},
  directors:[Object],
  genreNm: [Object],
  actor : [Object],
  posterUrl: {type:String},
  userRating : {type:Number}
});

// 모델의 이름과 스키마를 이용해 모델의 정의함.
const Movie = mongoose.model("Movie", movieSchema);

module.exports = { Movie };
