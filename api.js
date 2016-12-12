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
    winston.debug(`Processing query string ${querystring}...`)
    const matches = urlWithUrlRegex.exec(querystring)
    if(matches && matches[1] && matches[2]) {
      const encodedURL = encodeURIComponent(matches[2])
      querystring = querystring.replace(urlWithUrlRegex, '$1' + encodedURL)
      winston.debug(`Query string encoded to ${querystring}`)
    }
    //this.set('PostProcessedQuery', querystring) // TODO find out why this isn't working'
    this.request.postProcessedQuery = querystring
    yield next
  })

  app.use(function * (next) {
    const endpoint = this.request.path
    if (endpoint && scripts[endpoint]) {
      winston.info(`GET ${endpoint}`)
      //const params = querystring.parse(this.get('PostProcessedQuery'))
      const params = querystring.parse(this.request.postProcessedQuery)

      //winston.debug(this.get('PostProcessedQuery'))
      winston.debug(this.request.postProcessedQuery)
      winston.debug(params)
      try {
        this.body = yield scripts[endpoint](params)
      }
      catch (err) {
        winston.warn(`Request failed! Error: ${err}`)
        this.body = `Error: ${err}`
      }
    }
    else {
      this.body = `Invalid path: ${endpoint}`
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
      winston.info(`Mapping ${files[i]} to ${script.endpoint}`)
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
