const path = require('path');

let envfile = process.env.NODE_ENV;

if (envfile === undefined) {
	console.log('You need to set the NODE_ENV variable to run this program.');
	console.log('Rename the /env/default.env file to match your NODE_ENV variable, and fill in missing api keys');
	return;
}

require('dotenv').config({
	path: path.resolve(__dirname, `../env/${envfile}.env`)
});

// List all envVariables that are going to be tested
let requiredEnv = [
  'PORT','DATABASE_MEALDEALS_NAME'
];

var envVarTests = true;

// Tests all requiredEnv vars if they are empty and if they are longer than 0 length
let unsetEnv = requiredEnv.filter((env) => !(process.env[env] !== ""));
if (unsetEnv.length > 0) {
  console.log("Required ENV variables are not set: [" + unsetEnv.join(', ') + "]");
  envVarTests = false;
  return;
}

// tests that the database file is listed as .db
let DbTest = process.env.DATABASE_MEALDEALS_NAME;
if(!DbTest.endsWith(".db")){
	console.log("wrong database link");
	return;
}

const nunjucks = require('nunjucks');
const express = require('express');
const bodyParser = require('body-parser');

const sqlite3 = require('sqlite3').verbose();

let db = new sqlite3.Database(path.resolve(__dirname, `../db/${process.env.DATABASE_MEALDEALS_NAME}`));


db.run('CREATE TABLE IF NOT EXISTS TokensTable(UserID INTEGER PRIMARY KEY, Tokens INTEGER, NextPlayDate TEXT)',function(err){
	if(err){
		console.log(err.message);
	}
});
db.run('CREATE TABLE IF NOT EXISTS MealDeals(DealID INTEGER PRIMARY KEY, Price INTEGER, Name TEXT, StartDate TEXT, EndDate TEXT)', function(err) {
	if (err) {
		console.log(err.message);
	}
});

db.run('CREATE TABLE IF NOT EXISTS Courses(DealID INTEGER, CourseID INTEGER, NumberOfItems INTEGER, FOREIGN KEY(DealID) REFERENCES MealDeals(DealID), PRIMARY KEY(DealID, courseID))', function(err) {
	if (err) {
		console.log(err.message);
	}
});

const app = express();
const port = process.env.PORT;

// Configures express to use nunjucks as template engine
nunjucks.configure(__dirname, {
	autoescape: true,
	express: app
});

app.use(express.static(__dirname, + '/static'));

// Example route
app.get('/', function (req, res) {

	res.render('reward.html');

});

/*
	Create db entry for orderid.
*/
app.use(bodyParser.json());
/*
	Create MealDeal

	Response format, JSON
	Valid response with data has status code 200.
	Code 400 means that something went wrong 
	Code 404 means that something is missing
	
	{
		dealID: "",
		price: "",
		name: "",
		startDate: "",
		endDate: "",
		"courses": []
		
	}
*/
function postDeal(req,res){
	let json = req.body;
	let resp = JSON.parse('{}');
	if (!(json.courses == undefined)){
		//course existens test
		descriptionTestVar = false;

		//test if products exists insert here
		dbMealDeal(req,res)
		
	}else{
		resp.description = "course: " + resp.description + " does not exist" 
		res.status(400).json(resp)
	}
}

function isInt(value) {
  var x;
  return isNaN(value) ? !1 : (x = parseFloat(value), (0 | x) === x);
}
function isString(value){
	console.log(/\S/.test(value))
	if(!(/\S/.test(value)))return true;
	else if(value === undefined)return true;
	
	return false;
}

