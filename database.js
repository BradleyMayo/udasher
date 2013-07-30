//Imports
var schemas = require('./schemas');
var objects = require('./objects');
var password = require('./password');

var mongoose = require('mongoose');
var async = require('async');
var request = require('request');

var gm = require('googlemaps');

//Connects the middleware to the mongoDB database
mongoose.connect('mongodb://localhost/udasher');
db = mongoose.connection;

//Creates schemas with an initial format designated by the schema files
var itemSchema = new mongoose.Schema(schemas.item());
var tripSchema = new mongoose.Schema(schemas.trip());

//Adds a function to the schemas to allow for more direct searching of the database
itemSchema.method('findTotalDistance', findTotalDistance);
tripSchema.method('findTotalDistance', findTotalDistance);

//Sends to callback an added distance number based on the distance between the start and end 
//locations given compared to the indevidual objects start and end locations
function findTotalDistance(startLocation, endLocation, callback){
	var location1 = this.origin.results[0].formatted_address;
	var location2 = this.destination.results[0].formatted_address;

	gm.distance(location1, startLocation, function(err, dst1){
		if (dst1 == undefined){
			console.log("Error in findTotalDistance dst1");
			//handle error case here
		}
		else{
			gm.distance(location2, endLocation, function(err, dst2){
				if (dst2 == undefined){
					console.log("Error in findTotalDistance dst1");
					//handle error case here
				}
				else{
					callback(dst1.rows[0].elements[0].distance.value/1000 + dst2.rows[0].elements[0].distance.value/1000);
				}
			});
		}
	});
}

//Collections are plural
var user  = db.model('user', schemas.user());
var trip  = db.model('trip', tripSchema);
var item  = db.model('item', itemSchema);

//GET functions ------------------------------------------------

//Used to render various pages that simply need the currently logged in users information
exports.display = function(req, res, route)
{
	console.log(req.session.displayName); 
	user.findOne({'_id': req.session._id}, function(err, user){
		if(err) throw err; 
		else if(user == undefined){
			console.log('USER NOT FOUND: database.setSession');
			res.render(route, {displayName: req.session.displayName, user: user}); 			
		}
		else{
			res.render(route, {displayName: req.session.displayName, user: user}); 
		}
	});
};


//Sends an array of all trips to the designated route
exports.showAllTrips = function(req, res, route){
	trip.find(function(err, trips){
		if (err) throw err;
		else{
			res.render(route, {displayName: req.session.displayName, trips: trips});
		}
	});	
};
//Sends an array of all items to the designated route
exports.showAllItems = function(req, res, route){
	item.find(function(err, items){
		if (err) throw err; 
		else{
			res.render(route, {displayName: req.session.displayName, items: items});
		}
	});	
};


//Sends information about a specific trip to the designated route, if the trip has items the item locations are
//used to calculate a route which is then used to calculate a distance. If there are no items, the distance is
//simply calculated and displayed
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
				makeURL(trp, undefined, function(options){
					getDirections(options, function(directions){//repeated code
						exports.computeTotalDistance(directions, function(distance){
							console.log(distance);
						});

						item.find({sender : req.session._id}, function(err, itms){
							res.render(route, {displayName: req.session.displayName, trip : trp, items : itms});//, image : imgURL});
						});
					});						
				});
			}
		}
	});
};
//Sends information about a specific item down the designated route
exports.showItem = function(req, res, route){
	item.findOne({_id : req.param('item_id')}, function(err, itm){
		if (err) throw err;
		else if (itm == undefined){
			console.log('ITEM NOT FOUND: database.showItem');
		}
		else {				
			res.render(route, {displayName: req.session.displayName, item : itm});
		}
	});
};


//!!!POORLY CODED!!! saves an item id in a trip based on url
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


//used in the app.js file after authenticating a facebook login. May not be safe agaist direct posting of id
exports.loginWithFacebook = function(req, res, route){
	user.findOne({'facebook.id': req.user}, function(err, user){
		if(err) {
			console.log("ERROR : loginWithFacebook, 0");
		}
		else{
			console.log("Facebook Profile Found, logging in.");//removable
			req.session._id = user._id; 
			req.session.displayName = user.facebook.displayName; 
			req.session.save();
			res.redirect('/');  
		}
	}); 
};

