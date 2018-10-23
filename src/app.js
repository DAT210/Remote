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


db.run('CREATE TABLE IF NOT EXISTS TokensDB(UserId INTEFER PRIMARY KEY, Tokens INTEGER, GameTime TEXT)',function(err){
	if(err){
		console.log(err.message);
	}
});
db.run('CREATE TABLE IF NOT EXISTS MealDeals(DealId INTEGER PRIMARY KEY, Price INTEGER, Name TEXT, StartDate TEXT, EndDate TEXT)', function(err) {
	if (err) {
		console.log(err.message);
	}
});

db.run('CREATE TABLE IF NOT EXISTS Courses(DealId INTEGER, CourseId INTEGER, NumberOfItems INTEGER, FOREIGN KEY(DealId) REFERENCES MealDeals(DealId), PRIMARY KEY(DealId, courseId))', function(err) {
	if (err) {
		console.log(err.message);
	}
});

db.run('CREATE TABLE IF NOT EXISTS MealDeals_Connection(DealId INTEGER, CourseId INTEGER, RowId INTEGER PRIMARY KEY)', function(err) {
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
		dealId: "",
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


function dbMealDeal(req,res){
	let json = req.body;
	let mealdealid = parseInt(json.dealId, 10);
	let price = parseInt(json.price, 10);
	let name = json.name;
	let startdate = json.startDate;
	let enddate = json.endDate;
	let test = false;
	console.log(`INSERT INTO MealDeals(DealId, Price, Name, StartDate, EndDate) VALUES (${mealdealid}, ${price}, "${name}", "${startdate}", "${enddate}")`)
	db.run(`INSERT INTO MealDeals(DealId, Price, Name, StartDate, EndDate) VALUES (${mealdealid}, ${price}, "${name}", "${startdate}", "${enddate}")`, function(err) {
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
	let mealdealid = parseInt(json.dealId, 10);
	for(let counter = 0; counter < courses.length; counter++){
		courseid = parseInt(courses[counter].courseId);
		numberofitems = parseInt(courses[counter].numberOfItems);
		db.run(`INSERT INTO Courses(DealId, CourseId, NumberOfItems) VALUES (${mealdealid}, ${courseid}, ${numberofitems})`, function(err) {
			if (err) {
				let resp = JSON.parse('{}');
				console.log(err.message);
				resp.message = "Could not create the MealDeals_Connection";
				resp.description = err.message + " insert into MealDeals_Connection";
				res.status(400).json(resp);
				break;
			}
			else{
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
	db.get(`SELECT * FROM MealDeals WHERE DealId = ${id}`, function(err, row){
		if(err){
			resp.message = "Could not get MealDeals";
			resp.description = err.message;
			res.status(400).json(resp);
		}else{
			if(!(row === undefined)){
				db.all(`SELECT * FROM Courses WHERE DealId = ${row.DealId}`, function(err,rows2){
					if(err){
						resp.message = "Could not get Courses";
						resp.description = err.message;
						res.status(400).json(resp);
					}else{
						if (rows2.length >0){
							all_CourseId = [];
							rows2.forEach(function(row2){
							all_CourseId.push([row2.CourseId,row2.NumberOfItems]);
						});
							rows2[0].Course_Id = all_CourseId;
							res.status(200).json(rows2[0]);
						}else{
							resp.message = "No Course with mealDealid";
							resp.description = err.message;
							res.status(404).end();
						}
					}
				});
			}else{
				resp.message = "No MealDeal with this id";
				resp.description = err.message;
				res.status(404).end();
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

function getCourse(res,id){
	
	db.get(`SELECT * FROM Courses WHERE Course_Id = ${id}`, function(err, row){
		if (err){
			let resp = JSON.parse('{}');
			resp.message = "Could not get the course";
			resp.description = err.messagepo;
			res.status(400).json(resp);
		} else{
			if (row == undefined){
				let resp = JSON.parse('{}');
				resp.message = "Course does not exsist";
				res.status(404).json(resp);
			}
			res.status(200).json(row);
		}
	});
}

app.post('/rewards', function(req, res){
	let page = req.body.page;
	if (!['courses','mealDeal'].includes(page)){
		console.log('Not a valid page');
		res.status(404).end();
		return
	}
	console.log(page)
	if (page === 'mealDeal'){
		postDeal(req,res);
	}else if(page === 'courses'){
		postCourse(req,res);
	}
});

app.get('/reward-pages/:id', function(req, res){
	let page = req.query.page;
	if (!['tokens','courses','mealDeal'].includes(page)){
		console.log('Not a valid page');
		res.status(404).end();
		return
	}
	
	let id = parseInt(req.params.id, 10);
	if (page === 'tokens'){
		getTokens(res,id);
	}else if(page === 'courses'){
		getCourse(res,id);
	}else if(page === 'mealDeal'){
		getDeal(res,id);
	}else if(page === 'mealDealConn'){
		mealDealConn(res);
	}
});

/*
	Gets Game tokens

	Response format, JSON
	Valid response with data has status code 200.
	Code 400 means that somethig went wrong 
*/

function getTokens(res, id){
	//ID = parseInt(req.params.id,10);
	
	db.get(`SELECT Tokens from TokensDB WHERE UserId = ${id}`, function(err, row){
		if(err){
			let resp = JSON.parse('{}');
			resp.message = "Could not get User";
			res.status(400).json(resp);
		}
		else{
			if (!(row == undefined)){
				res.status(200).json(row);
			}else{
				db.run(`INSERT INTO TokensDB(UserId, Tokens) VALUES (${id}, 0)`, function(err){
					if(err){
						let resp = JSON.parse('{}');
						resp.message = "Could not create User";
						res.status(400).json(resp);
					}else{
						res.status(200).json({
							"UserId": id,
							"Tokens": '0'
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
		"user_Id Int"
		"tokens "
	}
*/
app.patch('/addTokens', function(req,res){
	let json = req.body;
	let userid = parseInt(json.UserId, 10);
	let tokens = parseInt(json.Tokens, 10);
	db.get(`SELECT Tokens FROM TokensDB WHERE UserId = ${userid}`, function(err,row){
		if(err){
			console.log(err.message);			
			let resp = JSON.parse('{}');
			resp.message = "Could not get information from database";
			resp.description = err.message;
			res.status(400).json(resp);
		}else{	
			if(row === undefined){
				let resp = JSON.parse('{}');
				resp.message = "User does not exist"
				res.status(404).json(resp);
				return;
			}
			let TokensInput = row.Tokens + tokens;
			db.run(`UPDATE TokensDB SET Tokens = ${TokensInput} WHERE UserId = ${userid}`,function(err){
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

app.patch('/subTokens', function(req, res){
	let json = req.body;
	let userid = parseInt(json.UserId, 10);
	let tokens = parseInt(json.Tokens, 10);
	db.get(`SELECT Tokens FROM TokensDB WHERE UserId = ${userid}`, function(err,row){
		if(err){
			console.log(err.message);			
			let resp = JSON.parse('{}');
			resp.message = "Could not get information from database";
			resp.description = err.message;
			res.status(400).json(resp);
		}else{	
			if(row === undefined){
				let resp = JSON.parse('{}');
				resp.message = "User does not exist"
				res.status(404).json(resp);
				return;
			}
			let TokensInput = row.Tokens - tokens;
			db.run(`UPDATE TokensDB SET Tokens = ${TokensInput} WHERE UserId = ${userid}`,function(err){
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
	