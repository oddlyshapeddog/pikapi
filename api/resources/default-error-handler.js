const logger = require('../util/logger')

module.exports = function errorHandler (error, req, res) {
  logger.error('ERROR', {error, stack: error.stack})
  res.status(500).format({
    'text/plain': function(){
      res.send('Error: ' + error.message || error)
    },

    'application/json': function(){
      res.json({ error })
    },

    'default': function() {
      res.render('error', { error })
    }
  })
}
