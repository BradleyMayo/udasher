var trip = require('./trip.js');

function newProfile(name, age){

	return {
		name : name,
		age : age,
		trips : [],
		addTrip : function(sender, origin, destination, cost, rate) {
			this.trips.push(trip.newTrip(sender, origin, destination, cost, rate));
		}
	}
}


exports.newProfile = newProfile;
