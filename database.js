var objects = require('./objects');
var db = require('mongojs').connect('newDb', ['users']);

function setSession(req, res){
	db.users.find({username: req.param('username'), password: req.param('password')}, function(err, users){
		if (err) throw err;
		else if (users[0] == undefined) {
			console.log('USER NOT FOUND: database.setSession');
		}
		else {
			req.session._id = users[0]._id;
			req.session.save();
		}
	});
}

/*
Accepts a request, response, and function as parameters. 
Request is used to obtain information submitted by the user. 
Response is passed to the function after the user information has been extracted from the database.
The function is called after the information is found and is passed through

First the database is queried for the username designated by the request parameter username.
The array of users with that name (should only be one because the username is meant to be unique) is passed into the callback function along with any errors that may have occured.

After throwing any errors, the users array is tested to see if a user with the name has been found. If one has, the console displayes an error message, if one hasent been found, the username and password found in the parameters of the request are both passed into the object constructor and saved into the database as a new user.

Because the database creates its own unique _id parameter upon addition, the function searches for the just added user and saves the _id from the database and saves it in the users session via the req.session call.

The callback function initially passed into this function is then called with the newly modified request information and the appropriate response object.

*/
exports.addUser = function(req, res){
	db.users.find({username: req.param('username')}, function(err, users){
		if (err) throw err;
		else if (users[0] != undefined) {
			console.log("User already exists");//change
		}
		else {
			console.log("Adding User: " + req.param('username'));//removable
			db.users.save(objects.newProfile(req.param('username'), req.param('password')));
			
			
			setSession(req, res);
			res.redirect('/');
			/*
			db.users.find({username: req.param('username')}, function(err, users){//functionable
				req.session._id = users[0]._id;
				f(req, res);
			});*/
		}
	});
}

//consider renaming to 'displayUser' instead of getUser
exports.getUserWithSession_id = function(req, res){
	db.users.find({_id: db.ObjectId(req.session._id.toString())}, function(err, users){
		if (users[0] != undefined){
			res.render('user', users[0]);
		}
		else {
			getUserWithUsernameAndPassword(req, res);
		}
	});
}

exports.getUserWithUsernameAndPassword = function(req, res){
	db.users.find({username: req.param('username'), password: req.param('password')}, function(err, users){
		console.log(users[0]);//removable
		if (err) {
			throw err;
		}
		else if (users[0] == undefined){
			console.log("USER COULD NOT BE FOUND: database.getUserWithUsernameAndPassword");//change
		}
		else {
			setSession(req, res);
			res.render('user', users[0]);
		}
	});
}

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

exports.getTrips = function(req, res){
	db.users.find({"trips.dasher": {"$exists": true}}, function(err, tripsAsObjects){

		//compiles the returned objects and arrays into a single array of arrays for display
		var trips = [];
		for (var i = 0; i < tripsAsObjects.length; i++){
			for (var j = 0; j < tripsAsObjects[i].trips.length; j++){
				trips.push(tripsAsObjects[i].trips[j]);
			}
		}
		
		if (err){
			throw err;
		}
		else if (trips != undefined){
			res.render('trips', {"trips": trips});
		}
		else {
			console.log("No Trips Found");//change
		}

	});
}
