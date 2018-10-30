# Rewards
> Rewards API

The Reward Service can be used to make deals and cupons.

## Installing / Getting started

You can run the Reward service with Docker or Node.

TODO: /env/default.env doesn't exist
Copy and rename the /env/default.env file and fill in your keys.
You .env file should be named prod.env if you're running with Docker.
The service determines which .env file to use based on your NODE_ENV environment variable.
It is currently not possible to run the service without a environment file.

Docker
```shell
# Navigate to project directory
cd project_directory
# Create .env file
cp ./env/default.env ./env/prod.env
# Insert your keys
vi ./env/prod.env
# Create a Docker image called rewardsservice
docker build -t rewardsservice .
# Run the image at <port> in detached mode
docker run -p <port>:3000 -d rewardsservice
```

Node
```shell
# Navigate to project directory
cd project_directory
# Install dependencies
npm install
# Create .env file
TODO: tools/setup_env.js doesn't exist
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
```

You can now connect to the service at localhost:port.

## Developing

### Built With
Javascript, NodeJS, ExpressJS and Nunjucks

### Prerequisites
You need [NodeJS](https://nodejs.org) to develop this service. Built with version 8.12.0.

### Setting up Dev

```shell
# Clone repository from github
git clone https://github.com/DAT210/Rewards.git
# Navigate to it
cd Rewards/
# Install dependencies
npm install
# Create dev environment file
	cp ./env/default.dev ./env/dev.env
	vi ./env/dev.env
# Or
	node tools/setup_env.js
```

### Deploying / Publishing
give instructions on how to build and release a new version
In case there's some step you have to take that publishes this project to a
server, this is the right time to state it.

```shell
packagemanager deploy your-project -s server.com -u username -p password
```

And again you'd need to tell what the previous code actually does.


## Configuration

### Environment file

You can configure which port the service runs on and which database you use in an environment file.This file is also used to store your API keys. It should be placed in the /env/ file, and the name needs to end in .env. [Example file](env/default.env). If you've installed node, you can also generate one using the ```node tools/setup_env.js``` command.

### Command line arguments

TODO: This argument doesn't exist
Arguments:
- ```--redirect_console_log``` , redirects output from all console.log() calls from stdout to nothing. 

## Tests

TODO: There are no tests
Before running any tests you need to set up a /env/test.env file with 
your api keys.

Linux users can run `npm test`

Windows users have to use PowerShell and run it using `$env:NODE_ENV = "test" ; npm run-script test-windows`

If you're using Git BASH the command is `export NODE_ENV="test" ; npm run-script test-windows`

If you're not using a linux terminal Windows PowerShell, you can still run the tests. You need to
- Set the environment variable NODE_ENV to "test".
- Start the server (`node src/app.js`)
- Start the tests (written using the [mocha](https://mochajs.org/) framework.

## Style guide
Explain your code style and show how to check it.

to test style run
	jshint <file to test> 
in command window

uses standard jshint style
## API Reference

The API doesn't require any authentication (yet).

### Endpoints:

GET /reward-pages/:orderId?page=["tokens", "mealDeal"]

patch /subTokens

patch /addTokens

TODO: Show complete json format
post /rewards   (in the json you need an "page": string) ["mealDeal"]

### Details:

#### GET /reward-pages/:Id?page=["tokens", "mealDeal"]
  Returns the information connected with the request
   ?page=
      tokens => gives information about number of tokens of the user
      mealDeal => gives information about a mealDeal
            Responnse format
            {
              "dealID":      int,
              "price":       int,
              "name":        string,
              "startDate":   string,
              "endDate:      string,
              "courses": [
                  {
                      "courseID": int,
                      "numberOfItems": int
                  }
                  ...
              ]
            }

#### patch /subTokens
  subtracts an amount of tokens from a user
  input format
  {
    "userID"
    "tokens"
  }
  
#### patch /subTokens
  adds an amount of tokens from a user
  input format
  {
    "userID"
    "tokens"
  }
  
#### post /rewards?=["mealdeal"]
mealdeal => makes a new mealDeal
  input{
    "page": string,
    "dealID": int,
    "price": int,
    "name": string,
    "startDate": string,
    "endDate": string,
    "courses": [{
          "courseID": int,
          "numberOfItems": int
    }
          ...
    ]
    
  }

## Database

This service is built with [SQLite](https://www.sqlite.org/), using the [sqlite3 package](https://www.npmjs.com/package/sqlite3). Database version is based on the version on your system. If you don't have SQLite on your system, version 3.15.0 will be used. You can download SQLite [here](https://www.sqlite.org/download.html).

The database has 3 table:

TokensDB, with columns:
- UserID	INTEGER PRIMARY KEY
- Tokens	INTEGER
- GameTime		TEXT

MealDeals, with columns:
- DealID INTEGER PRIMARY KEY
- Price INTEGER
- Name TEXT
- StartDate TEXT
- EndDate TEXT

Courses, with columns:
- DealID INTEGER
- CourseID INTEGER
- NumberOfItems INTEGER
FOREIGN KEY(DealID)
REFERENCES MealDeals(DealID)
PRIMARY KEY(DealID, CourseID)


## Licensing

State what the license is and how to find the text version of the license.
