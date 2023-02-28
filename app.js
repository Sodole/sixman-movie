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

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());


mongoose.Promise = global.Promise;

// db connect
mongoose.connect(process.env.mongoURL, {})
  .then(() => console.log(`mongoDB connected`))
  .catch((err) => console.error(err));


app.use('/', indexRouter);
app.use('/rank', rankRouter)
app.use('/movie', movieRouter);


module.exports = app;
