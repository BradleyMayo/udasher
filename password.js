var bcrypt = require('bcrypt');

exports.hash = function(password, callback){
	bcrypt.genSalt(10, function(err, salt) {
		bcrypt.hash(password, salt, function(err, hash) {
		    callback(null, hash);
		});
	});
};

exports.validate = function(password, hash, callback){
	bcrypt.compare(password, hash, function(err, res){
		callback(err, res);
	});
};
	