//POST functions-----------------------------------------------

//Finds a user via the designated email. The submmitted password is then tested against the saved password hash
//to determine if login is successful or not. Always redirects to '/'
exports.loginWithEmailAndPassword = function(req, res){
	user.findOne({email: req.param('email')}, function(err, user){
		if (err) {
			throw err;
		}
		else if (user == undefined){
			console.log("USER COULD NOT BE FOUND: database.loginWithEmailAndPassword");//change
			res.redirect('/');
		}
		else {
			password.validate(req.param('password'), user.password, function(error, response){
				if (response === true){
					req.session._id = user._id;
					req.session.displayName = user.displayName;
					req.session.save();
					res.redirect('/');
				}
				else {
					res.redirect('/');
				}
			});
		}
	});
};
//Creates a new profile with the designated information then tests to see if a similar profile already exists
//before it is saved
exports.addUserWithEmailAndPassword = function(req, res){
	password.hash(req.param('password'), function(err, pw){
		var newUser = new user({email : req.param('email'), password : pw, displayName : req.param('displayName')});

		user.findOne({email: req.param('email')}, function(err, user){
			if (err) {
				console.log("ERROR : addUserWithEmailAndPassword, 0");
			}
			else if (user == undefined) {
				newUser.save(function(err){
					console.log("Adding User With Email And Password: " + req.param('email'));//removable
					if(err) {
						console.log("ERROR : addUserWithEmailAndPassword, 1");
					}
					else exports.loginWithEmailAndPassword(req, res);
				});
			}
			else {
				console.log("User already exists");//change
				res.redirect('/');
			}
		});
	});
};


//Creates two location strings based on submitted information and then uses the google API to format information
//into the needed way for saving in the database. The trip id is also added to the currently logged in user
exports.addTrip = function(req, res){
	var origin = "";
	if (req.param('originAddress') != undefined) origin += req.param('originAddress') + " ";
	if (req.param('originCity')    != undefined) origin += req.param('originCity')    + " ";
	if (req.param('originState')   != undefined) origin += req.param('originState')   + " ";
	if (req.param('originZip')     != undefined) origin += req.param('originZip')     + " ";
	
	var destination = "";
	if (req.param('destinationAddress') != undefined) destination += req.param('destinationAddress') + " ";
	if (req.param('destinationCity')    != undefined) destination += req.param('destinationCity')    + " ";
	if (req.param('destinationState')   != undefined) destination += req.param('destinationState')   + " ";
	if (req.param('destinationZip')     != undefined) destination += req.param('destinationZip')     + " ";

	console.log(origin);//removable
	console.log(destination);//removable

	gm.geocode(origin, function(err, originResults){
		if (err) throw err;

		gm.geocode(destination, function(error, destinationResults){
			if (error) throw error;

			var newTrip = new trip(objects.newTrip(originResults, destinationResults, req.param('cost'), req.param('rate'), req.session._id));
			makeURL(newTrip, undefined, function(options){
				getDirections(options, function(directions){
					newTrip.directions = directions;
					exports.computeTotalDistance(directions, function(distance){
						newTrip.base_distance = distance;
						newTrip.save();			
					});
				});
			});
			user.findOne({_id : req.session._id}, function(err, usr){
				if (err) throw err;
				else {
					usr.trips.push(newTrip._id);
					res.redirect('/find_trips');
				}
			});
		});
	});
};
//Should use a system similar to add trip for origin and destination string creation. Processes are identical
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
					res.redirect('/find_items');
				}
			});		
		});
	});
};

//finds the 'closest trips' which in this case means finds the cheapest trips based on distance and costs
//based on the locations given
exports.showSortedTrips = function(req, res, route){
	getClosestTrips(req, res, {origin : req.param('origin'), destination : req.param('destination')}, function(sortedList){
		res.render(route, {displayName : req.session.displayName, trips : sortedList, query_location : {origin : req.param('origin'), destination : req.param('destination')}});
	});
};
//identical to previous function except for items
exports.showSortedItems = function(req, res, route){
	getClosestItems(req, res, {origin : req.param('origin'), destination : req.param('destination')}, function(sortedList){
		res.render(route, {displayName : req.session.displayName, items : sortedList, query_location : {origin : req.param('origin'), destination : req.param('destination')}});
	}); 
};

