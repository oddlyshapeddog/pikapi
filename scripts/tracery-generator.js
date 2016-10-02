var url = require('url');
var http = require('http');
var winston = require('winston');
var filesize = require('filesize');
var tracery = require('tracery-grammar');
var CSON = require('cson');
var YAML = require('js-yaml');


var urlWithUrlRegex = /^(.+)(https?:\/\/.*)$/gi;
var DEFAULT_LIST_NAME = "origin";
var DEFAULT_FORMAT = "json";
var MAX_RESPONSE_SIZE = process.env.MAX_REMOTE_FILE_SIZE || 32 * 1024; // 32kb
var MAX_RESPONSE_SIZE_HUMAN_READABLE = filesize(MAX_RESPONSE_SIZE);


function loadGrammar(remoteURL, format, callback) {

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
            handleRemoteResponse(response, format, function(err, jsonGrammar) {
                if(err) {
                    winston.warn("Error while retrieving remote document: " + err);
                    callback("Connection error: " + err);
                    return;
                }

                if(!jsonGrammar) {
                    winston.warn("Request succeeded but document was empty!");
                    callback("Empty document!");
                    return;
                }

                // grammar ok
                callback(null, jsonGrammar);
            });
        }
    ).on(
        'error',
        function(err) {
            winston.warn("Request unsuccessful.");
            callback(err);
        }
    ).end();
}

function handleRemoteResponse(response, format, cb) {
    // reject overly large responses
    var contentLength = response.headersSent && response.getHeader('content-length');
    if (contentLength && parseInt(contentLength) > MAX_RESPONSE_SIZE) {
        winston.warn("Response too large! Content length: " + contentLength);
        cb("The remote file must be smaller than " + MAX_RESPONSE_SIZE_HUMAN_READABLE);
        return;
    }

    var bytesLoaded = 0;
    var remoteContent = '';

    response.on('data', function(data) {
        bytesLoaded += data.length;

        // check payload against limit
        if (bytesLoaded > MAX_RESPONSE_SIZE) {
            response.end();
            winston.warn("Response too large! Total bytes loaded: " + bytesLoaded);
            cb("The remote file must be smaller than " + MAX_RESPONSE_SIZE_HUMAN_READABLE);
            remoteContent = null;
            return;
        }

        remoteContent += data;
    });

    response.on('end', function() {
        // check things
        if (!remoteContent) {
            winston.warn("Empty response!");
            cb("The server returned an empty response!");
            return;
        }

        // validate and parse
        var remoteContentObject = parseData(remoteContent, format);
        if (!remoteContentObject) {
            winston.warn(format.toUpperCase() + " parsing error!");
            cb("The remote response is not valid " + format.toUpperCase() + "!");
            return;
        }

        // happy little path
        cb(null, remoteContentObject);
    });

    response.on('error', function(err) {
        cb(err);
    });
}

function parseData(data, format) {
    var parsedData = null;
    winston.info("Parsing " + format + " data...");
    if (format == 'json') {
        parsedData = JSON.parse(data);
    }
    else if (format == 'cson') {
        parsedData = CSON.parse(data);
    }
    else if (format == 'yaml') {
        try {
            parsedData = YAML.safeLoad(data);
        } catch(err) {
            winston.warn("Error loading YAML file: " + err);
        }
    }
    else {
        winston.warn("Unrecognized format: " + format);
    }
    winston.info(parsedData);
    return parsedData;
}

function generateResult(grammarObject, listName) {
    // sanity
    if (!(listName in grammarObject)) {
        winston.warn("List not found: " + listName);
        throw new Error("List \"" + listName + "\" not found in grammar file!");
    }

    winston.info("Loading grammar...");
    var grammar = tracery.createGrammar(grammarObject);

    // TODO custom modifiers
    winston.info("Adding base english modifiers...");
    grammar.addModifiers(tracery.baseEngModifiers);

    winston.info("Generating result...");
    var result = grammar.flatten("#" + listName + "#");

    if  (!result) {
        winston.warn("Tracery returned a falsy value!");
        throw new Error("Something went wrong while running Tracery!");
    }

    return result;
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
        // if list name not specified, default to null,
        // which will result in a the default list name being selected
        var listName = parts.query.list;
        if(!listName) {
            listName = DEFAULT_LIST_NAME;
        }
        
        var format = parts.query.format;
        if(!format) {
            format = DEFAULT_FORMAT;
        }

        // we don't validate or sanitize the list name because json

        loadGrammar(
            parts.query.url,
            format,
            function(err, grammar) {
                if(err) {
                    response.write("Error while loading grammar! " + err);
                }
                else {
                    try {
                        var result = generateResult(grammar, listName);
                        response.write(result);
                    } catch(err) {
                        response.write("Error while generating result! " + err);
                    }
                }
                cb();
            }
        );
    }
    else {
        response.write("Invalid request! You must provide the 'url' parameter.");
    }
}


module.exports = {
    endpoint: '/tracery',
    requestHandler: handleRequest
};
