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
	db.getTrips(req, res, res.render); 
};

exports.signup = function(req, res){
	res.render('signup'); 
};

exports.profile = function(req, res){
	db.getUser(req, res); 
};

exports.new_trip = function(req, res){
	db.addTrip(req, res, exports.home)
}

exports.new_user = function(req, res){
	db.addUser(req, res, exports.profile);
};
