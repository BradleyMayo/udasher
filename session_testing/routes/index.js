var util = require('util');
var database = require('../database');

exports.home = function(req, res){
	console.log(req.session.user);
	if (req.session.user != null) {
		req.params.id = req.session.user;	
		exports.profile(req, res);
	}
	else res.render('index', {title: 'uDasher' });
  
};

exports.trips = function(req, res){
    var trips = database.getTrips(); 
    res.render('trips', {trips: trips}); 
};

exports.signup = function(req, res){
  res.render('signup'); 
};

exports.profile = function(req, res){
  var index = parseInt(req.params.id); 
  var user = database.getUser(index); 
  res.render('user', user); 
};

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
