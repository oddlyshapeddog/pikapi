var url = require('url');
var http = require('http');


var urlWithUrlRegex = /^(.+)(https?:\/\/.*)$/gi;


function getRandomLine(remoteURL, onSuccess, onFailure) {

	var urlParts = url.parse(remoteURL, true);
	var requestOptions = {
		host: urlParts.hostname,
		path: urlParts.path
	};

	if(url.port && url.port != '80') {
		requestOptions.port = url.port;
	}

	console.log("Querying " + remoteURL + "...");
	http.request(
		requestOptions,
		function(response) {
			console.log("Request successful.");
			handleRemoteResponse(response, function(data) {
				var line = getRandomLineFromString(data);
				if(line) {
					console.log("Line found: " + line);
					onSuccess(line);
				}
				else {
					console.log("Line not found!");
					onFailure("Could not find a non-empty line!");
				}
			});
		}
	).on(
		'error',
		function(err) {
			console.log("Request unsuccessful.");
			onFailure(err);
		}
	).end();
}

function handleRemoteResponse(response, cb) {
	var str = '';

	response.on('data', function(data) {
		str += data;
	});

	response.on('end', function() {
		cb(str);
	});
}

function getRandomLineFromString(str) {
	// reject empty strings
	if(!str.trim()) {
		return null;
	}

	var parts = str.split("\n");
	var line = '';
	do {
		var idx = Math.floor(Math.random() * parts.length);
		line = parts[idx];
	} while(!line.trim());

	return line;
}

function handleRequest(request, response, cb) {
	var requestURL = request.url;

	// if we spot a URL, encode everything from that URL forward
	var matches = urlWithUrlRegex.exec(requestURL);
	if(matches && matches[1] && matches[2]) {
		console.log('URL contains URL!');
		var encodedSecondURL = encodeURIComponent(matches[2]);
		requestURL = requestURL.replace(urlWithUrlRegex, "$1" + encodedSecondURL);
		console.log('URL encoded to ' + requestURL);
	}

	var parts = url.parse(requestURL, true);
	if(parts.query && parts.query.url) {
		getRandomLine(
			parts.query.url,
			function(line) {
				response.write(line);
				cb();
			},
			function(err) {
				response.write("Error! " + err);
				cb();
			}
		);
	}
	else {
		response.write("Invalid request! You must provide the 'url' parameter.");
	}
}


module.exports = {
	endpoint: '/pick-random-line',
	requestHandler: handleRequest
};
