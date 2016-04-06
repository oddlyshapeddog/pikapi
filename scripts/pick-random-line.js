var url = require('url');
var http = require('http');
var winston = require('winston');


var urlWithUrlRegex = /^(.+)(https?:\/\/.*)$/gi;


function getLine(remoteURL, query, onSuccess, onFailure) {

    var urlParts = url.parse(remoteURL, true);
    var requestOptions = {
        host: urlParts.hostname,
        path: urlParts.path
    };

    if(url.port && url.port != '80') {
        requestOptions.port = url.port;
    }

    winston.info("Querying " + remoteURL + "...");
    http.request(
        requestOptions,
        function(response) {
            winston.info("Request successful.");
            handleRemoteResponse(response, function(err, data) {
                if(err) {
                    winston.warn("Error while retrieving remote document: " + err);
                    onFailure("Connection error: " + err);
                    return;
                }

                if(!data || !data.trim()) {
                    winston.warn("Request succeeded but document was empty!");
                    onFailure("Empty document!");
                    return;
                }

                var line = getLineFromString(data, query);
                if(line) {
                    winston.info("Line found: " + line);
                    onSuccess(line);
                }
                else if(query == null) {
                    onFailure("Could not find a non-empty line!");
                }
                else if(typeof query == 'string') {
                    onFailure("Could not find a line containing '" + query + "'!");
                }
                else {
                    onFailure("Line " + query + " is empty or nonexistent!");
                }
            });
        }
    ).on(
        'error',
        function(err) {
            winston.warn("Request unsuccessful.");
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
        cb(null, str);
    });

    response.on('error', function(err) {
        cb(err);
    });
}

function getLineFromString(str, query) {
    // reject empty strings
    if(!str.trim()) {
        return null;
    }

    winston.info("Query: " + query + " (" + typeof query + ")");

    if(typeof query == 'string') {
        return searchLineInString(str, query);
    }
    else {
        return getNumberedLineFromString(str, query);
    }
}

function getNumberedLineFromString(str, lineNumber) {
    var parts = str.split(/[\n\r]+/g);
    var line;

    if(lineNumber !== null) {
        if(lineNumber >= 1 && parts[lineNumber - 1]) {
            line = parts[lineNumber - 1];
        }
        else {
            line = null;
        }
    }
    else {
        do {
            var idx = Math.floor(Math.random() * parts.length);
            line = parts[idx];
        } while(!line.trim());
    }
    return line;
}

function searchLineInString(str, query) {
    var parts = str.split(/[\n\r]+/g);
    var matchingLines = [];

    for(var i=0; i<parts.length; i++) {
        var line = parts[i];
        if(line.toLowerCase().indexOf(query) >= 0) {
            matchingLines.push(line);
        }
    }

    winston.info("Matching lines: " + matchingLines.join(' | '));

    var idx = Math.floor(Math.random() * matchingLines.length);
    return matchingLines[idx];
}

function handleRequest(request, response, cb) {
    var requestURL = request.url;

    // if we spot a URL, encode everything from that URL forward
    var matches = urlWithUrlRegex.exec(requestURL);
    if(matches && matches[1] && matches[2]) {
        var encodedSecondURL = encodeURIComponent(matches[2]);
        requestURL = requestURL.replace(urlWithUrlRegex, "$1" + encodedSecondURL);
        winston.log('URL encoded to ' + requestURL);
    }

    var parts = url.parse(requestURL, true);
    if(parts.query && parts.query.url) {
        // if line number not specified, default to null,
        // which will result in a random line being selected
        var query = parts.query.line;
        if(!query) {
            query = null;
        }
        else if(!isNaN(query)) {
            // query guaranteed to be numeric
            query = parseInt(query);
        }
        else {
            query = query.toLowerCase();
        }

        getLine(
            parts.query.url,
            query,
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
