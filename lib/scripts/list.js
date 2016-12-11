'use strict'

const winston = require('winston')
const remoteDocumentLoader = require('../util/remote-document-loader')

function getList(remoteURL) {
  const p = new Promise()

  remoteDocumentLoader.loadAndParse(remoteURL, 'plain')
    .then(
      (remoteFileContents) => {
        try {
          const list = listify(remoteFileContents)
          p.resolve(list)
        } catch(err) {
          p.reject(err)
        }
      }
    )

  return p
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
  const p = new Promise()

  // validate params
  if (!params || !params.url || !params.url.trim()) {
    p.reject(new Error('The \'url\' parameter is missing!'))
    return p
  }

  winston.log(`Getting list from ${params.url}...`)
  getList(params.url)
    .then(
      p.resolve,
      p.reject
    )

  return p
}


module.exports = {
  endpoint: '/list',
  requestHandler: handleRequest
}
