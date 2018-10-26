const nunjucks = require('nunjucks');
const express = require('express');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();
// open the database

const path = require('path')
var dbPath = path.resolve(__dirname, 'CouponDB.db')
var db = new sqlite3.Database(dbPath, sqlite3.OPEN_READWRITE , (err) => {
  if (err){console.error(err.message);
  }
  console.log('Connected')
});

db.run('CREATE TABLE IF NOT EXISTS User(UserID INTEGER PRIMARY KEY, coupon INTEGER)', function(err) {
	if (err) {
    console.log(err.message);
  }
	});

 db.run('CREATE TABLE IF NOT EXISTS UserIDs(UserID INTEGER PRIMARY KEY)', function(err){if (err){
   console.log(err.message);
 }});

var d= Date.now ;
var datenow = d.toString();

 db.run('CREATE TABLE IF NOT EXISTS coupons(couponID INTEGER PRIMARY KEY AUTO_INCREMENT, expiration_date TEXT, type INTEGER, value INTEGER) VALUES (?, datenow , 1, 50  )', function(err){if (err){
   console.log(err.message);
 }
});
 

const app = express();
const port = process.env.PORT;
/*
nunjucks.configure(__dirname, {
	autoescape: true,
	express: app
});

app.use(express.static(__dirname, + '/static'));

// Example route
app.get('/', function (req, res) {

	res.render('reward.html');

});
 app.use(bodyParser.json());
 */

/*
Json format to reward server:
    {
        userId: int
        value: int
        type: int
    }
*/

/*
Json format from reward server: 
{
  couponID: int
  expirationDate: text
  type: int
  value: int

  
}
eller {
  userID: int
  coupons: []
}
*/

function GetUserCoupons(req,res){
  db.all(`SELECT * FROM User WHERE userID = ${id}`,function(err,row){
    if(err){console.log(err)}
    else{
      db.each("SELECT coupons FROM user WHERE userID =${id}",function(err,row){
        if(err){console.log(err)}
        else{
          console.log(userID)
          console.log(row.coupon);
        }
      };)
    }
  });
}

function GetCoupon (req,res){
db.get(`SELECT * FROM User WHERE userID = ${id}`, function(err, row){
  if (err){
    console.log(err);
  }
  else{
    db.each("SELECT couponID,expirationDate,type,value FROM coupons WHERE couponID = ${couponID}", function (err,row){
      if(err){console.log(err)}
      else{
console.log(row.couponID,row.expirationDate,row.type,row.value);
      }
    });

  }
}

}
function makeDate (){
  var d = Date.now
  d += 1000*60*60*24*30;
  var datenow = d.toString();
  return datenow;
}

function addCoupon(userID, type, value){
  
var datenow = makeDate;

let json = req.body;
	let userID = parseInt(json.userID, 10);
  let type = parseInt(json.type, 10);
  let value = parseInt(json.value, 10);
	let expirationDate = datenow;

  db.run('INSERT INTO User(UserID, coupon) VALUES (${userID}, ${userID})')
 // db.run('INSERT INTO UserIDs(UserID)VALUES (${UserID})')
  db.run('INSERT INTO coupons(couponID, expirationDate, type, value) VALUES (${userID}, ${expirationDate},${type}, ${value} )')
  // couponID ->AUTO_INCREMENT?
//insert into coupon(couponID)
}

// kan være bedre å ha >= istedenfor localCompare
function Viability (date2check){
  var d = Date.now;
  var date = d.toString;
  var ans = true;
  for(var i=0;i<date2check.length;i++){
    if(date2check[i]<date[i]){
      ans = false;
    break;}
    else{continue;}
  }
  return ans;
}

function usedCoupon (couponID){
  db.get(`SELECT * FROM coupons WHERE couponID = ${couponID}`, function(err, row){
    if (err){
      console.log(err.message);
    }
    else {
      // write coupon into usedcoupons and delete from current.
      // dateOfUse == date.now.toString

    }

  }
}

app.post('/addCoupon', function(req,res){
	let json = req.body;
	let userID = parseInt(json.userID, 10);
  let value = parseInt(json.value, 10);
  let type = parseInt(json.value, 10);
  var expirationDate = makeDate();
//addCoupon();
  db.get(`SELECT coupons FROM User WHERE userID = ${userID}`, function(err,row){
    if(err){console.log(err);}
    else{
      db.run("INSERT INTO coupons(couponID, expirationDate,type, value) VALUES (${userID}, ${expirationDate},${type}, ${value}) ")
    }
  });
}

app.get("/getUserCoupons/:id", function(req,res){
  let json = req.body;
  let userID = parseInt(json.userID, 10);

  GetUserCoupons;
}

app.get("/getCoupon/:id", function(req,res){
  let json = req.body;
  let userID = parseInt(json.userID, 10);
  let couponID = paseInt(json.couponID, 10);

  GetCoupon;
}

db.close((err) => {
  if (err) {
    console.error(err.message);
  }
  console.log('Close the database connection.');
});

