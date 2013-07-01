var schemas = require('./schemas');
var objects = require('./objects');
var mongoose = require('mongoose');

var gm = require('googlemaps');

mongoose.connect('mongodb://localhost/udasher');
db = mongoose.connection;

var itemSchema = new mongoose.Schema(schemas.item());

itemSchema.method('findTotalDistance', function(startLocation, endLocation, callback){
//	console.log("ITEM ORIGIN: " + this.origin.results[0].formatted_address);
//	console.log("ITEM DESTIN: " + this.destination.results[0].formatted_address);
	
	var location1 = this.origin.results[0].formatted_address;
	var location2 = this.destination.results[0].formatted_address;

	gm.distance(location1, startLocation, function(err, dst1){
//		console.log("ORG DIST: " + dst1.rows[0].elements[0].distance.value/1000);
		gm.distance(location2, endLocation, function(err, dst2){
//			console.log("DES DIST: " + dst2.rows[0].elements[0].distance.value/1000);
			callback(dst1.rows[0].elements[0].distance.value/1000 + dst2.rows[0].elements[0].distance.value/1000);
		});
	});
});

//Collections are plural
var user  = db.model('user',  schemas.user());
var trip  = db.model('trip',  schemas.trip());
var item  = db.model('item',  itemSchema);

exports.test = function(req, res){
	item.find().sort('-this.findTotalDistance("Las Vegas, Nevada", "Oklahoma City, OK")').exec(function(err, itm){
		itm[0].findTotalDistance("Las Vegas, Nevada", "Oklahoma City, OK", console.log);
		itm[1].findTotalDistance("Las Vegas, Nevada", "Oklahoma City, OK", console.log);
		itm[2].findTotalDistance("Las Vegas, Nevada", "Oklahoma City, OK", console.log);
		itm[3].findTotalDistance("Las Vegas, Nevada", "Oklahoma City, OK", console.log);
//		console.log(itm);
	});
};

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
};

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
};

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
};

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
};

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
};

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


	
};

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
};

exports.showAllItems = function(req, res, route){
	item.find(function(err, items){
		if (err) throw err; 
		else{
			res.render(route, {displayName: req.session.displayName, items: items});
		}
	});	
};

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

};

exports.showTrip = function(req, res, route){
	trip.findOne({_id : req.param('trip_id')}, function(err, trp){
		if (err) throw err;
		else if (trp == undefined){
			console.log('ITEM NOT FOUND: database.showItem');
		}
		else {
			if (trp.items.length != 0) {
				findItemProperties(req, res, trp, route);
			}
			else {
				getDirections(req, res, trp, undefined, route);
			}
		}
	});
};

exports.showAllTrips = function(req, res, route){
	trip.find(function(err, trips){
		if (err) throw err;
		else{
			res.render(route, {displayName: req.session.displayName, trips: trips});
		}
	});	
};

//testing////////////////////////////////////////////////////////
exports.computeTotalDistance = function(result){
	var total = 0;
	var myroute = result.routes[0];
	for (i = 0; i < myroute.legs.length; i++) {
		total += myroute.legs[i].distance.value;
	}
	total = (total / 1000) * 0.621371;
	console.log("Total Distance: " + total + " miles");
};

exports.attachItem = function(req, res, route){
	item.findOne({_id : req.param('item_id')}, function(err, item){
		console.log(item);//removable
		item.trip_id = req.param('trip_id');
		console.log(item);//removable
		item.save();

		trip.findOne({_id : req.param('trip_id')}, function(err, trip){
			console.log(trip);//removable
			trip.items.push(req.param('item_id'));
			console.log(trip);//removable
			trip.save();
			
			res.redirect(route);
		});
	});
};

function findItemProperties(req, res, trp, route){
	console.log("FOUND THE TRIP");//removable
	var waypoints = [];
	trp.items.forEach(function(itm_id){
	
		item.findOne({_id : itm_id}, function(err, itm){
			waypoints.push(itm.origin.results[0].formatted_address);
			waypoints.push(itm.destination.results[0].formatted_address);
			console.log("WAYPOINTS:");//removable
			console.log(waypoints);//removable

			if (waypoints.length == (trp.items.length * 2)){
				getDirections(req, res, trp, waypoints, route);
			}
		});
	});
}	
function getDirections(req, res, trp, waypoints, route){
	console.log(	gm.directions((trp.origin.results[0].geometry.location.lat + "," + trp.origin.results[0].geometry.location.lng), (trp.destination.results[0].geometry.location.lat + "," + trp.destination.results[0].geometry.location.lng), function(err, directions){
		if (err) throw err;

		exports.computeTotalDistance(directions);

		var startToFinish = [];
		for (var acc0 = 0; acc0 < directions.routes.length; acc0++){
			for (var acc1 = 0; acc1 < directions.routes[acc0].legs.length; acc1++){
				for (var acc2 = 0; acc2 < directions.routes[acc0].legs[acc1].steps.length; acc2++){
					startToFinish.push(directions.routes[acc0].legs[acc1].steps[acc2].start_location.lat + "," + directions.routes[acc0].legs[acc1].steps[acc2].start_location.lng, directions.routes[acc0].legs[acc1].steps[acc2].end_location.lat + "," +directions.routes[acc0].legs[acc1].steps[acc2].end_location.lng);
				}
			}
		}

		console.log("DIRECTIONS:");//removable
		console.log(startToFinish);
		paths = [
			{ 'color': '0x0000ff', 'weight': '5', 'points': 
				startToFinish
			}
		]

		var imgURL = gm.staticMap(undefined, undefined,'500x400', false, false, 'roadmap', undefined, undefined, paths);
		item.find({sender : req.session._id}, function(err, itms){
			res.render(route, {displayName: req.session.displayName, trip : trp, items : itms, image : imgURL});
		});
	}, 'false', undefined, waypoints, undefined, undefined, undefined, undefined));
}

function getClosestItems(req, res, location, callback){
	item.find({completed : undefined}).where();
}

