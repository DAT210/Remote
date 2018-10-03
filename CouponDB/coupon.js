var sqlite3 = require('sqlite3').verbose();
// open the database

var db = new sqlite3.Database('.CouponDB.db', sqlite3.OPEN_READWRITE, (err) => {
  if (err) {
    console.error(err.message);
  }
  console.log('Connected to the Coupon database.');
});
 
db.serialize(function() {
  var starter = db.prepare("INSERT INTO UserID Values");
  for (var i=0;i<10;i++){
    var n = 9000+i;
    starter.run(i,n)
  }
  starter.finalize;

  db.each(`SELECT UserId FROM User`, function (err, row){
    if (err) {
      console.error(err.message);
    }
    console.log(row.id + "\t" + row.first_name);
  });
});
 
db.close((err) => {
  if (err) {
    console.error(err.message);
  }
  console.log('Close the database connection.');
});