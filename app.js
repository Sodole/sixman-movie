const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const mongoose = require('mongoose')

const routeRouter = require('./routes/route');

const {swaggerUi, specs} = require("./swagger")


const app = express();


//middleware
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());


mongoose.Promise = global.Promise;

// db connect
mongoose.connect(process.env.mongoURL, {
  dbName: "sixman" // db collection 선택
})
  .then(() => console.log(`mongoDB connected`))
  .catch((err) => console.error(err));


//router
app.use('/', routeRouter);


// error 발생시 세부내용을 숨기기 위한 커스텀 미들웨어
app.use((error, req, res, next) => {
  res
    .status(error.status || 500)
    .send({ 
      name: error.name || 'Internal Server Error',
      message: error.message || '서버 내부에서 오류가 발생했습니다.'
    });
});


module.exports = app;
