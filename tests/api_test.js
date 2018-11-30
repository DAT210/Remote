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
const sqlite3 = require('sqlite3').verbose();

let db = new sqlite3.Database(path.resolve(__dirname, `../db/${process.env.DATABASE_NAME}`));


let data = [
	{DealID: 1, Price: 200, Name: "THE DEAL", 				StartDate: "2018-10-31T07:11:00", EndDate: "3018-10-31T07:11:00", NumberOfCourses: 2},
	{DealID: 2, Price: 45, 	Name: "This is a Deal", 		StartDate: "2018-10-31T07:11:00", EndDate: "3018-10-31T07:11:00", NumberOfCourses: 2},
	{DealID: 3, Price: 150, Name: "Did You Say Something", 	StartDate: "2018-10-31T07:11:00", EndDate: "3018-10-31T07:11:00", NumberOfCourses: 2}
]
let dataCourse = [
	{DealID: 1, CourseID: 1, NumberOfItems: 1},
	{DealID: 1, CourseID: 2, NumberOfItems: 1},
	{DealID: 2, CourseID: 1, NumberOfItems: 1},
	{DealID: 2, CourseID: 2, NumberOfItems: 1},
	{DealID: 3, CourseID: 1, NumberOfItems: 1},
	{DealID: 3, CourseID: 2, NumberOfItems: 1}
]
let getTokensTest = [
	{userID:1, tokens:0},
	{userID:2, tokens:1},
	{userID:3, tokens:2}
]

describe('testing', function(){
	before(async function(){
		async function cleandb(){
			await new Promise(function(resolve, reject){
				db.run(`DELETE FROM MealDeals`, (err) => resolve());
			});
			await new Promise(function(resolve, reject){
				db.run(`DELETE FROM Courses`, (err) => resolve());
			});
			await new Promise(function(resolve, reject){
				db.run(`DELETE FROM TokensTable`, (err) => resolve());
			});
			await new Promise(function(resolve, reject){
				db.run(`VACUUM`, (err) => resolve());
			});
		}
		await cleandb();
		
		for(let i = 0; i < data.length; i++){
			let rewards = data[i];
			db.run(`INSERT INTO MealDeals(DealID, Price, Name, StartDate, EndDate) VALUES(${rewards.DealID}, ${rewards.Price}, "${rewards.Name}", "${rewards.StartDate}", "${rewards.EndDate}")`, function(err){
				if(err){
					console.log(err);
				}
			});
			for(let j = 0; j < data[i].NumberOfCourses; j++){
				let courses = dataCourse[i*2 +j]
				db.run(`INSERT INTO Courses(DealID, CourseID, NumberOfItems) VALUES(${courses.DealID}, ${courses.CourseID}, ${courses.NumberOfItems})`);
			}
			
		}
		for(let i = 1; i < getTokensTest.length; i++){
			let userid = getTokensTest[i].UserID;
			let tokens = getTokensTest[i].Tokens;
			//console.log("tokense:" + tokens)
			db.get(`SELECT * FROM TokensTable WHERE UserID = ${userid}`, function(err, row){
				db.run(`UPDATE TokensTable SET Tokens = ${tokens} WHERE UserID = ${userid}`, function(){
				})
			});
		}
	});

	describe('API', function(){
		describe('get(\'\rewards\')', function(){
			it('Should be inserted', function(done){
				superagent
				.get(`localhost:${process.env.PORT}/rewards`)
				.then(res => {
					let json = JSON.parse(res.text);
					if(!(json.length == data.length)){
						done("wroung length");
					}else{
						done();
					}
					
				}).catch( e => {
					done(e);
				});
			});
		});
		describe(`patch(\addTokens`, function(){
			for(let i = 1; i < getTokensTest.length; i++){
				let userid = getTokensTest[i].UserID;
				let tokens = getTokensTest[i].Tokens;
				let url = `localhost:${process.env.PORT}/addTokens`
				it('Should uppdate tokens', function(done){
					superagent
					.patch(url)
					.set('Content-Type', 'application/json')
					.send({userID: 1, tokens: 1})
					.end((err,res) => {
						console.log(res)
						if(err) {done(err); return;}
						if (res.status != 201){done(err); return;}
						done();
					})
				});
			}
		});
		describe(`get(\reward-pages\:id?page)`, function(){
			describe('tokens', function(){
				for(let i = 0; i < getTokensTest.length; i++){
					it('Should get tokens', function(done){
						let userid = getTokensTest[i].UserID;
						let answer = getTokensTest[i].Tokens;
						superagent
						.get(`localhost:${process.env.PORT}/reward-pages/${userid}?page=tokens`)
						.then(res =>{
							let json = JSON.parse(res.text);
							console.log(userid + " " + json.tokens)
							if (json.tokens !== answer){
								done("tokens is wrong");
							}else{
							}
						}).catch(e =>{
							done(e);
						});
						if (i = getTokensTest.length + 1){
							done();
						}
					});
				}
			});
		});
	});
	
	after(function(){
		db.close();
	});
});