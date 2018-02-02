const winston = require('winston')

const scripts = {}

function registerScript(endpoint, requestHandler) {
  winston.info(`Setting up ${endpoint} request handler`)
  scripts[endpoint] = (event, context, callback) => {
    handleEvent(endpoint, event, requestHandler, callback)
  }
}

function postProcessEvent(event) {
  const newEvent = {}
  if ('url' in event) {
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
      newEvent.url += `&${key}=${value}`
    }
    winston.debug(`URL found: ${newEvent.url}`)
  }
  return newEvent
}

function handleEvent(route, event, handler, callback) {
  winston.info(`GET /${route} ${JSON.stringify(event)}`)
  event = postProcessEvent(event)
  handler(event).then(
    (response) => {
      callback(
        null,
        buildResponse(
          200,
          response
        )
      )
    },
    (err) => {
      callback(
        null,
        buildResponse(
          500,
          err
        )
      )
    }
  )
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
