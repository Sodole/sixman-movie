const mongoose = require("mongoose");

const testSchema = mongoose.Schema({
  title: {
    type: String,
    maxLength: 50,
  },
  rank: {
    type: Number,
    unique: true,
  },
});

// 모델의 이름과 스키마를 이용해 모델의 정의함.
const Test = mongoose.model("Test", testSchema);

module.exports = { Test };