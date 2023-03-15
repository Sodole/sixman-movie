const express = require('express');
const router = express.Router();
const Rank = require("../controllers/rank")
const Movie = require("../controllers/movie");

const {swaggerUi, specs} = require("../swagger")


/* GET daily. */
/**
* @swagger
* paths:
*  /{daily}:
*   get:
*     tags: [daily]
*     summary: 일자에 따른 dailyRank 제공
*     parameters:
*       - name: daily
*         in : path
*         description: daily of YYYYMMDD form
*         schema:
*         type: integer
*     responses:
*       "200":
*         description: dailyRank Top10 제공
*  /{daily}/{rank}:
*   get:
*     tags: [rank]
*     summary: 일자 rank에 맞는 detailRankData 제공
*     parameters:
*       - name: daily
*         in : path
*         description: daily of YYYYMMDD form
*         schema:
*         type: integer
*       - name: rank
*         in : path
*         description: select one in [0~9]
*         schema:
*         type: integer
*     responses:
*       "200":
*         description: detail rank data 제공
*/
router.use('/docs', swaggerUi.serve, swaggerUi.setup(specs, { explorer: true }))

router.get("/", function(req, res){
    res.send(
        [{docs : "/docs : swagger"},
        {rank : "/YYYYMMDD : dailyRank"},
        {movie : "/YYYYMMDD/N : MovieInfo"}]
    )
})

router.get('/:daily', Rank.readRank);

router.get("/:daily/:rank?", Movie.readMovie)



module.exports = router;
