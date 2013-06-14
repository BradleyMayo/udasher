var schemas = require('./schemas'); 
var objects = require('./objects');
var mongoose = require('mongoose'); 

mongoose.connect('mongodb://localhost/udasher'); 

db = mongoose.connection; 

//Collections are plural
var user = db.model('user', schemas.user()); 
var trip = db.model('trip', schemas.trip()); 
var item = db.model('item', schemas.item()); 

exports.addUserWithEmailAndPassword = function(req, res){
	var newUser = new user({email : req.param('email'), password : req.param('password'), displayName : req.param('displayName')});

	user.findOne({email: req.param('email')}, function(err, user){
		if (err) throw err;
		else if (user == undefined) {
			newUser.save(function(err){
				console.log("Adding User With Email And Password: " + req.param('email'));//removable
				if(err) throw err;	
				else exports.loginWithEmailAndPassword(req, res);
			});
		}
		else {
			console.log("User already exists");//change
			res.redirect('/');
		}
	});
}

exports.addUserWithFB = function(profile){
	var FBuser = new user({facebook: profile, displayName : profile.displayName});
	
	user.findOne({'facebook.id': profile.id}, function(err, user){
		if (err) throw err; 
		else if (user != undefined);
		else{
			FBuser.save(function(err){
				console.log("Adding User With Facebook: " + profile.displayName);//removable
				if(err) throw err;
			});
		}
	});
}

exports.loginWithFacebook = function(req, res){
	user.findOne({'facebook.id': req.user}, function(err, user){
		if(err) throw err; 
		else{
			console.log("Facebook Profile Found, logging in.");//removable
			req.session._id = user._id; 
			req.session.displayName = user.facebook.displayName; 
			req.session.save();
			res.redirect('/');  
		}
	}); 
}

exports.loginWithEmailAndPassword = function(req, res){
	user.findOne({email: req.param('email'), password: req.param('password')}, function(err, user){
		if (err) {
			throw err;
		}
		else if (user == undefined){
			console.log("USER COULD NOT BE FOUND: database.loginWithEmailAndPassword");//change
			res.redirect('/');
		}
		else {
			req.session._id = user._id;
			req.session.displayName = user.displayName;
			req.session.save();
			res.redirect('/');
		}
	});
}

exports.display = function(req, res, route)
{
	console.log(req.session.displayName); 
	user.findOne({'_id': req.session._id}, function(err, user){
		if(err) throw err; 
		else if(user == undefined){
			console.log('USER NOT FOUND: database.setSession');
		}
		else{
			res.render(route, {displayName: req.session.displayName, user: user}); 
		}
	});
}

exports.addItem = function(req, res){
	var newItem = new item(objects.newItem(req.param('origin'), req.param('destination'), req.session._id));
	newItem.save();
	user.findOne({_id : req.session._id}, function(err, usr){
		user.trips.push(newItem._id);
		res.redirect('all_items');
	});
}

exports.addTrip = function(req, res){
	var newTrip = new trip(objects.newTrip(req.param('origin'), req.param('destination'), req.param('cost'), req.param('rate'), req.session._id));
	newTrip.save();
	user.findOne({_id : req.session._id}, function(err, usr){
		usr.trips.push(newTrip._id);
		res.redirect('all_trips');
	});

}

exports.showAllItems = function(req, res, route){
	item.find(function(err, items){
		if (err) throw err; 
		else{
			res.render(route, {displayName: req.session.displayName, items: items});
		}
	});	
}

exports.showAllTrips = function(req, res, route){
	trip.find(function(err, trips){
		if (err) throw err; 
		else{
			res.render(route, {displayName: req.session.displayName, trips: trips});
		}
	});	
}

/*May be needed in the future but needs rethinking. For now all add and get function automaticall save sessions
function setSession(req, res, method){
	db.users.find({email: req.param('email'), password: req.param('password')}, function(err, users){
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
*/
/*Debatably useless...need more time to determine

exports.loginWithSession = function(req, res){
	user.findOne({'facebook.id': profile.id}, function(err, user){
		if (err) throw err; 
		else if(user == undefined){
			console.log('USER NOT FOUND: database.setSession');
		}
		else {
			req.session._id = user._id;
			req.session.save();
			res.redirect('/');
		}
	});
}
*/


