var util = require('util');
var database = require('../database');

/*
Tests to see if the request has a session id. If it does, it automatically routes the that id's profile page, if not, it routes to the home page.
*/
exports.home = function(req, res){
	console.log(req.session.user);
	if (req.session.user != null) {
		req.params.id = req.session.user;	
		exports.profile(req, res);
	}
	else res.render('index', {title: 'uDasher' });
  
};

//Gets the array of trips from the database and then displays them 
exports.trips = function(req, res){
    var trips = database.getTrips(); 
    res.render('trips', {trips: trips}); 
};

//Displays the signuup page
exports.signup = function(req, res){
  res.render('signup'); 
};

//Finds the index of the profile from the request and then displays the user's information
exports.profile = function(req, res){
  var index = parseInt(req.params.id); 
  var user = database.getUser(index); 
  res.render('user', user); 
};

/*
Adds a new user to the database with the submitted information under req.
The index of the submitted user is then found by searching for the name an the req parameters and
sessions information are changed to designate the index of the profile. The profile page is then 
loaded.
*/
exports.new_user = function(req, res){
//	console.log('Recieved POST data chunk \"' + util.inspect(req.param('email'), false, null) + "\""); 
	database.addUser(req.param('email'), req.param('password'));
	
	for (var i = 0; i < database.length(); i++){
		if (database.getUser(i).name == req.param('email')) {
			req.params.id = i;
			req.session.user = req.params.id;
			break;
		}
	}
	exports.profile(req,res);
};
