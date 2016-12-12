'use strict'

// logging
const winston = require('winston')

// parsing utils
const CSON = require('cson')
const YAML = require('js-yaml')

// HTTP utils
const request = require('request')
const filesize = require('filesize')

// constants
const MAX_REMOTE_FILE_SIZE = process.env.MAX_REMOTE_FILE_SIZE || 32 * 1024 // 32 kb
const MAX_REMOTE_FILE_SIZE_HUMAN_READABLE = filesize(MAX_REMOTE_FILE_SIZE)
const DEFAULT_REMOTE_FILE_FORMAT = process.env.DEFAULT_REMOTE_FILE_FORMAT || 'json'

const FORMATTERS = {
  plain: (data) => {
    return Promise.resolve(data)
  },
  cson: (data) => {
    return new Promise((resolve, reject) => {
      let parsedData = data
      //parsedData = normalizeCSON(data) // DEBUG
      parsedData = CSON.parse(parsedData)
      if (parsedData)
        resolve(parsedData)
      else
        reject(new Error('Invalid CSON!'))
    })
  },
  json: (data) => {
    return new Promise((resolve, reject) => {
      let parsedData = ''
      try {
        parsedData = JSON.parse(data)
        resolve(parsedData)
      } catch (err) {
        reject(err)
      }
    })
  },
  yaml: (data) => {
    return new Promise((resolve, reject) => {
      let parsedData = ''
      try {
        parsedData = YAML.safeLoad(data)
        resolve(parsedData)
      } catch (err) {
        reject(err)
      }
    }
  }
}

function getFormatter(format) {
  return FORMATTERS[format] || null
}

// function normalizeCSON(csonData) {
//   let lines = csonData.split(`\n`)
//
//   // normalize indentation
//   lines = lines.map(function(line) {
//     return line.replace(/^\s/, '  ')
//   })
//
//   return lines.join(`\n`)
// }

function handleRemoteResponse(response, formatter) {
  const p = new Promise()

  // reject overly large responses
  const contentLength = response.headersSent && response.getHeader('content-length')
  if (contentLength && parseInt(contentLength) > MAX_REMOTE_FILE_SIZE) {
    winston.warn(`Response too large! Content length: ${contentLength}`)
    p.reject(new Error(`The remote file must be smaller than ${MAX_REMOTE_FILE_SIZE_HUMAN_READABLE}`))
    return p
  }

  let body = ''
  
  response.on('data', (data) => {
    body += data

    // check payload against limit
    if (body.length > MAX_REMOTE_FILE_SIZE) {
      response.pause()
      winston.warn(`Response too large! Total bytes loaded: ${body.length}`)
      p.reject(new Error(`The remote file must be smaller than ${MAX_REMOTE_FILE_SIZE_HUMAN_READABLE}`))
      body = null
    }
  })

  response.on('end', () => {
    formatter(body)
      .then(
        (parsedData) => {
          p.resolve(parsedData)
        },
        (err) => {
          p.reject(err)
        }
      )
  })

  response.on('error', (err) => {
    p.reject(err)
  })

  return p
}

function loadAndParse(url, format) {
  format = format || DEFAULT_REMOTE_FILE_FORMAT
  const p = new Promise()
  const formatter = getFormatter(format)

  if (!formatter) {
    p.reject(new Error(`Unrecognized format: ${format}`))
  }

  request(url)
    .on('error', (err) => {
      p.reject(err)
    })
    .on('response', (response) => {
      handleRemoteResponse(response, formatter)
        .then(
          p.resolve,
          p.reject
        )
    })

  return p
}

module.exports = {
  loadAndParse: loadAndParse
}
