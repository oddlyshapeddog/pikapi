const dynamoose = require('dynamoose')
const logger = require('../util/logger')

function getDDB(forceLocal) {
  return new Promise((resolve, reject) => {
    logger.debug('DB_CONFIG')
    if (process.env.DYNAMODB_LOCAL) {
      logger.debug('DB_CONFIG_SUCCESS', {type: 'local', url: process.env.DYNAMODB_LOCAL})
      dynamoose.AWS.config.update({
        accessKeyId: 'fakeKey',
        secretAccessKey: 'fakeSecret',
        region: 'us-east-1'
      })
      dynamoose.local(process.env.DYNAMODB_LOCAL)
      resolve(dynamoose.ddb())
    }
    else if (
      !forceLocal &&
      process.env.DYNAMODB_ACCESS_KEY &&
      process.env.DYNAMODB_ACCESS_SECRET
    ) {
      logger.debug('DB_CONFIG_SUCCESS', {type: 'remote', accessKey: process.env.DYNAMODB_ACCESS_KEY})
      dynamoose.AWS.config.update({
        accessKeyId: process.env.DYNAMODB_ACCESS_KEY,
        secretAccessKey: process.env.DYNAMODB_ACCESS_SECRET,
        region: process.env.DYNAMODB_REGION || 'us-east-1'
      })
      resolve(dynamoose.ddb())
    }
    else {
      const error = new Error('Could not initialize Dynamoose; missing `DYNAMODB_LOCAL` or `DYNAMODB_ACCESS_KEY`/`DYNAMODB_ACCESS_SECRET`')
      logger.error('DB_CONFIG_ERROR', {error})
      reject(error)
    }
  })
}

module.exports = {
  /**
   * Initializes the database connection.
   * @param forceLocal whether to force the database to use a local DynamoDB 
   *                   instance (for local integration tests). Defaults to false
   */
  connect: function connect(forceLocal) {
    return new Promise((resolve, reject) => {
      logger.debug('DB_INIT')
      getDDB(forceLocal).then(
        ddb => {
          logger.debug('DB_INIT_HEALTH_CHECK')
          ddb.describeLimits({}, function(error, limits) {
            if (error) {
              logger.error('DB_INIT_HEALTH_CHECK_ERROR', {error})
              reject(error)
            }
            else {
              logger.debug('DB_INIT_HEALTH_CHECK_SUCCESS', {limits})
              resolve()
            }
          })
        },
        error => {
          logger.error('DB_INIT_ERROR', {error})
          reject(error)
        }
      )
    })
  }
}
