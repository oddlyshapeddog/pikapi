var url = require('url');
var http = require('http');
var winston = require('winston');
var filesize = require('filesize');


var urlWithUrlRegex = /^(.+)(https?:\/\/.*)$/gi;
var MAX_RESPONSE_SIZE = process.env.MAX_REMOTE_FILE_SIZE || 10 * 1024; // 10kb
var MAX_RESPONSE_SIZE_HUMAN_READABLE = filesize(MAX_RESPONSE_SIZE);


function getList(remoteURL, onSuccess, onFailure) {

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

                var list = listify(data);
                if(list) {
                    winston.info("List created successfully!");
                    onSuccess(list);
                }
                else {
                    winston.warn("List could not be created!");
                    onFailure("Could not create list!");
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
    // reject overly large responses
    var contentLength = response.headersSent && response.getHeader('content-length');
    if (contentLength && parseInt(contentLength) > MAX_RESPONSE_SIZE) {
        winston.warn("Response too large! Content length: " + contentLength);
        cb("The remote file must be smaller than " + MAX_RESPONSE_SIZE_HUMAN_READABLE);
        return;
    }

    var bytesLoaded = 0;
    var str = '';

    response.on('data', function(data) {
        bytesLoaded += data.length;

        // check payload against limit
        if (bytesLoaded > MAX_RESPONSE_SIZE) {
            response.pause();
            winston.warn("Response too large! Total bytes loaded: " + bytesLoaded);
            cb("The remote file must be smaller than " + MAX_RESPONSE_SIZE_HUMAN_READABLE);
            str = null;
            return;
        }

        str += data;
    });

    response.on('end', function() {
        cb(null, str);
    });

    response.on('error', function(err) {
        cb(err);
    });
}

function listify(str) {
    // reject empty strings
    if(!str.trim()) {
        return null;
    }

    var lineNumber = 1;
    var parts = str.split(/[\n\r]+/g).map(function(str) {
        return lineNumber++ + ' : ' + str;
    });
    return parts.join("\n");
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
        getList(
            parts.query.url,
            function(list) {
                response.write(list);
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
    endpoint: '/list',
    requestHandler: handleRequest
};
