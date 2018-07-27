const dynamoose = require('dynamoose')

/**
 * Creates a Dynamoose model from the given resource.
 * @param resourceName the camel-cased resource name (e.g. 'CheeseBagel')
 * @param resourceSchema the resource's Dynamoose schema
 */
module.exports = function createModel(resourceName, resourceSchema) {
  return dynamoose.model(resourceName, resourceSchema)
}
