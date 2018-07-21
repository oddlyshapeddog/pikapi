// std
const fs = require('fs')

// 3p
const winston = require('winston')
const express = require('express')
const lambdaExpress = require('lambda-express')

// app
const legacyApp = require('./app')
const api = require('./api/index')
const app = express()

const SCRIPTS_PATH = './lib/scripts'
const SCRIPT_REGEX = /\.js$/gi

winston.level = process.env.LOG_LEVEL || 'info'

function loadScripts() {
  winston.debug(`Looking for scripts in '${SCRIPTS_PATH}'...`)
  const files = fs.readdirSync(SCRIPTS_PATH)

  winston.debug(`${files.length} files found`)
  for (let i = 0, l = files.length; i < l; i++) {
    if (files[i].match(SCRIPT_REGEX)) {
      const scriptPath = `${SCRIPTS_PATH}/${files[i]}`
      winston.debug(`Found script ${files[i]} at ${scriptPath}`)
      const script = require(scriptPath)
      app.get(script.endpoint, script.requestHandler)
    }
    else {
      winston.debug(`${files[i]} is not a javascript file`)
    }
  }
}

function loadAPI() {
  // frontend
  app.get('/', function(req, res) {
    res.send('Hi!')
  })
}

loadScripts()
loadAPI()

exports.handler = lambdaExpress.appHandler(function(event, context) {
  return app
})
