const assert = require('assert');
const path = require('path');

let envfile = process.env.NODE_ENV
if (envfile === undefined) {
	console.log('You need to set the NODE_ENV variable to run this program.');
	console.log('Rename the /env/default.env file to match your NODE_ENV variable, and fill in missing api keys');
	return;
}

require('dotenv').config({
	path: path.resolve(__dirname, `../env/${envfile}.env`)
});

const superagent = require('superagent');
const sqlite3 = require('sqlite3').verbose()

let db = new sqlite3.Database(path.resolve(__dirname, `../db/${process.env.DATABASE_NAME}`));

async function cleandb() {
	await new Promise(function(resolve, reject) { db.run(`DELETE FROM reward`, (err) => resolve()); });
	await new Promise(function(resolve, reject) { db.run(`VACUUM`, (err) => resolve()); });
}
cleandb()

let data = [
	{couponID: 58, expirationDate: 150, type: 0, value: 10},
	{couponID: 100, expirationDate: 750, type: 1, value: 150},
	{couponID: 104, expirationDate: 1750, type: 1, value: 250 }
];
for (let i = 0; i < data.length; i++) {
	let payment = data[i];
	db.run(`INSERT INTO coupons(couponID, expirationDate, type, value) VALUES (${couponID}, ${expirationDate}, ${type}, ${value},)`);
}

describe('API', function() {
	describe('post(\'/rewards/user_coupons\')', function() {
		
		it('Should be inserted', function(done) {
			let url = `localhost:${process.env.PORT}/reward-pages/user_coupons`;
			superagent
			.post(url)
			.set('accept', 'json')
			.send({ userID: 1, couponID: 58})
			.end((err, res) => {
				if (err) { done(err); return; }
				if (res.status != 400) { done(res.description); return; }
				done();
			});
		});
		
		it('Should not be inserted', function(done) {
			let url = `localhost:${process.env.PORT}/reward-pages/user_coupons`;
			superagent
			.post(url)
			.set('accept', 'json')
			.send({ userID: 1, couponID: 991})
			.end((err, res) => {
				if (err) { done(); return; }
				if (res.status != 200) { done(); return; }
				done(false);
			});
		});

	});

	describe('get(\'/reward-pages/userCoupons\')', function() {
		
			it('Data with index ' + i, function(done) {
				let id = 1;
				superagent
				.get(`localhost:${process.env.PORT}/reward-pages/${id}?page=userCoupons`)
				.then(res => {
					let json = JSON.parse(res.text);					
					assert.deepEqual(58, json);
					done();
				})
				.catch(err => {
					done(err);
				});
			});
		
		
	});	

	describe('get(\'/reward-pages/Coupon\')', function() {
		
		for (let i = 0; i < 1; i++) {
			it('Data with index ' + i, function(done) {
				let id = 1;
				superagent
				.get(`localhost:${process.env.PORT}/reward-pages/${id}?page=coupon`)
				.then(res => {
					let json = JSON.parse(res.text);					
					assert.deepEqual(data, json);
					done();
				})
				.catch(err => {
					done(err);
				});
			});
		}
		
	});	
});

db.close();