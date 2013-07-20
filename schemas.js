
exports.item = function (){
	return {	
		trip         : {
			trip_id        : Object,//designated by unique trip._id
			added_distance : Number,
		},
		
		image_id     : String,//designated by unique picture_id

		sender       : Object,//designated by username

		origin       : Object,//location(),
		destination  : Object,//location(),
	
		name         : String,
		description  : String,
		
		upload_date  : Date,
		desired_date : Date,
		completed    : Boolean,//should be date
	}
}

exports.trip = function (){
	return {
		items         : Array,//designated by item_id

		dasher        : Object,
		
		origin        : Object,
		destination   : Object,
		
		directions    : Object,
		base_distance : Number,

		cost          : Number,
		rate          : Number,
		
		upload_date   : Date,
		desired_date  : Date,
		completed     : Boolean,//should be date
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

