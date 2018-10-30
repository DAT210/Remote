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

db.run('CREATE TABLE IF NOT EXISTS UserCoupons(UserID INTEGER PRIMARY KEY, Coupons INTEGER, FOREIGN KEY (Coupons) REFERENCES Coupon (Coupons))', function(err) {
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
eller
     {
       UserID: int
       CouponID: int

     }
     eller 
     {
       CouponID: int
       ExpirationDate: text
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
  Coupons: [int]
}
*/

function GetUserCoupons(id,res){
  db.all(`SELECT * FROM UserCoupons WHERE UserID = ${id}`,function(err,row){
    if(err){console.log(err)}
    else{
      db.each(`SELECT Coupons, Amount, Used FROM UserCoupons WHERE UserID =${id}`,function(err,row){
        if(err){console.log(err)}
        else{
          console.log(UserID)

rows.array.forEach((row) => {
  console.log(row.Coupons);
});
          console.log(row.Amount);
          console.log(row.Used)
        }
      });
    }
  });
}

function GetCoupon (CouponID,res){
    db.get(`SELECT CouponID,ExpirationDate,Type,Value FROM Coupon WHERE CouponID = ${CoponID}`, function (err,row){
      if(err){console.log(err)}
      else{
console.log(row.CouponID,row.ExpirationDate,row.Type,row.Value);
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

function MakeCoupon(ExpirationDate, Type,Value){
let json = req.body
let Type = parseInt(json.Type,10);
let Value = parseInt(json.Value,10);
let ExpirationDate = ExpirationDate;

db.run('INSERT INTO Coupon(ExpirationDate, Type, Value) VALUES (${ExpirationDate},${Type}, ${Value} )', function(err,row){
  if(err){console.log(err)}
  else {
    console.log(`A row has been inserted with CouponID: ${this.CouponID}`);
   // console.log(row.CouponID);
    console.log(this.ExpirationDate);
    console.log(this.Type);
    console.log(this.Value);
  }
});
}

function add2User(UserID, CouponID){
  let json = req.body
  let UserID = parseInt(json.Type,10);
  let CouponID = parseInt(json.CouponID,10);

db.run(`INSERT INTO UserCoupons (Coupons) VALUES (${CouponID} WHERE UserID = ${UserID})`, function(err,row){
  if (err){console.log(err)}
  else {
    console.log(this.UserID);
    console.log(this.CouponID);
  }
});
}



function addCoupon(UserID, Type, Value){
  
var datenow = makeDate;

let json = req.body;
	let UserID = parseInt(json.UserID, 10);
  let Type = parseInt(json.Type, 10);
  let Value = parseInt(json.Value, 10);
	let ExpirationDate = datenow;
  
 
  db.run('INSERT INTO Coupon(CouponID, ExpirationDate, Type, Value) VALUES (${UserID}, ${ExpirationDate},${Type}, ${Value} )')
  db.run("INSERT INTO UserCoupons(UserID, Coupons) VALUES (${UserID}, ${?})")
  
}

// checks expirationdate
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

//when a coupon is used, slide it into UsedCoupons
function UsedCoupon (CouponID){
  db.get(`SELECT * FROM Coupons WHERE CouponID = ${CouponID}`, function(err, row){
    if (err){
      console.log(err.message);
    }
    else {
     let CouponID = row.CoponID;
      let ExpirationDate = row.ExpirationDate;
      let DateOfUse = date.now.toString;
      let Type = row.Type;
      let Value =row.Value;
      db.run("INSERT INTO UsedCoupons(CouponID, ExpirationDate, DateOfUse, Type, Value) VALUES (${CouponID}, ${ExpirationDate}, ${DateOfUse}, ${Type}, ${Value})", function(err,row){
        if(err){console.log(err);}
        else{
          db.run("DELETE FROM Coupons WHERE CouponID = ${CouponID}", function(err,row){
            if(err){console.log(err);}
            else{
              console.log("Deleted coupon: " + this.CouponID);
            }
          });
        }
      });
    }
  });
}

app.post('/User-Coupon', function(req,res){
  let json = req.body;
  let UserID = parseInt(json.UserID, 10);
  let Type = parseInt(json.Type,10);
  let Value = parseInt(json.Value, 10);

  
});

//gives user a made coupon
app.post('/user-coupons', function(req,res){
  let json = req.body;
  let UserID = parseInt(json.UserID, 10);
  let CouponID = parseInt(json.CouponID, 10);

  add2User(UserID,CouponID);
  

});
// Makes a coupon
app.post('/coupons/', function(req,res){
  let page = req.body.page;
	let json = req.body;
 // let UserID = parseInt(json.UserID, 10);
  let Type = parseInt(json.Type, 10);
  let Value = parseInt(json.Value, 10);
  let ExpirationDate = makeDate();
if(['ExpirationDate'].includes(page)){
  ExpirationDate = json.ExpirationDate;
}
MakeCoupon(ExpirationDate,Type, Value);
  });

//get coupons user x have
app.get("/user-coupons/:userID", function(req,res){
  // TODO FIX: There is no json body in a GET request.
  let json = req.body;
  let UserID = parseInt(json.UserID, 10);

  GetUserCoupons(UserID,res);
});

//get information about a coupon
app.get("/coupons/:couponID", function(req,res){
  // TODO FIX: This is a GET request, there's no json body here.
  // You should query the database using the couponID parameter.

  let json = req.body;
  let UserID = parseInt(json.UserID, 10);
  let CouponID = parseInt(json.CouponID, 10);
  var checkdate = db.get("SELECT ExpirationDate FROM Coupon WHERE CouponID = ${CouponID}");
  if(viability(checkdate== false)){
    //fjern Coupon
  }
  
  GetCoupon(UserID,CouponID);
});

db.close(err) => 
  if (err) {
    console.error(err.message);
  }
  console.log('Close the database connection.');
});
