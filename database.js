var schemas = require('./schemas'); 
var objects = require('./objects');
var mongoose = require('mongoose');

var gm = require('googlemaps');

mongoose.connect('mongodb://localhost/udasher'); 
db = mongoose.connection; 

//Collections are plural
var user  = db.model('user',  schemas.user());
var trip  = db.model('trip',  schemas.trip());
var item  = db.model('item',  schemas.item());

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
	gm.geocode(req.param('origin'), function(err, originResults){
		if (err) throw err;

		gm.geocode(req.param('destination'), function(error, destinationResults){
			if (error) throw error;

			var newItem = new item(objects.newItem(originResults, destinationResults, req.session._id));
			newItem.save();
			user.findOne({_id : req.session._id}, function(err, usr){
				if (err) throw err;
				else{
					usr.items.push(newItem._id);
					res.redirect('all_items');
				}
			});		
		});
	});


	
}

exports.showItem = function(req, res, route){
	item.findOne({_id : req.param('item_id')}, function(err, itm){
		if (err) throw err;
		else if (itm == undefined){
			console.log('ITEM NOT FOUND: database.showItem');
		}
		else {
			markers = [
				{ 'location': itm.origin.results[0].formatted_address },
				{ 'location': itm.destination.results[0].formatted_address,
					'color': 'red',
					'label': 'A',
					'shadow': 'false',
					'icon' : 'http://chart.apis.google.com/chart?chst=d_map_pin_icon&chld=cafe%7C996600'
				}
			]

			styles = [
				{ 'feature': 'road', 'element': 'all', 'rules': 
					{ 'hue': '0x00ff00' }
				}
			]

			paths = [
				{ 'color': '0x0000ff', 'weight': '5', 'points': 
					[ itm.origin.results[0].geometry.location.lat + "," + itm.origin.results[0].geometry.location.lng, itm.destination.results[0].geometry.location.lat + "," + itm.destination.results[0].geometry.location.lng]
				}
			]
		
			var imgURL = gm.staticMap(undefined, undefined,'500x400', false, false, 'roadmap', undefined, styles, paths);
				
			res.render(route, {displayName: req.session.displayName, item : itm, image : imgURL});
		}
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

exports.addTrip = function(req, res){
	gm.geocode(req.param('origin'), function(err, originResults){
		if (err) throw err;

		gm.geocode(req.param('destination'), function(error, destinationResults){
			if (error) throw error;

			var newTrip = new trip(objects.newTrip(originResults, destinationResults, req.param('cost'), req.param('rate'), req.session._id));
			newTrip.save();
			user.findOne({_id : req.session._id}, function(err, usr){
				if (err) throw err;
				else {
					usr.trips.push(newTrip._id);
					res.redirect('all_trips');
				}
			});
		});
	});

}

exports.showTrip = function(req, res, route){
	trip.findOne({_id : req.param('trip_id')}, function(err, trp){
		if (err) throw err;
		else if (trp == undefined){
			console.log('ITEM NOT FOUND: database.showItem');
		}
		else {
			markers = [
				{ 'location': trp.origin.results[0].formatted_address },
				{ 'location': trp.destination.results[0].formatted_address,
					'color': 'red',
					'label': 'A',
					'shadow': 'false',
					'icon' : 'http://chart.apis.google.com/chart?chst=d_map_pin_icon&chld=cafe%7C996600'
				}
			]

			styles = [
				{ 'feature': 'road', 'element': 'all', 'rules': 
					{ 'hue': '0x00ff00' }
				}
			]

			paths = [
				{ 'color': '0x0000ff', 'weight': '5', 'points': 
					[ trp.origin.results[0].geometry.location.lat + "," + trp.origin.results[0].geometry.location.lng, trp.destination.results[0].geometry.location.lat + "," + trp.destination.results[0].geometry.location.lng]
				}
			]
		
			var imgURL = gm.staticMap(undefined, undefined,'500x400', false, false, 'roadmap', undefined, styles, paths);
			res.render(route, {displayName: req.session.displayName, trip : trp, image : imgURL});
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

