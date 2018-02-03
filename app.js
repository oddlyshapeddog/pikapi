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

  if ('url' in event) {
    const newEvent = {}
    const keys = Object.keys(event)
    let urlIndex
    for (urlIndex = 0; urlIndex < keys.length; urlIndex++) {
      const key = keys[urlIndex]
      newEvent[key] = event[key]
      if (key === 'url') {
        break
      }
    }
    for (let i = urlIndex + 1; i < keys.length; i++) {
      const value = event[keys[i]]
      newEvent.url += `&${keys[i]}=${value}`
    }
    winston.debug(`URL found: ${newEvent.url}`)
    event = newEvent
  }

  return event
}

function handleEvent(route, event, handler, callback) {
  function sendSuccessResponse(body) {
    callback(
      null,
      buildResponse(
        200,
        body
      )
    )
  }

  function sendErrorResponse(error) {
    callback(
      null,
      buildResponse(
        500,
        JSON.stringify(error) || `Unknown error occurred while handling request ${JSON.parse(event)}`
      )
    )
  }

  winston.info(`GET /${route} ${JSON.stringify(event)}`)
  event = postProcessEvent(event)
  try {
    handler(event).then(sendSuccessResponse, sendErrorResponse)
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