//Creates a profile based on input then saves it in the database after checking for an identical profile
exports.addUserWithFB = function(profile){
	var FBuser = new user({facebook: profile, displayName : profile.displayName});
	
	user.findOne({'facebook.id': profile.id}, function(err, user){
		if (err) {
			console.log("ERROR : addUserWithFB, 0");
		} 
		else if (user != undefined);
		else{
			FBuser.save(function(err){
				console.log("Adding User With Facebook: " + profile.displayName);//removable
				if(err) {
					console.log("ERROR : addUserWithFB, 1");
				}
			});
		}
	});
};

//NON-Exported Functions------------------------------------------------
//sends to callback the total distance in miles of a trip based on directions
exports.computeTotalDistance = function(directions, callback){
	var total = 0;
	var myroute = directions.routes[0];
	for (i = 0; i < myroute.legs.length; i++) {
		total += myroute.legs[i].distance.value;
	}
	total = (total / 1000) * 0.621371;
	callback(total);
};

//Should use callback instead of route and let latter proccesses be handled by the primary function
//finds all waypoints for objects in a trip, gets the directions for the whole trip, then displays the route and
//distance
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
				makeURL(trp, waypoints, function(options){
					getDirections(options, function(directions){//repeated code
						exports.computeTotalDistance(directions, function(distance){
							console.log(distance);
						});

						item.find({sender : req.session._id}, function(err, itms){
							res.render(route, {displayName: req.session.displayName, trip : trp, items : itms});//, image : imgURL});
						});
					});		
				
				});
			}
		});
	});
}

//Corrects the url created by the googlemaps module when there are multiple waypoints being sent by replacing
//all but the first "&waypoints=" with the correct delimiter "%7C"
function makeURL(trp, waypoints, callback){
	var dirURL = gm.directions((trp.origin.results[0].geometry.location.lat + "," + trp.origin.results[0].geometry.location.lng), (trp.destination.results[0].geometry.location.lat + "," + trp.destination.results[0].geometry.location.lng), function(err, und){}, 'false', undefined, waypoints, undefined, undefined, undefined, undefined);

	if (waypoints != undefined){
		var tempArrayURL = dirURL.split("&waypoints=");
		var newURL;
		
		for (var accumulator = 1; accumulator < tempArrayURL.length; accumulator++){
			if (accumulator == 1) newURL = tempArrayURL[0] + "&waypoints=" + tempArrayURL[1];
			else newURL += "%7C" + tempArrayURL[accumulator];
			if (accumulator == tempArrayURL.length - 1) {
				console.log(newURL);//removable
				callback({uri : newURL});
			}
		}
	}
	else {
		console.log(dirURL);//removable
		callback({uri : dirURL});
	}
	
}

//Used to request the google maps api directly with any newly crafted URL's
function getDirections(options, callback) {
	request(options, function(error, response, directions){
		if (error) {
			throw error;
		}
		if (response.statusCode === 200) {
			callback(JSON.parse(directions));
		}
	});
}

//Sends a list of all non-completed items to the sort function with the callback passed down to it
function getClosestItems(req, res, location, callback){
	item.find({completed : false}).exec(function(err, itm){
		sort(itm, location, callback);
	});
}

//Sends a list of all non-completed trips to the sort function with the callback passed down to it
function getClosestTrips(req, res, location, callback){
	trip.find({completed : false}).exec(function(err, trp){
		sort(trp, location, callback);
	});
}

//Creates an array of pseudo items with additional temporary fields for sorting.
//Currently creates the totalValue field based on the base cost plus the item rate per hour of travel based on
//the distance divided by an assumed average speed of 43 miles per hour
//The array is then sorted based on the totalValue field and passed down to the callback
function sort(list, location, callback){
	var array = [];
	async.forEach(list, function(itm, callback){
		itm.findTotalDistance(location.origin, location.destination, function(dist){
			itm.totalValue = itm.cost + ((dist/43) * itm.rate);
			array.push(itm);	
			callback();
		});
	}, function(err){
		if (err) return next(err);
	
		callback(array.sort(function(a, b){
			return a.totalValue - b.totalValue;
		}));
	});
}

