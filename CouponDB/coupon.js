const nunjucks = require('nunjucks');
const express = require('express');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();
// open the database

const path = require('path')
var dbPath = path.resolve(__dirname, 'CouponDB.db')
let db = new sqlite3.Database(dbPath, sqlite3.OPEN_READWRITE , (err) => {
  if (err){console.error(err.message);
  }
  console.log('Connected')
});

db.run('CREATE TABLE IF NOT EXISTS UserCoupons(UserID INTEGER PRIMARY KEY, Coupons INTEGER, FOREIGN KEY (Coupons) REFERENCES Coupon (Coupons))', function(err) {
	if (err) {
    console.log(err.message);
  }
  else {console.log("UserCoupons serialized")}
	});

var d= Date.now ;
var datenow = d.toString();

 db.run(`CREATE TABLE IF NOT EXISTS Coupon(CouponID INTEGER PRIMARY KEY AUTO_INCREMENT, ExpirationDate TEXT, Type INTEGER, Value INTEGER) `, function(err){if (err){
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

 
 app.listen(port), function(err){if (err){console.log(err);}
else {console.log("listening on port:", port);}}
 

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
  let resp = JSON.parse('{}')
  db.all(`SELECT * FROM UserCoupons WHERE UserID = ${id}`,function(err,row){
    if(err){console.log(err)}
    else{
      db.each(`SELECT Coupons, Amount, Used FROM UserCoupons WHERE UserID =${id}`,function(err,row){
        if(err){console.log(err)}
        else{
let coupons = [];
      rows.array.forEach((row) => {
       coupons += row.Coupons;
      });
          res.status(200).json({"UserID": id, "Coupons": coupons, "Amount": row.Amount, "Used": row.Used })
        }
      });
    }
  });
}

function GetCoupon (CouponID,res){
    db.get(`SELECT CouponID,ExpirationDate,Type,Value FROM Coupon WHERE CouponID = ${CouponID}`, function (err,row){
      if(err){console.log(err)}
      else{
//console.log(row.CouponID,row.ExpirationDate,row.Type,row.Value);
res.status(200).json({"CouponID": row.CouponID, "ExpirationDate": row.ExpirationDate, "Type": row.Type, "Used": row.Value })
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

function MakeCoupon(req, res){
let json = req.body
let Type = parseInt(json.Type,10);
let Value = parseInt(json.Value,10);
let ExpirationDate = makeDate;
if(['ExpirationDate'].includes(page)){
  ExpirationDate = json.ExpirationDate;
}

db.run(`INSERT INTO Coupon(ExpirationDate, Type, Value) VALUES (${ExpirationDate},${Type}, ${Value} )`, function(err,row){
  if(err){console.log(err)}
  else {
    console.log(`A row has been inserted with CouponID: ${this.CouponID}`);
    res.status(200).json({"CouponID": this.CouponID, "ExpirationDate": this.ExpirationDate, "Type": this.Type, "Value": this.Value });
  }
});
}

function add2User(req,res){
  let json = req.body
  let resp = json.parse('{}')
  let UserID = parseInt(json.Type,10);
  let CouponID = parseInt(json.CouponID,10);
  if(![Amount].includes(page) && ![Used].includes(page) ){
    let Amount = 1;
    let Used = 0;
  }
  else {
  let Amount = parseInt(json.Amount,10);
  let Used = parseInt(json.Used,10);
  }

db.run(`INSERT INTO UserCoupons (Coupons, Amount, Used) VALUES (${CouponID}, ${Amount}, ${Used}) WHERE UserID = ${UserID})`, function(err,row){
  if (err){console.log(err)
  resp.message = "something went wrong"
res.status(400).json(resp);}
  else {
  
    res.status(200).json({"UserID": this.UserID,"CouponID": this.CouponID, "Amount": this.Amount, "Used": this.Used })
  }
});
}



function addCoupon(req, res){
  
var datenow = makeDate;
let json = req.body;
	let UserID = parseInt(json.UserID, 10);
  let Type = parseInt(json.Type, 10);
  let Value = parseInt(json.Value, 10);
	let ExpirationDate = datenow;
  
 //MakeCoupon?
  db.run(`INSERT INTO Coupon(ExpirationDate, Type, Value) VALUES (${ExpirationDate}, ${Type}, ${Value} )`,function(err,row){
    if(err){console.log(err)}
    else{
     // console.log(this.CouponID);
      CouponID = this.CouponID;
    }
  })
  //add2User?
  db.run(`INSERT INTO UserCoupons(UserID, Coupons) VALUES (${UserID}, ${CouponID})`, function(err,row){
    if(err){console.log(err);}
    else{
      res.status(200).json({"UserID": this.UserID,"CouponID": this.CouponID, "Amount": this.Amount, "Used": this.Used });
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

//gets expiration date from couponID
function getExpirationDate(CouponID){
  db.get(`SELECT ExpirationDate FROM Coupon WHERE CouponID = ${CouponID}`, function(err,row){
    if(err){console.log(err);}
    else {
     let checkdate = this.ExpirationDate;
    }
    return checkdate;
});}


//when a coupon is used, update Used
function UsedCoupon (UserID, CouponID){
  var uses = 0;
  var Amount = 1;
  db.get(`SELECT UserCoupons(Used, Amount) WHERE UserID = ${UserID}, Coupons = ${CouponID}`,function(err,row){
    if(err){console.log(err)}
    else {
      uses = this.Used;
      uses += 1;
      Amount = this.Amount;
    }
  } );
  db.run(`UPDATE INTO UserCoupons(Used) WHERE UserID = ${UserID} VALUES(uses)`,function(err,row){
    if(err){console.log(err)}
    else {

console.log("Uses: " + uses + " of: " + Amount);

    }
  });
}


//makes and adds a coupon to user 
app.post('/user-coupon', function(req,res){
  let json = req.body;

addCoupon(req, res);

});

//gives user a made coupon
app.post('/user-coupons', function(req,res){
  let json = req.body;
  add2User(req,res);
});
// Makes a coupon
app.post('/coupons/', function(req,res){
  let page = req.body.page;
	let json = req.body;
MakeCoupon(req,res);
  });

  app.patch('/use-coupon/', function(req, res){
    let page = req.body.page
    let json = req.body;
    let UserID = parseInt(json.UserID,10);
    let CouponID = parseInt(json.CouponID, 10);
    if(!['UserID','CouponID'].includes(page)){
      console.log("trenger UserID og CouponID");
    }
    else {
      UsedCoupon(UserID, CouponID);
    }
  });

//get coupons user x have
app.get("/user-coupons/:userID", function(userID,res){
  let UserID = userID;

  GetUserCoupons(UserID,res);
});

//get information about a coupon
app.get("/coupons/:couponID", function(couponID,res){
  let CouponID = couponID;
checkdate = getExpirationDate(CouponID);

  if(viability(checkdate)== false){
    //sets used +1 or used=amount
    UsedCoupon(CouponID);
    console.log("Coupon out of date");
  }
  else{
  GetCoupon(CouponID,res);
}
});

db.close();}
