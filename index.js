const fs = require('fs')
const path = require('path')
const winston = require('winston')
const app = require('./app')

const SCRIPTS_PATH = './lib/scripts'
const SCRIPT_REGEX = /\.js$/gi

winston.level = process.env.LOG_LEVEL || 'info'

function loadScripts() {
  winston.info(`Looking for scripts in '${SCRIPTS_PATH}'...`)
  const files = fs.readdirSync(SCRIPTS_PATH)

  winston.debug(`${files.length} files found`)
  for (let i = 0, l = files.length; i < l; i++) {
    if (files[i].match(SCRIPT_REGEX)) {
      const scriptPath = `${SCRIPTS_PATH}/${files[i]}`
      winston.debug(`Found script ${files[i]} at ${scriptPath}`)
      const script = require(scriptPath)
      app.registerScript(script.endpoint, script.requestHandler)
    }
    else {
      winston.debug(`${files[i]} is not a javascript file`)
    }
  }
}

loadScripts()

module.exports = app.scripts
