const winston = require('winston')
const tracery = require('tracery-grammar')
const remoteDocumentLoader = require('../util/remote-document-loader')

function loadGrammarAndGenerateResult(remoteURL, list, format) {
  const p = new Promise()

  remoteDocumentLoader.loadAndParse(remoteURL, format, list)
    .then(
      (remoteFileContents) => {
        try {
          const response = generateResult(remoteFileContents, list || 'origin')
          p.resolve(response)
        } catch(err) {
          p.reject(err)
        }
      },
      (err) => {
        p.reject(err)
      }
    )
  
  return p
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
  const p = new Promise()

  // validate params
  if (!params || !params.url || !params.url.trim()) {
    p.reject(new Error('The \'url\' parameter is missing!'))
    return p
  }

  loadGrammarAndGenerateResult(
    params.url,
    params.list,
    params.format
  )
    .then(
      p.resolve,
      p.reject
    )
}

module.exports = {
  endpoint: '/tracery',
  requestHandler: handleRequest
}
