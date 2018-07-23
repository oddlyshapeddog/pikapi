/**
 * Creates an Express app with minimal dependencies for use in tests with Supertest.
 */
const express = require('express')
const cons = require('consolidate')

module.exports = function createApp() {
  const app = express()
  app.engine('eco', cons.eco)
  return app
}
