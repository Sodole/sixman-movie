var express = require('express');
var router = express.Router();

router.get('/', function(req, res, next) {
    res.send("비밀번호내놩");
  });
  

module.exports = router;
