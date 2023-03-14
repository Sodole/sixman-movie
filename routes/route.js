const express = require('express');
const router = express.Router();
const Rank = require("../controllers/rank")
const Movie = require("../controllers/movie");

router.get('/:daily?', Rank.readRank);


router.get("/:daily/:rank?", Movie.readMovie)



module.exports = router;
