require('app-module-path').addPath(require('app-root-path').path + '/lib')

const url = require('url')
const winston = require('winston')

function getTaggedURL(amazonURL, tag) {
  // the URL comes encoded; decode it!
  amazonURL = decodeURIComponent(amazonURL)
  winston.debug('Got URL ' + amazonURL)

  const parts = url.parse(amazonURL, true)
  winston.debug(parts)

  // check that it's valid
  if (!parts) {
    throw new Error('Not a valid URL!')
  }

  winston.debug('URL deemed valid!')

  // check that it's http
  if (!parts.protocol || !parts.protocol.match(/^https?:$/g)) {
    throw new Error('Not a valid HTTP(S) URL!')
  }

  winston.debug('URL is HTTP!')

  // check that it's amazon
  if (!parts.hostname || !parts.hostname.match(/^[^\/]*amazon\./gi)) {
    throw new Error('Not an Amazon URL!')
  }

  winston.debug('It\'s an Amazon URL!')

  if (!parts.query) {
    parts.query = {}
  }
  parts.query.tag = tag

  // delete search 'cause otherwise it'll override query
  delete parts.search

  winston.debug('Adding tag ' + tag)
  const formattedURL = url.format(parts)
  winston.debug('Added tag: ' + formattedURL)
  return formattedURL
}

function handleRequest(params) {

  if ('url' in params) {
    let url = params.url
    for (let paramName in params) {
      if (paramName === 'url' || paramName === 'tag') continue
      const paramValue = params[paramName]
      url += `&${paramName}=${paramValue}`
    }
    params.url = url
    winston.debug(`URL found: ${url}`)
  }

  return new Promise((resolve, reject) => {
    // validate params
    if (!params) {
      return reject(new Error('The \'url\' and \'tag\' parameters are missing!'))
    }
    if (!params.url || !params.url.trim()) {
      return reject(new Error('The \'url\' parameter is missing!'))
    }
    if (!params.tag || !params.tag.trim()) {
      return reject(new Error('The \'tag\' parameter is missing!'))
    }

    try {
      winston.info(`Adding tag \'${params.tag}\' to URL \'${params.url}\'`)
      const taggedURL = getTaggedURL(params.url, params.tag)
      return resolve(taggedURL)
    } catch (err) {
      return reject(err)
    }
  })
}


module.exports = {
  endpoint: 'build-amazon-url',
  requestHandler: handleRequest
}
