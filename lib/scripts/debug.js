require('app-module-path').addPath(require('app-root-path').path + '/lib')

const winston = require('winston')

const startTime = new Date().getTime()

function getUptime() {
  const currentTime = new Date().getTime()
  return currentTime - startTime
}

function handleRequest() {
  return new Promise((resolve) => {
    winston.info(`Returning debug info`)
    const response = [
      `Uptime: ${getUptime()}`
    ].join('; ')
    resolve(response)
  })
}


module.exports = {
  endpoint: 'debug',
  requestHandler: handleRequest
}
