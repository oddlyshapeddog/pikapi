const Hapi = require('hapi')
const Good = require('good')

const port = process.env.PORT || 3000
const SCRIPTS_PATH = './lib/scripts'
const SCRIPT_REGEX = /\.js$/gi

const server = null
const scripts = null

function loadScripts() {
  const files = fs.readdirSync(SCRIPTS_PATH)
  files.forEach((file) => {
    if (file.match(SCRIPT_REGEX)) {
      const scriptPath = path.join('scripts/', file)
      const script = require(scriptPath)
      scripts.push(script)
    }
  })
}

function startServer() {
  server = new Hapi.Server()

  server.connection({
    port: port,
    host: '0.0.0.0'
  })

  server.route({
    method: 'GET',
    path: '/',
    handler: function (request, reply) {
      reply({
        status: 'SUCCESS',
        apis: apis
      })
    }
  })

  server.route({
    method: 'GET',
    path: '/{name}',
    handler: function (request, reply) {
      reply('Hello, ' + encodeURIComponent(request.params.name) + '!')
    }
  })

  server.register({
    register: Good,
    options: {
      reporters: {
        console: [{
          module: 'good-squeeze',
          name: 'Squeeze',
          args: [{
            response: '*',
            log: '*'
          }]
        }, {
          module: 'good-console'
        }, 'stdout']
      }
    }
  }, (err) => {

    if (err) {
      throw err
    }

    server.start((err) => {

      if (err) {
        throw err
      }
      server.log('info', `Pikapi running at ${server.info.uri}`)
    })
  })
}
