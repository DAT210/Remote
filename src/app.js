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

const sqlite3 = require('sqlite3').verbose();

let db = new sqlite3.Database(':memory:');//path.resolve(__dirname, `../db/${process.env.DATABASE_MEALDEALS_NAME}`));

db.run('CREATE TABLE IF NOT EXISTS MealDeals(Deal_Id INTEGER PRIMARY KEY, Price INTEGER, Name TEXT, Start_Date TEXT, End_Date TEXT)', function(err) {
	if (err) {
		console.log(err.message);
	}
});

db.run('CREATE TABLE IF NOT EXISTS Products(Product_Id INTEGER PRIMARY KEY)', function(err) {
	if (err) {
		console.log(err.message);
	}
});

db.run('CREATE TABLE IF NOT EXISTS MealDeals_Connection(Deal_Id INTEGER Product_Id INTEGER, Row_Id INTEGER PRIMARY KEY)', function(err) {
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
app.post('/reward/:mealDealId', function(req, res) {
	
	// Retrieve order information from Orders service,
	// or get in from the request.
	let mealdealid = parseInt(req.params.mealDealId, 10);
	console.log("Inserting new MealDeal " + mealdealid);	

	db.run(`INSERT INTO MealDeals(Deal_Id, Price, Name, Start_Date, End_Date) VALUES (${mealdealid}, 0, "0", "0", "0")`, function(err) {
		if (err) {
			console.log(err.message);			
			let resp = JSON.parse('{}');
			resp.message = "Could not create the payment";
			resp.description = err.message;
			res.status(400).json(resp);
			
		} else {
			res.status(201).end();
		}
	});
	let products = req.params.products;
	console.log(req.params)
	products.forEach(function(product){
			
		testproduct = parseInt(product,10)
		db.run(`INSERT INTO MealDeals_Connection(Deal_Id, Product_Id) VALUES (${mealdealid}, ${testproduct})`, function(err) {
			if (err) {
				console.log(err.message);
				let resp = JSON.parse('{}');
				resp.message = "Could not create the payment";
				resp.description = err.message;
				res.status(400).json(resp);
		
			} else {
				res.status(201).end();
			}
		});
	});
});

// make a product in Products
app.post('/reward/prod/:productId', function(req, res) {
		
	// Retrieve order information from Orders service,
	// or get in from the request.
	let productid = parseInt(req.params.productId, 10);
	console.log("Inserting new Product " + productid);	
	
	db.run(`INSERT INTO Products(Product_Id) VALUES (${productid})`, function(err) {
		if (err) {
			console.log(err.message);			
			let resp = JSON.parse('{}');
			resp.message = "Could not create the Product";
			resp.description = err.message;
			res.status(400).json(resp);
			
		} else {
			res.status(201).end();
		}
	});
});

app.get('/reward/:mealDealId', function(req, res){
	
	let mealdealid = parseInt(req.params.mealDealId, 10)
	
	db.get(
	`SELECT * FROM MealDeals
	JOIN MealDeals_Conection ON MealDeals.Deal_Id = Deal_Id 
	JOIN Products ON MealDeals_Connection.Product_Id = Product_Id`, function(err){
		if (err) {
			console.log(err.message);			
			let resp = JSON.parse('{}');
			resp.message = "Could not create the Product";
			resp.description = err.message;
			res.status(400).json(resp);
			
		} else {
			res.status(201).end();
		}
	});
});

// sends all products listed in the db Products
app.get('/reward/prod/:productId', function(req, res){
	
	let productid = parseInt(req.params.productId, 10);
	
	db.get(`SELECT * from Products`)
});


/*
	test if the server can start 
*/
try{
	if(envVarTests){
		app.listen(port, () => console.log(`Payment service listening on port ${port}!`));
	}else{
		console.log("There is something wronge with the env variables. plese check before trying again");
	}
}catch(err){
	console.log("Server can not start, check ENV variable port, it should be an INT between 0 =< port > 65536");
}
	