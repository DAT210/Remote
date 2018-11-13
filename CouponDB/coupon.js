module.exports = class Handlers{
	constructor(db){
		this.db = db;
	}


	//makes and adds a coupon to user 
	post_user_coupon(req,res){
		let json = req.body;
		addCoupon(req, res,this.db);
	}

	//gives user a made coupon
	post_user_coupons(req,res){
		let json = req.body;
		add2User(json,res,this.db, true);
	}
// Makes a coupon
	post_coupons(req,res){
		MakeCoupon(req,res,this.db, true);
	}

	patch_use_coupon(req,res){
		let json = req.body;

		//TODO: error respons
		if(json.UserID === undefined || json.CouponID === undefined){
			resp.message = ("trenger UserID og CouponID");
			res.status(400).end(resp)
		} 
		else if (json.UserID === undefined){resp.message = ("trenger UserID");
	res.status(400).end(resp);}

	else if (json.CouponID ===undefined){resp.message = ("trenger CouponID");
	res.status(400).end(resp);}

		else{
			let UserID = parseInt(json.UserID,10);
			let CouponID = parseInt(json.CouponID, 10);
			UsedCoupon(UserID, CouponID, res, this.db);
		}
	}

	//get coupons user x have
	get_user_coupons(res,id){
		let UserID = id;
		GetUserCoupons(UserID,res,this.db);		
	}
	
	//get information about a coupon
	get_coupons(res,id){
		let CouponID = id;
		let checkdate = ExpirationDateAwait(CouponID,this.db);
		if(viability(checkdate)=== false){
			//sets used +1 or used=amount
			//fix
			UsedCoupon(CouponID);
			resp.message = ("Coupon out of date");
			res.status(400).end(resp);
		}
		else{
			GetCoupon(CouponID,res,this.db);
		}
	}

}
async function ExpirationDateAwait(CouponID, db){
	return await getExpirationDate(CouponID, db);
}
function GetUserCoupons(id,res,db){
	console.log(id)
	let resp = JSON.parse('{}')
	db.all(`SELECT Coupons, Amount, Used FROM UserCoupons WHERE UserID = ${id}`,function(err,rows){
		if(err){
			console.log(err);
			res.status(400).end(err)
			}
		else{
			console.log(rows)
			if (rows.length > 0){
				let coupons = [];
				let counter = 0
				rows.forEach((row) => {
					console.log(row.Coupons)
					coupons[counter] = ({"Coupon": row.Coupons, "Amount": row.Amount, "Used": row.Used});
					counter++;
				});
				res.status(200).json({"UserID": id,"Coupons": coupons})
			}else{
				res.status(404).end();
			}
		}
	});
}

function GetCoupon (CouponID,res,db){
    db.get(`SELECT CouponID,ExpirationDate,Type,Value FROM Coupon WHERE CouponID = ${CouponID}`, function (err,row){
			if(err){console.log(err)
			res.status(400).end(err);}
      else{
//console.log(row.CouponID,row.ExpirationDate,row.Type,row.Value);
res.status(200).json({"CouponID": row.CouponID, "ExpirationDate": row.ExpirationDate, "Type": row.Type, "Used": row.Value })
      }
    });
  
}


function makeDate (){
  var d = Date.now()
  d += 1000*60*60*24*30;
  var datenow = d.toString();
  return datenow;
}

function makeDate2 (y,m,d){
  if (y=null){y=0;}
  if (m=null){m=0;}
  if (d=null){d=0;}
  var d = Date.now
  d += 1000*60*60*24*d + 1000*60*60*24*30*m + 1000*60*60*24*30**12*y
  var datenow = d.toString();
  return datenow;
}

function MakeCoupon(req, res, db, resTest){
	let json = req.body
	let Type = parseInt(json.Type,10);
	let Value = parseInt(json.Value,10);
	let ExpirationDate = makeDate();
	if(!(json.ExpirationDate === undefined)){
		ExpirationDate = json.ExpirationDate;
	}
	console.log(ExpirationDate + " " + Type + " " + Value)
	return new Promise((resolve, reject) =>{
		db.run(`INSERT INTO Coupon(ExpirationDate, Type, Value) VALUES (${ExpirationDate}, ${Type}, ${Value})`, function(err,row){
			if(err){
				console.log(err)
				if (resTest){
					res.status(400)
					resolve(0)
				}
			}
			else {
				console.log(`A row has been inserted with CouponID: ${this.lastID}`);
				if(resTest){
					res.status(200).json({"CouponID": this.lastID});
				}
				resolve(this.lastID)
			}
		});
	});
}

