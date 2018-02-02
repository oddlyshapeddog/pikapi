const winston = require('winston')
const tracery = require('tracery-grammar')
const remoteDocumentLoader = require('../util/remote-document-loader')

function loadGrammarAndGenerateResult(remoteURL, origin, format) {
  return new Promise((resolve, reject) => {
    const options = {
      format: format || null,
      defaultFormat: 'cson'
    }
    remoteDocumentLoader.loadAndParse(remoteURL, options).then(
      (remoteFileContents) => {
        try {
          const response = generateResult(remoteFileContents, origin || 'origin')
          resolve(response)
        } catch(err) {
          reject(err)
        }
      },
      (err) => {
        reject(err)
      }
    )
  })
}

function generateResult(grammarObject, listName) {
  // sanity
  if (!(listName in grammarObject)) {
    winston.warn(`List not found: ${listName}`)
    throw new Error(`List ${listName} not found in grammar file!`)
  }

  winston.info(`Loading grammar...`)
  const grammar = tracery.createGrammar(grammarObject)

  // TODO custom modifiers
  winston.info('Adding base english modifiers...')
  grammar.addModifiers(tracery.baseEngModifiers)

  winston.info('Generating result...')
  const result = grammar.flatten('#' + listName + '#')

  if (!result) {
    winston.warn(`Tracery returned a falsy value!`)
    throw new Error(`Something went wrong while running Tracery!`)
  }

  return result
}

function handleRequest(params) {
  return new Promise((resolve, reject) => {
    // validate params
    if (!params || !params.url || !params.url.trim()) {
      return reject(new Error('The \'url\' parameter is missing!'))
    }

    loadGrammarAndGenerateResult(
      params.url,
      params.origin,
      params.format
    )
      .then(
        resolve,
        reject
      )
  })
}

module.exports = {
  endpoint: 'tracery',
  requestHandler: handleRequest
}
