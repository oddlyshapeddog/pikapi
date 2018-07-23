require('dotenv').config()

const lambdaExpress = require('lambda-express')
const isLambda      = require('is-lambda')
const logger        = require('./lib/util/logger')
const app           = require('./app')

logger.debug('ENVIRONMENT_DETECTED', { isLambda })
if (isLambda) {
  exports.handler = lambdaExpress.appHandler(function(event, context) { // eslint-disable-line no-unused-vars
    return app
  })
}
else {
  const port = process.env.PORT || 3000
  app.listen(
    port,
    () => logger.debug('STARTED_LISTENING', { port })
  )
}
