const express = require('express')
const router = express.Router()
const getUptime = require('./get-uptime')

router.get('/', function (req, res) {
  const uptime = getUptime()
  const data = { uptime: uptime }
  res.format({
    'text/plain': function(){
      res.send(`Uptime: ${Math.floor(data.uptime / 1000)}s`)
    },

    'text/html': function(){
      res.render(`${__dirname}/uptime-view.eco`, data)
    },

    'application/json': function(){
      res.json(data)
    },

    'default': function() {
      res.send(`Uptime: ${Math.floor(data.uptime / 1000)}s`)
    }
  })
})

module.exports = router
