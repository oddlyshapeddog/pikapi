const express = require('express')
const router = express.Router()
const logger = require('../../util/logger')
const documents = require('./documents-crud')

router.get('/:name', function (req, res) {
  const name = req.params && req.params.name
  logger.silly('DOCUMENTS_GET', {name})
  documents.read(name).then(
    document => {
      logger.debug('DOCUMENTS_GET_SUCCESS', {name, document})
      res.format({
        'text/plain': function(){
          res.send(document)
        },

        'text/html': function(){
          res.render('document', document)
        },

        'application/json': function(){
          res.json({ error: document })
        },

        'default': function() {
          res.send(document)
        }
      })
    },
    error => {
      logger.error('DOCUMENTS_GET_ERROR', {name, error})
      res.render('error', error)
    }
  )
})

module.exports = router