function dbMealDeal(req,res){
	let json = req.body;
	let mealdealid = parseInt(json.dealID, 10);
	let price = parseInt(json.price, 10);
	let name = json.name;
	let startdate = json.startDate;
	let enddate = json.endDate;
	let test = false;
	let inputError = false;
	if (isInt(mealdealid) == false) {
		inputError = true;
	}else if(isInt(price) == false){
		inputError = true;
	}else if (isString(name)){
		inputError = true;
	}else if (isString(startdate)){
		inputError = true;
	}else if (isString(enddate)){
		inputError = true;
	}
		
	if(json.courses.length > 0 ){
		for(let counter = 0; counter < json.courses.length; counter++){
			console.log(isInt(json.courses[counter].numberOfItems))
			if(isInt(json.courses[counter].numberOfItems) == false) {
				inputError = true;
			}
			console.log(isInt(json.courses[counter].courseID))
			if(isInt(json.courses[counter].courseID) 	 == false){
				inputError = true;
			}
		}
	}
	if (inputError){
		let resp = JSON.parse('{}')
		resp.message = "input is wroung";
		res.status(400).json(resp);
		return;
	}
	db.run(`INSERT INTO MealDeals(DealID, Price, Name, StartDate, EndDate) VALUES (${mealdealid}, ${price}, "${name}", "${startdate}", "${enddate}")`, function(err) {
		if (err) {
			let resp = JSON.parse('{}');
			console.log(err.message);			
			resp.message = "Could not create the MealDeal";
			resp.description = err.message +  " insert into";
			test = true;
			res.status(400).json(resp);
		} else {
			if(!test){
				insertCourses(res,json);
			}
		}
	});
}
/*
	inserts the connections
*/
function insertCourses(res,json){
	let courses = json.courses;
	let mealdealid = parseInt(json.dealID, 10);
	var BreakException = {};
	for(let counter = 0; counter < courses.length; counter++){
		courseid = parseInt(courses[counter].courseID);
		numberofitems = parseInt(courses[counter].numberOfItems);
		db.run(`INSERT INTO Courses(DealID, CourseID, NumberOfItems) VALUES (${mealdealid}, ${courseid}, ${numberofitems})`, function(err) {
			if (err) {
				let resp = JSON.parse('{}');
				console.log(err.message);
				resp.message = "Could not create the MealDeals_Connection";
				resp.description = err.message + " insert into MealDeals_Connection";
				res.status(400).json(resp);	
			}else{
				res.status(201).end();
			}
		});
	}
}

/*
	Get status about a reward

	Response format, JSON
	Valid response with data has status code 200.
	Code 400 means that somethig went wrong 
*/

function getDeal(res,id){
	let resp = JSON.parse('{}');
	db.get(`SELECT * FROM MealDeals WHERE DealID = ${id}`, function(err, row){
		if(err){
			resp.message = "Could not get MealDeals";
			resp.description = err.message;
			res.status(400).json(resp);
		}else{
			if(!(row === undefined)){
				console.log(row)
				db.all(`SELECT * FROM Courses WHERE DealID = ${row.DealID}`, function(err2,rows2){
					if(err2){
						resp.message = "Could not get Courses";
						resp.description = err2.message;
						res.status(400).json(resp);
					}else{
						if (rows2.length >0){
							all_CourseID = [];
							row.Courses = []
							for(let counter = 0; counter < rows2.length; counter++){
								row.Courses[counter] = {"courseID": rows2[counter].CourseID, "numberOfItems": rows2[counter].NumberOfItems };
							}
							
							res.status(200).json({
								"dealID": row.DealID,
								"price": row.Price,
								"name": row.Name,
								"startDate": row.StartDate,
								"endDate": row.EndDate,
								"courses": row.Courses
							});
						}else{
							resp.message = "No Course with mealDealid";
							res.status(404).json(resp);
						}
					}
				});
			}else{
				resp.message = "No MealDeal with this id";
				res.status(404).json(resp);
			}
		}
	});
}

/*
	Gets the course

	Response format, JSON
	Valid response with data has status code 200.
	Code 404 means that the course does not exist
*/

app.post('/rewards', function(req, res){
	let page = req.body.page;
	if (!['mealDeal'].includes(page)){
		console.log('Not a valid page');
		res.status(404).end();
		return
	}
	console.log(page)
	if (page === 'mealDeal'){
		postDeal(req,res);
	}
});

