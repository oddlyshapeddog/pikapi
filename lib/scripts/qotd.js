const wiki = require('wikiquotesjs')
const winston = require('winston')
const ERRORS = require('../constants/errors')

function getQOTD() {
  return wiki.QOTD()
}

function handleRequest() {
  return new Promise((resolve, reject) => {
    try {
      winston.info('Requesting QOTD')
      getQOTD().then(
        (quote) => {
          if (quote) {
            winston.debug(`QOTD: ${quote}`)
            resolve(quote)
          }
          else {
            reject(ERRORS.EMPTY_DOCUMENT)
          }
        },
        reject
      )
    } catch (err) {
      return reject(err)
    }
  })
}

module.exports = {
  endpoint: 'qotd',
  requestHandler: handleRequest
}
