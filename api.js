'use strict'

const fs = require('fs')
const koa = require('koa')
const querystring = require('querystring')
const path = require('path')
const winston = require('winston')
require('app-module-path').addPath(__dirname + '/lib')
require('dotenv').config({silent: true})
winston.level = process.env.LOG_LEVEL || 'debug'

const scripts = {}
const SCRIPTS_PATH = './lib/scripts'
const SCRIPT_REGEX = /\.js$/gi
const urlWithUrlRegex = /^(.+)(https?:\/\/.*)$/gi

const app = koa()

function setupServer() {
  winston.info('Setting up server middleware')

  app.use(function *(next) {
    let querystring = this.request.querystring
    const matches = urlWithUrlRegex.exec(querystring)
    if(matches && matches[1] && matches[2]) {
      const encodedURL = encodeURIComponent(matches[2])
      querystring = querystring.replace(urlWithUrlRegex, '$1' + encodedURL)
      winston.debug(`Query string encoded to ${querystring}`)
    }
    this.set('PostProcessedQuery', querystring)
    yield next
  })

  app.use(function *(next) {
    const endpoint = this.request.path
    if (endpoint && scripts[endpoint]) {
      winston.log(`GET ${endpoint}`)
      const params = querystring.parse(this.get('PostProcessedQuery'))

      winston.debug(params)
      scripts[endpoint](params)
        .then((result) => {
          this.body += result
        },
        (err) => {
          winston.log(`Request failed! Error: ${err}`)
          this.body += `Error: ${err}`
        })
    }
    else {
      this.body = `Endpoint not recognized!`
    }
    yield next
  })
}

function loadScripts() {
  winston.info(`Looking for scripts in '${SCRIPTS_PATH}'...`)
  const files = fs.readdirSync(SCRIPTS_PATH)
  winston.debug(`${files.length} files found`)
  for (let i = 0, l = files.length; i < l; i++) {
    if (files[i].match(SCRIPT_REGEX)) {
      const scriptPath = path.join('scripts/', files[i])
      winston.debug(`Found script ${files[i]} at ${scriptPath}`)
      const script = require(scriptPath)
      winston.log(`Mapping ${files[i]} to ${script.endpoint}`)
      scripts[script.endpoint] = script.requestHandler
    }
    else {
      winston.debug(`${files[i]} is not a javascript file`)
    }
  }
  return scripts
}

function startServer() {
  winston.info('Starting server...')
  const port = process.env.PORT || 6749
  app.listen(port)
  winston.log(`Running on port ${port}`)
}


winston.setLevels()
loadScripts()
setupServer()
startServer()
