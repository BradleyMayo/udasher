var objects = require('./objects');
var db = require('mongojs').connect('newDb', ['users']);

exports.addUser = function(req, res, f){
	db.users.find({username: req.param('username')}, function(err, users){
		if (err) throw err;
		else if (users[0] != undefined) {
			console.log("User already exists");//change
		}
		else {
			console.log("Adding User: " + req.param('username'));//removable
			db.users.save(objects.newProfile(req.param('username'), req.param('password')));
			
			db.users.find({username: req.param('username')}, function(err, users){//functionable
				req.session._id = users[0]._id;
				f(req, res);
			});
		}
	});
}

exports.getUser = function(req, res){
	if (req.session._id != undefined){
		db.users.find({_id: db.ObjectId(req.session._id.toString())}, function(err, users){
			if (users[0] != undefined){
				res.render('user', users[0]);
			}
			else {//repeatedCode1
				db.users.find({username: req.param('username')}, function(err, users){
					if (err) {
						throw err;
					}
					else if (users[0] == undefined){
						console.log("User dont exist yo");//change
					}
					else {
						res.render('user', users[0]);
					}
				});
			}
		});
	}
	else {//repeatedCode1
		db.users.find({username: req.param('username')}, function(err, users){
			console.log(users[0]);//removable
			if (err) {
				throw err;
			}
			else if (users[0] == undefined){
				console.log("User dont exist yo");//change
			}
			else {
				res.render('user', users[0]);
			}
		});
	}
}


//doesnt reroute to home properly
exports.addTrip = function(req, res, f){
	db.users.find({_id: db.ObjectId(req.session._id.toString())}, function(err, users){
		if (users[0] != undefined){
			db.users.update({_id: db.ObjectId(req.session._id.toString())}, 
			{
				$push: { 'trips': objects.newTrip(users[0].username, req.param('origin'),
				req.param('destination'), req.param('cost'), req.param('rate'))}
			});
			res.redirect("/");
		}
	});
}

///fails
exports.getTrips = function(req, res, f){
	db.users.find({"trips": {"$exists": true}}, function(err, trips){
		if (err){
			throw err;
		}
		else if (trips != undefined){
//			f('trips', {trips: trips});//error
		}
		else {
			console.log("No Trips Found");//change
		}

	});
}
