const winston = require('winston')

const scripts = {}

function registerScript(endpoint, requestHandler) {
  winston.debug(`Setting up ${endpoint} request handler`)
  scripts[endpoint] = (event, context, callback) => {
    handleEvent(endpoint, event, requestHandler, callback)
  }
}

function validateEvent(event) {
  if (!event) {
    throw new Error(`No event specified`)
  }

  if (!event.queryStringParameters) {
    event = {
      queryStringParameters: event
    }
  }

  return event
}

function handleEvent(route, event, handler, callback) {
  function sendSuccessResponse(body) {
    const bodyString = body.toString()
    winston.info(`[RESPONSE] ${bodyString}`)
    callback(
      null,
      buildResponse(
        200,
        bodyString
      )
    )
  }

  function sendErrorResponse(error) {
    const errorString = error.toString()
    winston.error(errorString)
    callback(
      null,
      buildResponse(
        200,
        `Error: ${errorString}` || `Unknown error occurred while handling request ${JSON.parse(event)}`
      )
    )
  }

  winston.info(`GET /${route} ${JSON.stringify(event)}`)
  try {
    validateEvent(event)
    handler(event.queryStringParameters)
      .then(
        sendSuccessResponse,
        sendErrorResponse
      )
  } catch(e) {
    sendErrorResponse(e)
  }
}

function buildResponse(statusCode, body) {
  return {
    statusCode: statusCode,
    headers: {
      'Content-Type': 'text/plain',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET',
      'Access-Control-Allow-Credentials': true,
    },
    body: body
  }
}

module.exports = {
  registerScript: registerScript,
  scripts: scripts
}
