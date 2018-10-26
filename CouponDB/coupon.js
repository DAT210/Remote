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

db.run('CREATE TABLE IF NOT EXISTS UserCoupons(UserID INTEGER PRIMARY KEY, Coupons INTEGER)', function(err) {
	if (err) {
    console.log(err.message);
  }
	});

 db.run('CREATE TABLE IF NOT EXISTS UserIDs(UserID INTEGER PRIMARY KEY)', function(err){if (err){
   console.log(err.message);
 }});

var d= Date.now ;
var datenow = d.toString();

 db.run('CREATE TABLE IF NOT EXISTS Coupon(CouponID INTEGER PRIMARY KEY AUTO_INCREMENT, ExpirationDate TEXT, Type INTEGER, Value INTEGER) ', function(err){if (err){
   console.log(err.message);
 }
});
 

const app = express();
const port = process.env.PORT;

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
 

/*
Json format to reward server:
    {
        UserID: int
        Type: int
        Value: int
        
    }
*/

/*
Json format from reward server: 
{
  CouponID: int
  ExpirationDate: text
  Type: int
  Value: int

  
}
eller {
  UserID: int
  Coupons: []
}
*/

function GetUserCoupons(id,res){
  db.all(`SELECT * FROM UserCoupons WHERE UserID = ${id}`,function(err,row){
    if(err){console.log(err)}
    else{
      db.each("SELECT Coupons FROM UserCoupons WHERE UserID =${id}",function(err,row){
        if(err){console.log(err)}
        else{
          console.log(UserID)
          console.log(row.Coupon);
        }
      });
    }
  });
}

function GetCoupon (id, CouponID,res){
db.get(`SELECT * FROM UserCoupons WHERE UserID = ${id}`, function(err, row){
  if (err){
    console.log(err);
  }
  else{
    db.each("SELECT CouponID,ExpirationDate,Type,Value FROM Coupons WHERE CouponID = ${CouponID}", function (err,row){
      if(err){console.log(err)}
      else{
console.log(row.CouponID,row.ExpirationDate,row.Type,row.Value);
      }
    });
  }
});
}

function makeDate (){
  var d = Date.now
  d += 1000*60*60*24*30;
  var datenow = d.toString();
  return datenow;
}

function makeDate2 (y,m,d){
  if (y=null){y=0;}
  if (m=null){m=0;}
  if (d=null){d=0;
  var d = Date.now
  d += 1000*60*60*24*d + 1000*60*60*24*30*m + 1000*60*60*24*30*y
  var datenow = d.toString();
  return datenow;
}

function addCoupon(UserID, Type, Value){
  
var datenow = makeDate;

let json = req.body;
	let UserID = parseInt(json.UserID, 10);
  let Type = parseInt(json.Type, 10);
  let Value = parseInt(json.Value, 10);
	let ExpirationDate = datenow;

  db.run('INSERT INTO UserCoupons(UserID, Coupon) VALUES (${UserID}, ${UserID})')
 // db.run('INSERT INTO UserIDs(UserID)VALUES (${UserID})')
  db.run('INSERT INTO Coupons(CouponID, ExpirationDate, Type, Value) VALUES (${UserID}, ${ExpirationDate},${Type}, ${Value} )')
  // CouponID ->AUTO_INCREMENT?
//insert into Coupon(CouponID)
}

// skrives om?
function viability (date2check){
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

function usedCoupon (CouponID){
  db.get(`SELECT * FROM Coupons WHERE CouponID = ${CouponID}`, function(err, row){
    if (err){
      console.log(err.message);
    }
    else {
      // write Coupon into usedcoupons and delete from current.
      // dateOfUse == date.now.toString

    }

  });
}

app.post('/Coupons/', function(req,res){
	let json = req.body;
  let UserID = parseInt(json.UserID, 10);
  let Type = parseInt(json.Value, 10);
  let Value = parseInt(json.Value, 10);
  
  var ExpirationDate = makeDate();
//addCoupon(UserID, Type, Value); 
  db.get(`SELECT Coupons FROM UserCoupons WHERE UserID = ${UserID}`, function(err,row){
    if(err){console.log(err);}
    else{
      db.run("INSERT INTO Coupons(CouponID, ExpirationDate,Type, Value) VALUES (${UserID}, ${ExpirationDate},${Type}, ${Value}) ", function(err,row)
      {
        if(err){console.log(err);
        }
      });
    }
  });


app.get("/User-Coupons/:id", function(req,res){
  let json = req.body;
  let UserID = parseInt(json.UserID, 10);

  GetUserCoupons(UserID,res);
});

app.get("/Coupons/:CouponID", function(req,res){
  let json = req.body;
  let UserID = parseInt(json.UserID, 10);
  let CouponID = parseInt(json.CouponID, 10);
  var checkdate = db.get("SELECT ExpirationDate FROM Coupon WHERE CouponID = ${CouponID}")
  if(viability(checkdate== false)){
    //fjern Coupon
  }
  

  GetCoupon(UserID,CouponID,res);
});

db.close(err) => 
  if (err) {
    console.error(err.message);
  }
  console.log('Close the database connection.');
};