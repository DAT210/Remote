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


db.run('CREATE TABLE IF NOT EXISTS TokensDB(User_Id INTEFER PRIMARY KEY, Tokens INTEGER)',function(err){
	if(err){
		console.log(err.message);
	}
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
/*
	Create MealDeal

	Response format, JSON
	Valid response with data has status code 200.
	Code 400 means that something went wrong 
	Code 404 means that something is missing
	
	{
		deal_Id: "",
		price: "",
		name: "",
		start_Date: "",
		end_Date: "",
		"products": []
		
	}
*/
descriptionTestVar = false;
app.post('/reward/post_deal', function(req, res) {
	json = req.body;
	mealdealid = parseInt(json.deal_Id, 10);
	price = parseInt(json.price);
	name = json.name;
	start_date = json.start_Date;
	end_date = json.end_Date;
	if (!(json.products == undefined)){
		//product existens test
		descriptionTestVar = false;
		let resp = JSON.parse('{}');
		try {
			json.products.forEach(function(product){
				counter = 0;
				db.get(`SELECT * from Products WHERE Product_Id = ${product}`, function(err,row){
					if(err){
						let resp = JSON.parse('{}');
						console.log(err.message);			
						resp.message = "Product ${product} does not exist";
						resp.description = err.message +  " insert into";
						res.status(404).json(resp);
						throw BreakException;
					}
					else{
						if(row == undefined){
							let resp = JSON.parse('{}');
							resp.message = "Could not create meal";
							resp.description = resp.description + product;
							descriptionTestVar = true;
						}
						counter++;
						// test if one of the rows was empty
						if(counter == json.products.length){
							if (descriptionTestVar){
								resp.description = "product: " + resp.description + " does not exist" 
								res.status(400).json(resp)
							}else{
								dbMealDeal(req,res);
							}
						}
					}

				});	
			});
		}catch(e){
		
		}
	}else{
	}
});
function dbMealDeal(req,res){
	json = req.body;
	test = false;
	db.run(`INSERT INTO MealDeals(Deal_Id, Price, Name, Start_Date, End_Date) VALUES (${mealdealid}, ${price}, "${name}", "${start_date}", "${end_date}")`, function(err) {
		if (err) {
			let resp = JSON.parse('{}');
			console.log(err.message);			
			resp.message = "Could not create the MealDeal";
			resp.description = err.message +  " insert into";
			test = true;
			res.status(400).json(resp);
		} else {
			if(!test){
				try{
					json.products.forEach(function(product){
						counter = 0;
						testproduct = parseInt(product,10);
						db.run(`INSERT INTO MealDeals_Connection(Deal_Id, Product_Id) VALUES (${mealdealid}, ${testproduct})`, function(err) {
							if (err) {
								resp = JSON.parse('{}');
								console.log(err.message);
								resp.message = "Could not create the MealDeals_Connection";
								resp.description = err.message + " insert into MealDeals_Connection";
								res.status(400).json(resp);
								throw BreakException;
							}
							counter++;
							if (counter == json.products.length){
								if(test){
								}else{
									res.status(201).end();
								}
							}
						});
					});
				}catch(e){
						
				}
			}
		}
	});
}
/*
	Makes a product

	Response format, JSON
	Valid response with data has status code 200.
	Code 400 means that somethig went wrong
	
	{
		"ProductId": "10
	}
*/


app.post('/reward/prod/post_product', function(req, res) {
		
	// Retrieve order information from Orders service,
	// or get in from the request.
	json = req.body;
	productid = parseInt(json.ProductId, 10);
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
/*
	Get status about a reward

	Response format, JSON
	Valid response with data has status code 200.
	Code 400 means that somethig went wrong 
*/


app.get('/reward/get_deal/:id', function(req, res){ 
	
	let mealdealid = parseInt(req.params.id, 10);
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
				all_ProductId = [];
				rows.forEach(function(row){
					all_ProductId.push(row.Product_Id);
				});
				rows[0].Product_Id = all_ProductId;
				res.status(200).json(rows[0]);
			}else res.status(404).end();
		}
	});
});
/*
	Gets the connections between MealDeals and Products

	Response format, JSON
	Valid response with data has status code 200.
	Code 400 means that somethig went wrong 
*/
app.get('/reward/MealDealsConn', function(req, res){
	db.all(`SELECT * FROM MealDeals_Connection`, function(err,row){
		if(err){
			let resp = JSON.parse('{}');
			resp.message = "Could not get MealDealsConnention";
			resp.description = err.message;
			res.status(400).json(resp);
		}else{
			res.status(200).json(row);
		}
	});
});
/*
	Gets the product

	Response format, JSON
	Valid response with data has status code 200.
	Code 404 means that the product does not exist
*/

app.get('/reward/prod/:id', function(req, res){
	productid = parseInt(req.params.id, 10);
	
	db.get(`SELECT * FROM Products WHERE Product_Id = ${productid}`, function(err, row){
		if (err){
			let resp = JSON.parse('{}');
			resp.message = "Could not get the product";
			resp.description = err.messagepo;
			res.status(400).json(resp);
		} else{
			if (row == undefined){
				let resp = JSON.parse('{}');
				resp.message = "Product does not exsist";
				res.status(404).json(resp);
			}
			res.status(200).json(row);
		}
	});
});
/*
	Gets Game tokens

	Response format, JSON
	Valid response with data has status code 200.
	Code 400 means that somethig went wrong 
*/


app.get('/reward/game_get_tokens/:id', function(req, res){
	ID = parseInt(req.params.id,10);
	db.get(`SELECT Tokens from TokensDB WHERE User_Id = ${ID}`, function(err, row){
		if(err){
			let resp = JSON.parse('{}');
			resp.message = "Could not get User";
			res.status(400).json(resp);
		}
		else{
			if (!(row == undefined)){
				res.status(200).json(JSON.stringify(row));
			}else{
				db.run(`INSERT INTO TokensDB(User_Id, Tokens) VALUES (${ID}, 0)`, function(err){
					if(err){
						let resp = JSON.parse('{}');
						resp.message = "Could not create User";
						res.status(400).json(resp);
					}else{
						res.status(200).json(JSON.stringify({
							"User_Id": json.User_Id,
							"Tokens": '0'
						}));
					}
				});
			}
		}	
	});
});

/*
	Update Game tokens 

	Response format, JSON
	Valid response with data has status code 200.
	Code 400 means that somethig went wrong 
	{
		"User_Id Int"
		"Tokens "
	}
*/

app.put('/reward/game_update', function(req, res){
	json = req.body;
	let userid = parseInt(json.User_Id, 10);
	let tokens = parseInt(json.Tokens, 10);
	db.get(`SELECT Tokens FROM TokensDB WHERE USER_Id = ${userid}`, function(err,row){
		if(err){
			console.log(err.message);			
			let resp = JSON.parse('{}');
			resp.message = "Could not get information from database";
			resp.description = err.message;
			res.status(400).json(resp);
		}else{	
			TokensInput = row.Tokens - tokens;
			db.run(`UPDATE TokensDB SET Tokens = ${TokensInput} WHERE User_Id = ${userid}`,function(err){
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
	