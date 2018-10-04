var sqlite3 = require('sqlite3').verbose();
// open the database

var path = require('path')
var dbPath = path.resolve(__dirname, 'CouponDB.db')
var db = new sqlite3.Database(dbPath, sqlite3.OPEN_READWRITE , (err) => {
  if (err){console.error(err.message);
  db.close();}
  console.log('Connected')
});

// var db = new sqlite3.Database('CouponDB\CouponDB.db', sqlite3.OPEN_READWRITE, (err) => {
  //if (err) {
 //   console.error(err.message);
 //   db.close();
 // }
//  console.log('Connected to the Coupon database.');
//});
 
db.serialize(function() {
  var starter = db.prepare("INSERT INTO User Values");
  for (var i=0;i<10;i++){
    var n = 9000+i;
    starter.run(i,n)
  }
  starter.finalize();

  db.each(`SELECT UserId FROM User`, function (err, row){
    if (err) {
      console.error(err.message);
    }
    console.log(row.id + "\t");
  });
});
 
db.close((err) => {
  if (err) {
    console.error(err.message);
  }
  console.log('Close the database connection.');
});