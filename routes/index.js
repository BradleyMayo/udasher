var util = require('util');
var db = require('../database');
var passport = require('passport'); 
var fbStrategy = require('passport-facebook').Strategy; 


exports.index = function(req, res){
	console.log("Session number: " + req.session._id);//removable
	if (req.session._id != undefined) {
		exports.home(req, res);
	}
	else res.render('index', {title: 'uDasher' });
};

exports.home = function(req, res){
	db.display(req, res, 'home'); 
};

exports.all_trips = function(req, res){
	db.showAllTrips(req, res, 'all_trips'); 
};

exports.trip = function(req, res){
	req.params.trip_id = req.params.id;
	db.showTrip(req, res, 'trip');
};

exports.post_trips = function(req, res){
	db.display(req, res, 'post_trips');
};

exports.all_items = function(req, res){
	db.showAllItems(req, res, 'all_items'); 
};

exports.item = function(req, res){
	req.params.item_id = req.params.id;
	db.showItem(req, res, 'item');
};

exports.post_items = function(req, res){
	db.display(req, res, 'post_items');
};

exports.signup = function(req, res){
	res.render('signup');
};

exports.login = function(req, res){
	if (req.param('email') != undefined && req.param('password') != undefined){
		db.loginWithEmailAndPassword(req, res);
	}
	else if (req.session._id != undefined){
		db.loginWithSession_id(req, res); 	
	}
	else {
		console.log("Not enough information for login");
		res.redirect('/');
	}
};

exports.new_trip = function(req, res){
	db.addTrip(req, res);
};

exports.new_item = function(req, res){
	db.addItem(req, res);
};

exports.new_user = function(req, res){
	db.addUserWithEmailAndPassword(req, res);
};

exports.new_user_fb = function(req, res){
	db.loginWithFacebook (req, res); 
};

exports.logout = function(req, res){
	req.params.username = undefined;
	req.params.password = undefined;
	req.session._id = undefined;
	res.redirect('/');
};

