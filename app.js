const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const mongoose = require('mongoose')

const indexRouter = require('./routes/index');
const movieRouter = require('./routes/movie');
const rankRouter = require('./routes/rank');

const app = express();


//middleware
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());


mongoose.Promise = global.Promise;

// db connect
mongoose.connect(process.env.mongoURL, {
  dbName: "sixman" // 이 이름으로 db가 생성됩니다.
})
  .then(() => console.log(`mongoDB connected`))
  .catch((err) => console.error(err));



  // const { MongoClient, ServerApiVersion } = require('mongodb');
  // const uri = "mongodb+srv://sodole:<password>@sodole.gjoqmic.mongodb.net/?retryWrites=true&w=majority";
  // const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
  // client.connect(err => {
  //   const collection = client.db("test").collection("devices");
  //   // perform actions on the collection object
  //   client.close();
  // });
  

//router
app.use('/', indexRouter);
app.use('/rank', rankRouter)
app.use('/movie', movieRouter);


module.exports = app;
