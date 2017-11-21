'use strict'

const winston = require('winston')
const remoteDocumentLoader = require('../util/remote-document-loader')

function getList(remoteURL) {
  return new Promise((resolve, reject) => {
    remoteDocumentLoader.loadAndParse(remoteURL)
      .then(
        (remoteFileContents) => {
          try {
            const list = listify(remoteFileContents)
            resolve(list)
          } catch(err) {
            reject(err)
          }
        }
      )
  })
}

function listify(str) {
  // reject empty strings
  if (!str.trim()) {
    throw new Error('The remote document was empty!')
  }

  let lineNumber = 1
  const parts = str.split(/[\n\r]+/g).map(function (str) {
    return lineNumber++ + ' : ' + str
  })
  return parts.join(`\n`)
}

function handleRequest(params) {
  return new Promise((resolve, reject) => {
    // validate params
    if (!params || !params.url || !params.url.trim()) {
      return reject(new Error('The \'url\' parameter is missing!'))
    }

    winston.info(`Getting list from ${params.url}...`)
    getList(params.url)
      .then(
        resolve,
        reject
      )
  })
}


module.exports = {
  endpoint: '/list',
  requestHandler: handleRequest
}
