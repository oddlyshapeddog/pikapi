const winston = require('winston')

const scripts = {}

function registerScript(endpoint, requestHandler) {
  winston.info(`Setting up ${endpoint} request handler`)
  scripts[endpoint] = (event, context, callback) => {
    handleEvent(endpoint, event, requestHandler, callback)
  }
}

function postProcessEvent(event) {
  if ('queryStringParameters' in event) {
    event = event.queryStringParameters
  }

  return event
}

function handleEvent(route, event, handler, callback) {
  function sendSuccessResponse(body) {
    callback(
      null,
      buildResponse(
        200,
        body.toString()
      )
    )
  }

  function sendErrorResponse(error) {
    callback(
      null,
      buildResponse(
        200,
        `Error: ${error.toString()}` || `Unknown error occurred while handling request ${JSON.parse(event)}`
      )
    )
  }

  winston.info(`GET /${route} ${JSON.stringify(event)}`)
  event = postProcessEvent(event)
  try {
    handler(event)
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
    headers: { 'Content-Type': 'text/plain' },
    body: body
  }
}

module.exports = {
  registerScript: registerScript,
  scripts: scripts
}
