const url = require('url')
const winston = require('winston')

function getTaggedURL(amazonURL, tag) {
  // the URL comes encoded; decode it!
  amazonURL = decodeURIComponent(amazonURL)
  winston.info('Got URL ' + amazonURL)

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
  winston.info('Added tag: ' + formattedURL)
  return formattedURL
}

function handleRequest(params) {
  const p = new Promise()

  // validate params
  if (!params) {
    p.reject(new Error('The \'url\' and \'tag\' parameters are missing!'))
    return p
  }
  if (!params.url || !params.url.trim()) {
    p.reject(new Error('The \'url\' parameter is missing!'))
    return p
  }
  if (!params.tag || !params.tag.trim()) {
    p.reject(new Error('The \'tag\' parameter is missing!'))
    return p
  }

  try {
    winston.log(`Adding tag \'${params.tag}\' to URL \'${params.url}\'`)
    const taggedURL = getTaggedURL(params.url, params.tag)
    p.resolve(taggedURL)
  } catch (err) {
    p.reject(err)
  }

  return p
}


module.exports = {
  endpoint: '/build-amazon-url',
  requestHandler: handleRequest
}
