const winstond = require('winstond')

const port = process.env.PORT || 39003

var server = winstond.nssocket.createServer({
  services: ['collect', 'query', 'stream'],
  port: port
})

server.add(winstond.transports.File, {
  filename: __dirname + '/events.log'
})

server.listen()
