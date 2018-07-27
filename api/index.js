require('dotenv').config()

const lambdaExpress = require('lambda-express')
const isLambda      = require('is-lambda')
const logger        = require('./util/logger')
const db            = require('./db/index')
const app           = require('./app')

function init() {
  logger.silly('INIT')
  db.connect().then(
    () => {
      logger.debug('INIT_ENVIRONMENT_DETECTED', { isLambda })
      if (isLambda) {
        exports.handler = lambdaExpress.appHandler(function(event, context) { // eslint-disable-line no-unused-vars
          return app
        })
      }
      else {
        const port = process.env.PORT || 3000
        app.listen(
          port,
          () => logger.debug('INIT_STARTED_LISTENING', { port })
        )
      }
    },
    error => {
      logger.error('INIT_ERROR', {error})
      throw error
    }
  )
}

init()
