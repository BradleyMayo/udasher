function newItem(sender, origin, destination){

	return {
		sender : null,
		dasher : dasher,
		origin : origin,
		destination : destination,
		
		addDasher : function (sender) {
			this.sender = sender;
		}
	}
}
exports.newItem = newItem;
