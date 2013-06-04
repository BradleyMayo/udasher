var util = require('util');
var db = require('../database');

exports.home = function(req, res){
	console.log("Session number: " + req.session._id);//removable
	if (req.session._id != undefined) {
		exports.profile(req, res);
	}
	else res.render('index', {title: 'uDasher' });
};

exports.trips = function(req, res){
	db.getTrips(req, res); 
};

exports.signup = function(req, res){
	res.render('signup');
};

exports.profile = function(req, res){
	if (req.param('username') != undefined && req.param('password') != undefined){
		db.getUserWithUsernameAndPassword(req, res);
	}
	else if (req.session._id != undefined){
		db.getUserWithSession_id(req, res); 	
	}
	else {
		console.log("Not enough information for login");
		res.redirect('/');
	}
};

exports.new_trip = function(req, res){
	db.addTrip(req, res, exports.home)
}

exports.new_user = function(req, res){
	db.addUser(req, res);
};

exports.logout = function(req, res){
	req.params.username = undefined;
	req.params.password = undefined;
	req.session._id = undefined;
	res.redirect('/');
}
