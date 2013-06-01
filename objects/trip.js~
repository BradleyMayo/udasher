var item = require('./items');


function newTrip(dasher, origin, destination, cost, rate){

	return {
		dasher : dasher,
		origin : origin,
		destination : destination,
		items : [],
		cost : cost,
		rate : rate,
		
		addItem : function (sender, origin, destination) {
			items.push(item.newItem(sender, origin, destination));
		}
	}
}
exports.newTrip = newTrip;
