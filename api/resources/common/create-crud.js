const createCrudErrors = require('./create-crud-errors')
const createCrudFunctions = require('./create-crud-functions')
const createModel = require('./create-model')

/**
 * Creates a CRUD module.
 * @param options CRUD options
 * @param options.resourceName camel-cased resource name (e.g. 'CheeseBagel')
 * @param options.resourceNamePlainEnglish resource name in plain english (e.g. 'cheese bagel')
 * @param options.resourceSchema the resource's Dynamoose schema
 */
module.exports = function createCrud(options) {
  // so code
  // much elegant
  const errors = createCrudErrors(options)
  const resourceModel = createModel(options)
  const crudFunctions = createCrudFunctions(options, resourceModel, errors)

  // put it all together
  const generatedModule = {}
  Object.assign(generatedModule, crudFunctions)
  Object.assign(generatedModule, {errors})
  return generatedModule
}
