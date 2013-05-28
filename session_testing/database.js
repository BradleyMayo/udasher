var profile = require('./objects/profile'); 

var users = []; 

//Adds a new profile with the given name and age to the database
function addUser(name, age){
	console.log(name + " " + age " added to the database.");
	users.push(profile.newProfile(name, age)); 
}

//Returns the profile in the database at the given index
function getUser(index){
	if (index < users.length && index >= 0)
		return users[index]; 
	else 
		return "There are no user, you big dummy"; 
}

//Returns an array of all trips from all users
function getTrips(){
	var trips = []; 
	for(var i=0; i<users.length; i++){
		for(var j=0; j<users[i].trips.length; j++){
			trips.push(users[i].trips[j]); 
		}
	}
	return trips; 
}

//Returns the length of the array of profiles the database holds
function length(){
	return users.length;
}

//Initialize Database
(function (){
	addUser('Brad', 18);
	addUser('Dan', 19); 
	addUser('Poseidon', 1); 

	users[0].addTrip(users[0].name, "State College", "Pittsburgh", 5, 10); 
	users[0].addTrip(users[0].name, "Pittsburgh", "State College", 5, 10); 
	users[0].addTrip(users[0].name, "State College", "Camp is Groovy", 5, 10); 

	users[1].addTrip(users[1].name, "State College", "Anywhere Else", 20, 300); 

})();

//Exports all needed functions for use in other modules
exports.length = length;
exports.getUser = getUser; 
exports.getTrips = getTrips; 
exports.addUser = addUser;
