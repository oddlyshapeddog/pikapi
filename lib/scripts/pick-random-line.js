'use strict'

const winston = require('winston')
const ERRORS = require('../constants/errors')
const remoteDocumentLoader = require('../util/remote-document-loader')

function getLine(url, query) {
  return new Promise((resolve, reject) => {
    remoteDocumentLoader.loadAndParse(url)
      .then(
        (remoteFileContents) => {
          try {
            const line = getLineFromString(remoteFileContents, query)
            resolve(line)
          } catch(err) {
            reject(err)
          }
        }
      )
  })
}

function getLineFromString(str, line) {
  // reject empty strings
  if (!str.trim()) {
    throw new Error(ERRORS.EMPTY_DOCUMENT)
  }

  winston.info(`Retrieving line ${line} from file`)

  if (line === null || typeof line === 'undefined') {
    return getRandomLineFromString(str)
  }
  else if(isNaN(line)) {
    return searchLineInString(str, line)
  }
  else { // numeric
    return getNumberedLineFromString(str, parseInt(line))
  }
}

function getNumberedLineFromString(str, lineNumber) {
  const parts = str.split(/[\n\r]+/g)
  let line = null
  if (lineNumber >= 1 && parts[lineNumber - 1]) {
    line = parts[lineNumber - 1]
    if (!line) {
      throw new Error(`Line ${lineNumber} does not exist!`)
    }
  }
  return line
}

function getRandomLineFromString(str) {
  const parts = str.split(/[\n\r]+/g)
  let line = null
  do {
    const idx = Math.floor(Math.random() * parts.length)
    line = parts[idx]
  } while (!line.trim())
  return line
}

function searchLineInString(str, query) {
  const parts = str.split(/[\n\r]+/g)
  const matchingLines = []

  for (let i = 0; i < parts.length; i++) {
    const line = parts[i]
    if (line.toLowerCase().indexOf(query) >= 0) {
      matchingLines.push(line)
    }
  }

  winston.debug(`${matchingLines.length} matching lines found`)

  if (matchingLines.length <= 0) {
    throw new Error(`Could not find a line containing "${query}"!`)
  }

  const idx = Math.floor(Math.random() * matchingLines.length)
  return matchingLines[idx]
}

function handleRequest(params) {
  return new Promise((resolve, reject) => {
    // validate params
    if (!params || !params.url || !params.url.trim()) {
      return reject(new Error('The \'url\' parameter is missing!'))
    }

    getLine(params.url, params.line)
      .then(
        resolve,
        reject
      )
  })
}


module.exports = {
  endpoint: 'pick-random-line',
  requestHandler: handleRequest
}
