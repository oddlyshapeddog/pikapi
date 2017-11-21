'use strict'

const path = require('path')

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
const DEFAULT_REMOTE_FILE_FORMAT = process.env.DEFAULT_REMOTE_FILE_FORMAT || 'plain'

const FORMATTERS = {
  // txt: (data) => {
  //   winston.debug('Formatting plain data')
  //   return Promise.resolve(data)
  // },
  plain: (data) => {
    winston.debug('Formatting plain data')
    return Promise.resolve(data)
  },
  cson: (data) => {
    return new Promise((resolve, reject) => {
      let parsedData = data
      winston.debug('Formatting cson data')
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
    })
  }
}

function detectFormat(url) {
  let ext = path.extname(url)
  ext = ext.split('.').pop()
  return ext in FORMATTERS ? ext : null
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
  return new Promise((resolve, reject) => {
    winston.debug('Got remote response')
    // reject overly large responses
    const contentLength = response.headersSent && response.getHeader('content-length')
    if (contentLength && parseInt(contentLength) > MAX_REMOTE_FILE_SIZE) {
      winston.warn(`Response too large! Content length: ${contentLength}`)
      return reject(new Error(`The remote file must be smaller than ${MAX_REMOTE_FILE_SIZE_HUMAN_READABLE}`))
    }

    let body = ''
    
    response.on('data', (data) => {
      body += data

      // check payload against limit
      if (body.length > MAX_REMOTE_FILE_SIZE) {
        response.pause()
        winston.warn(`Response too large! Total bytes loaded: ${body.length}`)
        body = null
        return reject(new Error(`The remote file must be smaller than ${MAX_REMOTE_FILE_SIZE_HUMAN_READABLE}`))
      }
    })

    response.on('end', () => {
      winston.debug(`Response: ${body.substring(0, 64)}...`)
      formatter(body)
        .then(
          resolve,
          reject
        )
    })

    response.on('error', reject)
  })
}

function loadAndParse(url, options) {
  options = options || {}
  options.format = options.format || null
  options.defaultFormat = options.defaultFormat || DEFAULT_REMOTE_FILE_FORMAT
  format = options.format || detectFormat(url) || options.defaultFormat
  return new Promise((resolve, reject) => {
    const formatter = getFormatter(format)

    if (!formatter) {
      return reject(new Error(`Unrecognized format: ${format}`))
    }

    winston.debug(`Loading file as: ${format}`)

    request(url)
      .on('error', reject)
      .on('response', (response) => {
        handleRemoteResponse(response, formatter)
          .then(
            resolve,
            reject
          )
      })
  })
}

module.exports = {
  loadAndParse: loadAndParse
}
