# pikapi

A pluggable API framework for Nightbot APIs.

The `api.js` module starts a basic HTTP server on port 6749 and loads any modules in the `scripts/` folder. You may use the `npm start` command to boot it up.

Each module in `scripts/` adds a request handler and maps it to an endpoint. Modules must follow this pattern:

    module.exports = {
        endpoint: '/pick-random-line',
        requestHandler: function(request, response, callback) {
            // handle request...
            response.write(str);
            callback();
        }
    };

API responses are always plain text and always return a 200 status code (as per the Nightbot spec).
