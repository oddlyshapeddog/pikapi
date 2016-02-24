var fs = require('fs');
var url = require('url');
var http = require('http');
var path = require('path');
var winston = require('winston');


var server = null;
var scripts = {};
var SCRIPTS_PATH = './scripts';
var SCRIPT_REGEX = /\.js$/gi
var urlWithUrlRegex = /^(.+)(https?:\/\/.*)$/gi;


function loadScripts() {
	console.log("Looking for scripts in '" + SCRIPTS_PATH + "'...");
	var files = fs.readdirSync(SCRIPTS_PATH);
	for(var i=0, l=files.length; i<l; i++) {
		if(files[i].match(SCRIPT_REGEX)) {
			var scriptPath = path.resolve(path.join(SCRIPTS_PATH, files[i]));
			var script = require(scriptPath);
			scripts[script.endpoint] = script.requestHandler;
			console.log("Mapping " + files[i] + " to " + script.endpoint);
		}
	}
	return scripts;
}

function handleRequest(request, response) {
	var requestURL = request.url;
	var parts = url.parse(requestURL, true);
	var endpoint = parts.pathname;
	
	response.writeHead(200, {"Content-type": "text/plain"});
	if(endpoint in scripts) {
		scripts[endpoint](request, response, function() {
			response.end();
		});
	}
	else {
		response.write("Invalid request! Endpoint " + endpoint + " not recognized.");
		response.end();
	}
}

function startServer() {
	http.createServer(handleRequest).listen(6749);
}


winston.setLevels();
loadScripts();
startServer();
