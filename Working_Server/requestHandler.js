var fs = require('fs');

function start(response, postData) {
	console.log("Request handler 'start' was called.");
	var body = fs.readFile("index.html", function(err, html){
		if(err){
			throw err;
		} else {
			response.writeHead(200, {"Content-Type": "text/html"});
			response.write(html);
			response.end();
		}	
	});
}

function upload(response, postData) {
	console.log("Request handler 'upload' was called.");
	response.writeHead(200, {"Content-Type": "text/plain"});
	response.write("You've sent: " + postData);
	response.end();
}
exports.start = start;
exports.upload = upload;

