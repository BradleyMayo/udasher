var trip = require('./trip.js');

function newProfile(name, age){

	return {
		name : name,
		age : age,
		trips : [],
		addTrip : function(dasher, origin, destination, cost, rate) {
			this.trips.push(trip.newTrip(dasher, origin, destination, cost, rate));
		}
	}
}


exports.newProfile = newProfile;