app.get('/reward-pages/:id', function(req, res){
	let page = req.query.page;
	if (!['tokens','courses','mealDeal', 'nextPlayDate'].includes(page)){
		console.log('Not a valid page');
		res.status(404).end();
		return
	}
	
	let id = parseInt(req.params.id, 10);
	if (page === 'tokens'){
		getTokens(res,id);
	}else if(page === 'mealDeal'){
		getDeal(res,id);
	}else if(page === 'mealDealConn'){
		mealDealConn(res);
	}else if(page === 'nextPlayDate'){
		getNextPlayDate(res,id)
	}
});

/*
	Gets Game tokens

	Response format, JSON
	Valid response with data has status code 200.
	Code 400 means that somethig went wrong 
*/

function getTokens(res, id){
	
	db.get(`SELECT Tokens, NextPlayDate from TokensTable WHERE UserID = ${id}`, function(err, row){
		if(err){
			let resp = JSON.parse('{}');
			resp.message = "Could not get User";
			res.status(400).json(resp);
		}
		else{
			if (!(row == undefined)){
				res.status(200).json({
					"tokens": row.Tokens,
					"nextPlayDate": row.NextPlayDate
				});
			}else{
				db.run(`INSERT INTO TokensTable(UserID, Tokens, NextPlayDate) VALUES (${id}, 0, "")`, function(err){
					if(err){
						let resp = JSON.parse('{}');
						resp.message = "Could not create User";
						res.status(400).json(resp);
					}else{
						res.status(200).json({
							"tokens": '0',
							"nextPlayDate": ""
							});
					}
				});
			}
		}	
	});
}

/*
	Update Game tokens 

	Response format, JSON
	Valid response with data has status code 200.
	Code 400 means that somethig went wrong 
	{
		"userID":  Int
		"tokens":  Int
	}
*/
app.patch('/addTokens', function(req,res){
	let json = req.body;
	let userid = parseInt(json.userID, 10);
	let tokens = parseInt(json.tokens, 10);
	if (!(json.nextPlayDate === undefined)){
		patchNextPlayDate(req,res);
	}
	db.get(`SELECT Tokens FROM TokensTable WHERE UserID = ${userid}`, function(err,row){
		if(err){
			console.log(err.message);			
			let resp = JSON.parse('{}');
			resp.message = "Could not get information from database";
			resp.description = err.message;
			res.status(400).json(resp);
		}else{	
			if(row === undefined){
				let resp = JSON.parse('{}');
				resp.message = "User does not exist";
				res.status(404).json(resp);
				return;
			}
			let TokensInput = row.Tokens + tokens;
			db.run(`UPDATE TokensTable SET Tokens = ${TokensInput} WHERE UserID = ${userid}`,function(err){
				if (err){
					console.log(err.message);			
					let resp = JSON.parse('{}');
					resp.message = "Could not update Database";
					resp.description = err.message;
					res.status(400).json(resp);
				}else{
					res.status(200).end();
				}
			});
		}
	})
});

function getNextPlayDate(res,id){
	db.get(`SELECT NextPlayDate From TokensTable WHERE UserID = ${id}`, function(err, row){
		if (err){
			console.log(err.message);
			let resp = JSON.parse('{}');
			resp.message = "Could not open database";
			resp.description = err.message;
			res.status(400).json(resp);
		}else{
			if (row === undefined){
				let resp = JSON.parse('{}');
				resp.message = "User does not exist";
				res.status(404).json(resp);
			}else{
				res.status(200).json({"gameTime": row.GameTime});
			}
		}
	});
}

function patchNextPlayDate(req,res){
	userid = parseInt(req.body.userID,10)
	db.run('UPDATE TokensTable SET NextPlayDate = ${req.body.nextPlayDate} WHERE UserID = ${userid}', function(err){
			if (err){
				console.log(err.message);			
				let resp = JSON.parse('{}');
				resp.message = "Could not update Database";
				resp.description = err.message;
				res.status(400).json(resp);
			}else{
				res.status(200).end();
			}
		)
}
/*
	test if the server can start 
*/
try{
	if(envVarTests){
		app.listen(port, () => console.log(`Reward service listening on port ${port}!`));
	}else{
		console.log("There is something wronge with the env variables. plese check before trying again");
	}
}catch(err){
	console.log("Server can not start, check ENV variable port, it should be an INT between 0 =< port > 65536");
}
	