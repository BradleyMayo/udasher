
exports.newItem = function (origin, destination, sender){
	return {
		trip_id : undefined,//designated by unique trip._id

		sender : sender,//designated by username

		origin : origin,//+newLocation
		destination : destination,//+newLocation
		
		completed : false,
	}
}

exports.newTrip = function (origin, destination, cost, rate, dasher){
	return {
		items : [],//designated by item_id

		dasher : dasher,//designated by username
		
		origin : origin,//+newLocation
		destination : destination,//+newLocation

		cost : cost,//+
		rate : rate,//+
		
		completed : false,
	}
}

exports.newUser = function (username, password){
	return {
		email : email,//+
		password : password,//+
		
		displayName : undefined,//+newName

		trips : [],//designated by unique trip._id
		items : [],//designated by unique item._id
	}
}

exports.newLocation = function (country, city, state, zip, address){
	return {
		country: country,//+
		city: city,//+
		state: state,//+
		zip: zip,//+
		address: address,//+
	}
}

exports.newName = function (first, last, middleInitial){
	return {
		first : first,//+
		last : last,//+
		middleInitial : middleInitial,//+
	}
}
