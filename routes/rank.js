const express = require('express');
const router = express.Router();
const Rank = require("../controllers/rank")

/** rank관련 routing */
router.get('/:daily?', Rank.readRank);

// router.get('/:daily/:rank?', Rank.findrank);



// // GET 
// router.get('/', function(req, res, next){
//     res.end();
// });

// // CREATE rank
// router.post('/', function(req, res, next){
//     res.end();
// });

// // UPDATE 
// router.put('/', function(req, res, next){
//     res.end();
// });

// // DELETE 
// router.delete('/', function(req, res, next){
//     res.end();
// });


module.exports = router;
