const winston = require('winston')
const uuidv4 = require('uuid/v4')
const addMetadata = require('./logform-add-metadata')
const jsonPrioritizeFields = require('./logform-json-prioritize-fields')

const EXECUTION_ID = uuidv4()
const LOG_LEVEL = process.env.LOG_LEVEL || 'info'
const LOG_REMOTE_ENDPOINT_HOST = process.env.LOG_REMOTE_ENDPOINT_HOST || null
const LOG_REMOTE_ENDPOINT_PORT = process.env.LOG_REMOTE_ENDPOINT_PORT || null
const LOG_REMOTE_ENDPOINT_PATH = process.env.LOG_REMOTE_ENDPOINT_PATH || null
const LOG_REMOTE_ENDPOINT_AUTH = process.env.LOG_REMOTE_ENDPOINT_AUTH || null
let remoteEndpoint = null

const transports = [
  new winston.transports.Console()
]

if (
  LOG_REMOTE_ENDPOINT_HOST &&
  LOG_REMOTE_ENDPOINT_PORT &&
  LOG_REMOTE_ENDPOINT_PATH &&
  LOG_REMOTE_ENDPOINT_AUTH
) {
  logger.add(new winston.transports.Http({
    host: LOG_REMOTE_ENDPOINT_HOST,
    port: LOG_REMOTE_ENDPOINT_PORT,
    path: LOG_REMOTE_ENDPOINT_PATH,
    auth: LOG_REMOTE_ENDPOINT_AUTH,
    ssl: true
  }))
  remoteEndpoint = `https://${LOG_REMOTE_ENDPOINT_HOST}:${LOG_REMOTE_ENDPOINT_PORT}${LOG_REMOTE_ENDPOINT_PATH}`
}

const format = winston.format.combine(
  winston.format.metadata({ key: 'data', executionId: EXECUTION_ID }),
  addMetadata({ executionId: EXECUTION_ID }),
  winston.format.timestamp(),
  jsonPrioritizeFields({ prioritize: ['timestamp', 'level', 'message'] })
)

const logger = winston.createLogger({
  level: LOG_LEVEL,
  format: format,
  transports: transports
})

logger.info(
  'LOGGER_INITIALIZED',
  {
    logLevel: LOG_LEVEL,
    remoteEndpoint: remoteEndpoint
  }
)

module.exports = logger
