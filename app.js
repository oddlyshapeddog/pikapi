const express = require('express')
const app = express()

app.get('/', (req, res) => {
  res.set('Content-Type', 'application/json')
  res.send({
    msg: 'hello world',
    content: JSON.parse(res)
  })
})

module.exports = app

