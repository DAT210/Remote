# Rewards


Reward Service
Reward API

The Reward Service is used to reward customers. Through deals, coupons and games!

Coupons: 
Coupons will give a user a discount on the next purchase, which will be available in the Payment menu. 
Coupons have expiration dates, they are of a type (percentage or flat) and a value associated with the type. 

Installing / Getting started
You can run the Reward service with Docker or Node.


Docker

# Navigate to project directory
cd project_directory
# Create .env file
cp ./env/test.env ./env/test.env
# Insert your keys
# The PORT variable will be ignored when the service is ran with Docker
vi ./env/prod.env
# Create a Docker image called paymentservice
docker build -t paymentservice --build-arg port=<port> .
# Run the image in detached mode
docker run -p <running_port>:<port> -d paymentservice
Node

# Navigate to project directory
cd project_directory
# Install dependencies
npm install
# Create .env file
node tools/setup_env.js
# Set environment variable
	# Windows Powershell
    	$env:NODE_ENV = "<name>"
	# Windows CMD
	SET NODE_ENV=<name>
# Run the server
node src/app.js

# If you're using a linux terminal you run
# it when you set the environment variable
NODE_ENV=<name> node src/app.js
You can now connect to the service at localhost:port.

Developing
Built With
Javascript, NodeJS, ExpressJS and Nunjucks

Prerequisites
You need NodeJS to develop this service. Built with version 8.12.0.

Setting up Dev
# Clone repository from github
git clone https://github.com/DAT210/Rewards.git
# Navigate to it
cd Payment/
# Install dependencies
npm install
# Create dev environment file
	cp ./env/default.dev ./env/dev.env
	vi ./env/dev.env
# Or
	node tools/setup_env.js
Deploying / Publishing
give instructions on how to build and release a new version In case there's some step you have to take that publishes this project to a server, this is the right time to state it.

packagemanager deploy your-project -s server.com -u username -p password
And again you'd need to tell what the previous code actually does.

Configuration
Environment file
You can configure which port the service runs on and which database you use in an environment file.This file is also used to store your API keys. It should be placed in the /env/ file, and the name needs to end in .env. Example file. If you've installed node, you can also generate one using the node tools/setup_env.js command.

Command line arguments
Arguments:

--redirect_console_log , redirects output from all console.log() calls from stdout to nothing.
Tests
Before running any tests you need to set up a /env/test.env file with your api keys.

Linux users can run npm test

Windows users have to use PowerShell and run it using $env:NODE_ENV = "test" ; npm run-script test-windows

If you're using Git BASH the command is export NODE_ENV="test" ; npm run-script test-windows

If you're not using a linux terminal Windows PowerShell, you can still run the tests. You need to

Set the environment variable NODE_ENV to "test".
Start the server (node src/app.js)
Start the tests (written using the mocha framework.
Style guide
Explain your code style and show how to check it.

to test style run jshint in command window

uses standard jshint style

# API Reference
The API doesn't require any authentication (yet).

Endpoints:

GET /User-Coupons/:id
GET /Coupons/:CouponID
POST /Coupons/

Details:

GET /User-Coupons/:id
Returns information about which coupons the user is in possesion of.

Status code 200 => Coupon exists and information was returned.
Status code 404 => Coupon doesn't exist and no information was returned.
Response format
	{
	UserID: int
  	Coupons: []
	}

GET /User-Coupons/:id
Returns information about the coupon the user is in possesion of.

Status code 200 => Coupon exists and information was returned.
Status code 404 => Coupon doesn't exist and no information was returned.
Response format
	{
	CouponID: int
	ExpirationDate: text
	Type: int
	Value: int

	}


POST /Coupons/
Used to add Coupons.
Request body format:
	{
		"UserID":	int,
		"Type":		int,
		"Value":	int,
		
	}
Database
This service is built with SQLite, using the sqlite3 package. Database version is based on the version on your system. If you don't have SQLite on your system, version 3.15.0 will be used. You can download SQLite here.

The database consists of these tables: UserCoupons :

UserID INTEGER,
 Coupons INTEGER,
 Amount INTEGER,
 Used INTEGER,
 FOREIGN KEY (Coupons) REFERENCES Coupon (Coupons)
 PRIMARY KEY (UserID, CouponID)
);

Coupons[] each coupon is related to the user, a coupon can have multiple charges/uses, in which case Amount 
and Used is used to determine these factors

The Coupons themselves looks like this: 
CREATE TABLE Coupon (
 CouponID INTEGER PRIMARY KEY AUTO_INCREMENT,
 ExpirationDate TEXT,
 Type INTEGER,
 Value INTEGER,
 
);

Where the Expiration Date is in string format, and then theres the type and value that's used for calculating final price

We also have a table for Used Coupons, which is used for internal statistics.
CREATE TABLE UsedCoupons (
 UserID INTEGER PRIMARY KEY,
 CouponID INTEGER,
 ExpirationDate TEXT,
 DateOfUse TEXT,
 Type INTEGER,
 Value INTEGER
 );

this table includes all of the previous data and additionally the date of use (DateOfUse). 


Licensing
State what the license is and how to find the text version of the license.