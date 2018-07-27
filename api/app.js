const express = require('express')
const cons = require('consolidate')

const documentsRoute = require('./resources/documents/documents')
const uptimeRoute = require('./resources/uptime/uptime')
const errorHandler = require('./resources/default-error-handler')

const app = express()

app.engine(
  'ejs',
  cons.ejs
)

app.locals.title = 'oddly shaped dog'

app.use(express.static('./public'))
app.use('/documents', documentsRoute)
app.use('/uptime', uptimeRoute)
app.use(errorHandler)

module.exports = app

