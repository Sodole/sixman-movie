let express = require('express');
let router = express.Router();
require("dotenv").config();
 
var admin = require("firebase-admin");

const { getDatabase } = require('firebase-admin/database');

// Fetch the service account key JSON file contents
var serviceAccount = require("../sixman-movie-firebase-adminsdk-3pmew-1b43afd0c5.json");

// Initialize the app with a service account, granting admin privileges
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  // The database URL depends on the location of the database
  databaseURL: "https://sixman-movie-default-rtdb.asia-southeast1.firebasedatabase.app"
});


const db = getDatabase();
const ref = db.ref('/');


router.get('/', function(req,res,next){
    ref.set({
        alanisawesome: {
          date_of_birth: 'June 23, 1912',
          full_name: 'Alan Turing'
        },
        gracehop: {
          date_of_birth: 'December 9, 1906',
          full_name: 'Grace Hopper'
        }
      });
    res.send("ok")
    });

router.get('/read', function(res,res,next){
    ref.on('value', (snapshot) => {
        console.log(snapshot.val());
    }, (error) => {
        console.log('fail:' + error.name);
    })
    res.send("ok")
});

module.exports = router;