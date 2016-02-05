var url = require('url');

var urlWithUrlRegex = /^(.+)(https?:\/\/.*)$/gi;


function getTaggedURL(amazonURL, tag) {
	// the URL comes encoded; decode it!
	amazonURL = decodeURIComponent(amazonURL);
	console.log('Got URL ' + amazonURL);

	var parts = url.parse(amazonURL, true);
	console.log(parts);

	// check that it's valid
	if(!parts) {
		throw new Error('Not a valid URL!');
	}

	console.log('URL deemed valid!');

	// check that it's http
	if(!parts.protocol || !parts.protocol.match(/^https?:$/g)) {
		throw new Error('Not a valid HTTP(S) URL!');
	}

	console.log('URL is HTTP!');

	// check that it's amazon
	if(!parts.hostname || !parts.hostname.match(/^[^\/]*amazon\./gi)) {
		throw new Error('Not an Amazon URL!');
	}

	console.log('URL is Amazon!');

	if(!parts.query) {
		parts.query = {};
	}
	parts.query.tag = tag;

	// delete search 'cause otherwise it'll override query
	delete parts.search;

	console.log('Adding tag ' + tag);
	var formattedURL = url.format(parts);
	console.log('Added tag: ' + formattedURL);
	return formattedURL;
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
	if(parts.query && parts.query.tag && parts.query.url) {
		var taggedURL;
		try {
			taggedURL = getTaggedURL(parts.query.url, parts.query.tag);
			response.write(taggedURL);
		}
		catch(e) {
			response.write("Invalid request! " + e);
		}
		cb();
	}
	else {
		response.write("Invalid request! You must provide the 'tag' and 'url' parameters.");
		cb();
	}
}


module.exports = {
	endpoint: '/build-amazon-url',
	requestHandler: handleRequest
};
