const logger = require('../util/logger')

module.exports = function logRequest(req, res, next) {
  logger.info(
    'REQUEST',
    {
      url: req.originalUrl
    }
  )
  next()
}
