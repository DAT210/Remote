let db = new sqlite3.Database(':memory:');//path.resolve(__dirname, `../db/${process.env.DATABASE_REWARD_NAME}`));

db.run('CREATE TABLE IF NOT EXISTS Payment(Order_ID INTEGER PRIMARY KEY, Sum INTEGER, Paid INTEGER, Paid_Date TEXT, Discount INTEGER)', function(err) {
	if (err) {
		console.log(err.message);
	}
});