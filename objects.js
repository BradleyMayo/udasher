
exports.newItem = function (origin, destination, sender){
	return {
		trip : {
			trip_id : undefined,//designated by unique trip._id
			added_distance : undefined,//desiganted after analysing unique trip		
		},
		
		image_id : undefined,//+

		sender : sender,//designated by username

		origin : origin,//+newLocation
		destination : destination,//+newLocation
				
		upload_date  : undefined,
		desired_date : undefined,
		completed : false,
	}
}

exports.newTrip = function (origin, destination, cost, rate, dasher){
	return {
		items : [],//designated by item_id

		dasher : dasher,//designated by username
		
		origin : origin,//+newLocation
		destination : destination,//+newLocation
		
		directions    : undefined,
		base_distance : undefined,

		cost : cost,//+
		rate : rate,//+
		
		upload_date  : undefined,
		desired_date : undefined,
		completed : false,
	}
}

exports.newUser = function (username, password){
	return {
		email : email,//+
		password : password,//+
		
		displayName : undefined,//+newName

		facebook    : undefined,
		trustRating : undefined,

		trips : [],//designated by unique trip._id
		items : [],//designated by unique item._id
	}
}

