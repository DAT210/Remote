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
  d += 1000*60*60*24*d + 1000*60*60*24*30*m + 1000*60*60*24*30**12*y
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
  
 //MakeCoupon?
  db.run('INSERT INTO Coupon(ExpirationDate, Type, Value) VALUES (${ExpirationDate}, ${Type}, ${Value} )',function(err,row){
    if(err){console.log(err)}
    else{
      console.log(this.CouponID);
      CouponID = this.CouponID;
    }
  })
  // CouponID = lastID?
  //add2User?
  db.run("INSERT INTO UserCoupons(UserID, Coupons) VALUES (${UserID}, ${CouponID})", function(err,row){
    if(err){console.log(err);}
    else{
      console.log("Aiit")
    }
  });
  
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
          //foreach?
          db.run("DELETE FROM Coupons WHERE CouponID = ${CouponID}", function(err,row){
            if(err){console.log(err);}
            else{
              console.log("Deleted coupon: " + this.CouponID);
              db.run("DELETE FROM Coupon WHERE CouponID = ${CouponID}",function(err,row){
                if(err){console.log(err)}
                else {
                  console.log("Deleted from Coupon");
                }
              });
            }
          });
        }
      });
    }
  });
}


//makes and adds a coupon to user 
app.post('/user-coupon', function(req,res){
  let json = req.body;
  let UserID = parseInt(json.UserID, 10);
  let Type = parseInt(json.Type,10);
  let Value = parseInt(json.Value, 10);

addCoupon(UserID, Type, Value);

  
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
app.get("/user-coupons/:userID", function(userID,res){
  // TODO FIX: There is no json body in a GET request.
  let UserID = userID;

  GetUserCoupons(UserID,res);
});

//get information about a coupon
app.get("/coupons/:couponID", function(couponID,res){
  // TODO FIX: This is a GET request, there's no json body here
  let CouponID = couponID;

  var checkdate = db.get("SELECT ExpirationDate FROM Coupon WHERE CouponID = ${CouponID}");
  if(viability(checkdate== false)){
    //fjern Coupon
    UsedCoupon(CouponID);
  }
  else{
  GetCoupon(CouponID);
}
});

db.close(err) => 
  if (err) {
    console.error(err.message);
  }
  console.log('Close the database connection.');
});
