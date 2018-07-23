const express = require('express')
const cons = require('consolidate')
const app = express()

app.engine('jsx', cons.react)
app.engine('eco', cons.eco)

app.get('/api', (req, res) => {
  res.set('Content-Type', 'application/json')
  res.send({
    msg: 'hello world',
    content: JSON.parse(res)
  })
})

app.get('/', (req, res) => {
  res.set('Content-Type', 'application/json')
  res.send({
    msg: 'hello world',
    content: JSON.parse(res)
  })
})

module.exports = app

