exports.item = function (){
	return {
	
		trip_id     : String, //designated by unique trip._id

		sender      : Object,//designated by username

		origin      : String,//location(),
		destination : String,//location(),
		
		completed   : Boolean,
	}
}

exports.trip = function (){
	return {

		items       : Array,//designated by item_id

		dasher      : Object,
		
		origin      : String,//location(),
		destination : String,//location(),

		cost        : Number,
		rate        : Number,
		
		completed   : Boolean,
	}
}

exports.user = function (){
	return {

		email       : String,
		password    : String,
		
		displayName : String,

		facebook    : Object,
		trustRating : Number,

		trips       : Array,//designated by unique trip._id
		items       : Array,//designated by unique item._id
	}
}

function name(){
	return {
	
		first          : String, 
		last           : String, 
	}
}

function location(){
	return {
	
		country : String,
		city    : String,
		state   : String,
		address : String,

		zip     : Number,
	}
}
