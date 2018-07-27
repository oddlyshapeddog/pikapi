const createCrud = require('../common/create-crud')
const documentSchema = require('./documents-schema')

module.exports = createCrud(
  {
    resourceName: 'Document',
    resourceNamePlainEnglish: 'document',
    resourceSchema: documentSchema
  }
)
