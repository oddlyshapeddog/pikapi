const express = require('express')
const router = express.Router()
const getUptime = require('./get-uptime')

router.get('/', function (req, res) {
  const uptime = getUptime()
  const data = { uptime: uptime }
  res.format({
    text: function(){
      res.send(`Uptime: ${Math.floor(data.uptime / 1000)}s`)
    },

    html: function(){
      res.render('./UptimeView', data)
    },

    json: function(){
      res.send(data)
    },

    'default': function() {
      res.status(406).send('Not Acceptable')
    }
  })
})

module.exports = router
