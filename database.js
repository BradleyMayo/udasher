var profile = require('./objects/profile');
var db = require('mongojs').connect('newDb', ['users']);

db.users.find({name: "brad"}, function(err, users) {
  if( err || !users) console.log("No brad's users found");
  else users.forEach( function(users) {
    console.log(users);
  } );
});

//console.log(usr.find());


var users = []; 

function addUser(name, age){
	console.log(name + " " + age);
	users.push(profile.newProfile(name, age)); 
}

function getUser(index){
	if (index < users.length && index >= 0)
		return users[index]; 
	else 
		return "There are no user, you big dummy"; 
}

function getTrips(){
	var trips = []; 
	for(var i=0; i<users.length; i++){
		for(var j=0; j<users[i].trips.length; j++){
			trips.push(users[i].trips[j]); 
		}
	}
	return trips; 
}

function length(){
	return users.length;
}

//Initialize Database
(function (){
	db.users.save(profile.newProfile('Brad', 18));
	db.users.save(profile.newProfile('Dan', 19));
	db.users.save(profile.newProfile('Poseidon', 1));
	
//	db.users.find({name: 'Brad'}).addTrip('Brad', "State College", "Pittsburgh", 5, 10); 
//	db.users.toArray()[0].addTrip(users.toArray()[0].name, "Pittsburgh", "State College", 5, 10); 
//	db.users.toArray()[0].addTrip(users.toArray()[0].name, "State College", "Camp is Groovy", 5, 10); 

//	db.users.toArray()[1].addTrip(users.toArray()[1].name, "State College", "Anywhere Else", 20, 300); 

})();

exports.length = length;
exports.getUser = getUser; 
exports.getTrips = getTrips; 
exports.addUser = addUser;
