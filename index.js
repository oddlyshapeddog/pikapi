var lambdaExpress = require('lambda-express')
var app           = require('./app')

// or, if you want to do some preprocessing before delegating, pass a function in:
exports.handler = lambdaExpress.appHandler(function(event, context) { // eslint-disable-line no-unused-vars
  return app
})
