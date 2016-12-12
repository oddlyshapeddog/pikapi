'use strict'

const winston = require('winston')
const remoteDocumentLoader = require('../util/remote-document-loader')

function getLine(url, query) {
  return new Promise((resolve, reject) => {
    remoteDocumentLoader.loadAndParse(url, 'plain')
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
    throw new Error('The remote document is empty!')
  }

  winston.info(`Retrieving line ${line} from file`)

  if (isNaN(line)) {
    return searchLineInString(str, line)
  } else {
    return getNumberedLineFromString(str, parseInt(line))
  }
}

function getNumberedLineFromString(str, lineNumber) {
  const parts = str.split(/[\n\r]+/g)
  let line = null

  if (lineNumber !== null) {
    if (lineNumber >= 1 && parts[lineNumber - 1]) {
      line = parts[lineNumber - 1]
      if (!line) {
        throw new Error(`Line ${lineNumber} does not exist!`)
      }
    }
  } else {
    do {
      const idx = Math.floor(Math.random() * parts.length)
      line = parts[idx]
    } while (!line.trim())
  }
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

  if (matchingLines.length) {
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
  endpoint: '/pick-random-line',
  requestHandler: handleRequest
}
