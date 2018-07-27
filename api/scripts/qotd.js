const wiki = require('wikiquotesjs')
const winston = require('winston')
const ERRORS = require('../constants/errors')

const LIMIT = 500

function getQOTD() {
  return wiki.getQOTD()
}

function isValidQuote(quoteObject) {
  return (
    quoteObject.author &&
    quoteObject.text
  )
}

function getText(quoteObject) {
  if (!quoteObject || !quoteObject.text) {
    throw new Error(ERRORS.MALFORMATTED_RESPONSE)
  }
  if (
    typeof quoteObject.text === 'object' &&
    quoteObject.text &&
    'text' in quoteObject
  ) {
    return getText(quoteObject.text)
  }
  else if (
    typeof quoteObject.text !== 'string'
  ) {
    throw new Error(ERRORS.MALFORMATTED_RESPONSE)
  }
  else {
    return quoteObject.text
  }
}

function formatQuote(quoteObject) {
  const author = quoteObject.author
  let text = getText(quoteObject)
  const byline = `-${author}`
  const charactersLeft = LIMIT - byline.length - '“”'.length
  
  if (text.length > charactersLeft) {
    const ellipsis = '…'
    text = text.substring(0, charactersLeft - ellipsis.length + ellipsis)
  }

  return `“${text}” -${author}`
}

function handleRequest() {
  return new Promise((resolve, reject) => {
    try {
      winston.info('Requesting QOTD')
      getQOTD().then(
        (quote) => {
          winston.debug(`QOTD: ${quote}`)
          if (!quote) {
            reject(ERRORS.EMPTY_DOCUMENT)
          }
          else if (!isValidQuote(quote)) {
            reject(ERRORS.MALFORMATTED_RESPONSE)
          }
          else {
            resolve(formatQuote(quote))
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
