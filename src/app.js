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
const bodyParser = require('body-parser')

const sqlite3 = require('sqlite3').verbose();

let db = new sqlite3.Database(':memory:');//path.resolve(__dirname, `../db/${process.env.DATABASE_MEALDEALS_NAME}`));


db.run('CREATE TABLE IF NOT EXISTS TokensDB(User_Id INTEFER PRIMARY KEY, Tokens INTEGER)',function(err){
	if(
		console.log(err.message);
	)
});
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

db.run('CREATE TABLE IF NOT EXISTS MealDeals_Connection(Deal_Id INTEGER, Product_Id INTEGER, Row_Id INTEGER PRIMARY KEY)', function(err) {
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

descriptionTestVar = false;
app.post('/reward/:mealDealId', function(req, res) {
	json = req.body
	mealdealid = parseInt(json.deal_Id)
	price = parseInt(json.price)
	name = json.name
	start_date = json.start_Date
	end_date = json.end_Date
	
	//product existens test
	descriptionTestVar = false;
	let resp = JSON.parse('{}');
	json.products.forEach(function(product){
		counter = 0
		db.get(`SELECT * from Products WHERE Product_Id = ${product}`, function(err,row){
			if(err){
					
			}
			else{
			
			}
			if(row == undefined){
				resp.message = "Could not create meal";
				resp.description = resp.description + product;
				descriptionTestVar = true;
			}
			counter++;
			if(counter == json.products.length){
				if (descriptionTestVar){
					resp.description = "product: " + resp.description + " does not exist" 
					res.status(400).json(resp)
				}else{
					dbMealDeal(req,res);
				}
			}
		});	
	});
});
function dbMealDeal(req,res){	
	test = false
	db.run(`INSERT INTO MealDeals(Deal_Id, Price, Name, Start_Date, End_Date) VALUES (${mealdealid}, ${price}, "${name}", "${start_date}", "${end_date}")`, function(err) {
		if (err) {
			console.log(err.message);			
			resp.message = "Could not create the payment";
			resp.description = err.message +  " insert into MealDeals_Connection";
		} else {
			test = true
		}
	});
	console.log(req.body)
	json.products.forEach(function(product){
		
		testproduct = parseInt(product,10)
		db.run(`INSERT INTO MealDeals_Connection(Deal_Id, Product_Id) VALUES (${mealdealid}, ${testproduct})`, function(err) {
			if (err) {
				console.log(err.message);
				resp.message = "Could not create the payment";
				resp.description = err.message + " insert into MealDeals_Connection";
				test = true
			} else {
			}
		});
	});
	if (test){
		res.status(400).json(resp);
	
	}else{
		res.status(201).end();
	}
}

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
	console.log(`SELECT MealDeals.Deal_Id, MealDeals.Price, MealDeals.Name, MealDeals.Start_Date,MealDeals.End_Date,Products.Product_Id FROM MealDeals
	JOIN MealDeals_Connection ON MealDeals.Deal_Id = MealDeals_Connection.Deal_Id 
	JOIN Products ON MealDeals_Connection.Product_Id = Products.Product_Id 
	WHERE MealDeals.Deal_Id = ${mealdealid}`)
	db.all(
	`SELECT MealDeals.Deal_Id, MealDeals.Price, MealDeals.Name, MealDeals.Start_Date,MealDeals.End_Date,Products.Product_Id FROM MealDeals
	JOIN MealDeals_Connection ON MealDeals.Deal_Id = MealDeals_Connection.Deal_Id 
	JOIN Products ON MealDeals_Connection.Product_Id = Products.Product_Id 
	WHERE MealDeals_Connection.Deal_Id = ${mealdealid}`, function(err,rows){
		if (err) {
			console.log(err.message);			
			let resp = JSON.parse('{}');
			resp.message = "Could not create the Product";
			resp.description = err.message;
			res.status(400).json(resp);
			
		} else {
			if (rows.length >0){
				all_ProductId = []
				rows.forEach(function(row){
					all_ProductId.push(row.Product_Id)
				});
				rows[0].Product_Id = all_ProductId
				res.status(200).json(rows[0])
			}else res.status(201).end()
		}
	});
});

app.get('/reward/MealDealsConn', function(req, res){
	db.get(`SELECT * FROM MealDeals_Connection`, function(err,row){
		if(err){
			
		}else{
			res.status(200).json(row)
		}
	});
});
// sends all products listed in the db Products
app.get('/reward/prod/:productId', function(req, res){
	
	let productid = parseInt(req.params.productId, 10);
	
	db.get(`SELECT * from Products`, function(err, row){
		if (err){
		
		} else{
			res.status(200).json(row)
		}
	});
});

app.get('/reward/game_getTokens', function(req, res){
	json = req.body
	db.get(`SELECT Tokens from TokensDB WHERE User_Id = ${json.User_Id}`, function(err, row){
		if(err){
		
		}
		else{
			
			if (row > 0){
				res.status(200).json(row)
			}else{
				db.run(`INSERT INTO TokensDB(User_Id, Tokens) VALUES (${json.User_Id}, 0)`, function(err,row){
					if(err){
						
						//res.status(400).resp
					}else{
						res.status(200).json({
							"User_Id": json.User_Id,
							"Tokens": '0'
						});
					}
				});
			}
		}	
	});
});

/*
	Get status about a payment

	Response format, JSON
	Valid response with data has status code 200.
	Code 404 means the payment doesn't exist
	{
		"User_Id Int"
		"Tokens "
	}
*/

app.put('/reward/game_update', function(req, res){
	
	db.get(`SELECT Tokens FROM TokensDB WHERE USER_Id = $(req.body.User_Id)`, function{
		if(err){
		
		}else{
					
			db.run(`ÙPDATE TokensDB SET Tokens = ${req.body.Tokens}, WHERE User_Id = ${User_Id}`,function(err){
				if (err){
			
					//res.status(400).resp;
				}else{
					res.status(201).end();
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
		app.listen(port, () => console.log(`Payment service listening on port ${port}!`));
	}else{
		console.log("There is something wronge with the env variables. plese check before trying again");
	}
}catch(err){
	console.log("Server can not start, check ENV variable port, it should be an INT between 0 =< port > 65536");
}
	