function add2User(json, res, db, resTest){
  let resp = JSON.parse('{}')
  let UserID = parseInt(json.UserID,10);
  let CouponID = parseInt(json.CouponID,10);
  let Amount = 1
  let Used = 0
  if(json.Amount === undefined && json.Used === undefined){
  }else if(json.Amount === undefined){
	resp.message = "Write Amount"
	res.status(400).json(resp);
	return;
  }else if(json.Used === undefined){
	  resp.message = "Write Used"
	res.status(400).json(resp);
	return;
  }else {
	Amount = parseInt(json.Amount,10);
	Used = parseInt(json.Used,10);
  }
	db.run(`INSERT INTO UserCoupons(UserID, Coupons, Amount, Used) VALUES (${UserID}, ${CouponID}, ${Amount}, ${Used})`, function(err,row){
		if (err){console.log(err)
			if (err.errno === 19){
				db.run(`UPDATE UserCoupons(UserID, Coupons, Amount, Used) VALUES (${UserID}, ${CouponID}, ${Amount}, ${Used})`, function(err,row){
					if(err){console.log(err)
						resp.message = err;
					res.status(400).end(resp);
				}
				else {res.status(200).end();}
				});
			}
			if (resTest){
				resp.message = "something went wrong"
				resp.description = err.message
				res.status(400).json(resp)
			}
		}
		else {
			if (resTest){
				res.status(200).end()
			}
		}
	});
}



async function addCoupon(req, res, db){



	json = req.body
	json.CouponID = await MakeCoupon(req, res, db, false);
	await add2User(json, res, db, false);
	
	res.status(200).end()
}
 /*
var datenow = makeDate;
let json = req.body;
	let UserID = parseInt(json.UserID, 10);
  let Type = parseInt(json.Type, 10);
  let Value = parseInt(json.Value, 10);
	let ExpirationDate = datenow;
  
 //MakeCoupon?
  db.run(`INSERT INTO Coupon(ExpirationDate, Type, Value) VALUES (${ExpirationDate}, ${Type}, ${Value} )`,function(err,row){
    if(err){console.log(err)}
    else{
     // console.log(this.CouponID);
      CouponID = this.CouponID;
    }
  })
  //add2User?
  db.run(`INSERT INTO UserCoupons(UserID, Coupons) VALUES (${UserID}, ${CouponID})`, function(err,row){
    if(err){console.log(err);}
    else{
      res.status(200).json({"UserID": this.UserID,"CouponID": this.CouponID, "Amount": this.Amount, "Used": this.Used });
    }
  });
} */

// checks expirationdate
// skrives om?
function viability (date2check){
  var d = Date.now;
  var date = d.toString;
  var ans = true;
  for(var i=0;i<date2check.length;i++){
    if(date2check[i]<date[i]){
      ans = false;
    break;}
    else{continue;}
  }
  return ans;
}

//gets expiration date from couponID
function getExpirationDate(CouponID, db){
  db.get(`SELECT ExpirationDate FROM Coupon WHERE CouponID = ${CouponID}`, function(err,row){
    if(err){console.log(err); return}
    else {
		let checkdate = row.ExpirationDate;
		console.log(row)
		return checkdate;
	 }
});
}


//when a coupon is used, update Used
function UsedCoupon (UserID, CouponID,res, db){
	let resp = JSON.parse('{}')
	db.get(`SELECT Used, Amount FROM UserCoupons WHERE UserID = ${UserID} AND Coupons = ${CouponID}`,function(err,row){
		if(err){
			console.log(err)
			resp.message = "something went wrong"
			resp.description = err.message
			res.status(400).json(resp)
		}
		else {
			uses = row.Used;
			uses += 1;
			Amount = row.Amount;
			db.run(`UPDATE UserCoupons SET Used = ${uses} WHERE UserID = ${UserID}`,function(err){
				if(err){
					console.log(err)
					resp.message = "something went wrong"
					resp.description = err.message
					res.status(400).json(resp)
				}else {
					console.log("Uses: " + uses + " of: " + Amount);
					res.status(200).end()
				}
			});
		}
	});
}


 

/*
Json format to reward server:
    {
        UserID: int
        Type: int
        Value: int
        
    }
eller
     {
       UserID: int
       CouponID: int

     }
     eller 
     {
       CouponID: int
       ExpirationDate: text
       Type: int
       Value: int
     }
*/

/*
Json format from reward server: 
{
  CouponID: int
  ExpirationDate: text
  Type: int
  Value: int

  
}
eller {
  UserID: int
  Coupons: [int]
}
*/

