var sqlite3 = require('sqlite3').verbose();
// open the database

var path = require('path')
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

 db.run('CREATE TABLE IF NOT EXISTS coupons(couponID integer PRIMARY KEY AUTO_INCREMENT, expiration_date text, type integer, value integer) VALUES (?, datenow , 1, 50  )', function(err){if (err){
   console.log(err.message);
 }
});
 
 
db.serialize(function() {
  var starter = db.prepare('INSERT INTO User (UserID, coupon) VALUES(?,?) ', function(err) {
    if (err) {
      return console.log(err.message);
    };
    for (var i=1; i++; i<10 ){
    var n = i;
    starter.run(i,i+100)

    };
  });
  starter.finalize();

  db.each(`SELECT UserID, coupon FROM User`, function (err, row){
    if (err) {
      console.error(err.message);
    }
    console.log(row.UserID + row.coupon);
  });
});


 
db.close((err) => {
  if (err) {
    console.error(err.message);
  }
  console.log('Close the database connection.');
});

