const logger = require('../../util/logger')
const { plainEnglishToUppercaseUnderscored } = require('./create-crud-utils')

/**
 * 
 * @param options crud options
 * @param options.resourceName camel-cased resource name (e.g. 'CheeseBagel')
 * @param options.resourceNamePlainEnglish resource name in plain english (e.g. 'cheese bagel')
 * @param Resource the resource model (obtained from create-model)
 * @param crudErrors the resource errors (obtained from create-crud-errors)
 */
module.exports = function createCrudFunctions (
  {resourceName, resourceNamePlainEnglish},
  Resource,
  crudErrors
) {
  const RESOURCE_NAME = plainEnglishToUppercaseUnderscored(resourceNamePlainEnglish)

  /**
   * Creates or updates a resource.
   * @returns a promise
   */
  function _createOrUpdateResource (name, content) {
    return new Promise((resolve, reject) => {
      logger.silly(`${RESOURCE_NAME}_WRITE`, {name})
      const resource = new Resource({
        name,
        content
      })
      logger.silly(`${RESOURCE_NAME}_WRITE_CREATED`, {resource})
      resource.save(function (error) {
        if (error) {
          logger.error(`${RESOURCE_NAME}_WRITE_ERROR`, {name, error})
          reject(new crudErrors.ResourceWriteError())
        }
        else {
          logger.debug(`${RESOURCE_NAME}_WRITE_SUCCESS`, {name, bytes: content.length})
          resolve(resource)
        }
      })
    })
  }

  /**
   * Checks whether a resource exists. Use this instead of
   * .get() if you don't care what the content of the resource is.
   * 
   * Usage:
   *   _checkIfResourceExists(name).then(resourceExists => {
   *     if (resourceExists) { ... }
   *     else { ... }
   *   })
   * 
   * @returns a promise that always resolves; 
   */
  function _checkIfResourceExists (name) {
    return new Promise(resolve => {
      logger.silly(`${RESOURCE_NAME}_EXISTS`, {name})
      Resource.get(
        {name},
        // eslint-disable-next-line no-unused-vars
        (error, existingResource) => {
          if (existingResource) {
            logger.warn(`${RESOURCE_NAME}_EXISTS_ERROR`, {name, error})
            // TODO: check the error type; was the resource
            // really not found or did the db throw an error?
            resolve(true)
          }
          else {
            logger.debug(`${RESOURCE_NAME}_EXISTS_SUCCESS`, {name, exists: false})
            resolve(false)
          }
        }
      )
    })
  }

  /**
   * Creates a resource if it doesn't already exist.
   * @returns a promise
   */
  function createResource (name, content) {
    return new Promise((resolve, reject) => {
      logger.silly(`${RESOURCE_NAME}_CREATE`, {name})
      _checkIfResourceExists(name).then(
        resourceExists => {
          if (resourceExists) {
            const error = new crudErrors.ResourceAlreadyExistsError()
            logger.error(`${RESOURCE_NAME}_CREATE_ERROR`, {name, error})
            reject(error)
          }
          else {
            logger.debug(`${RESOURCE_NAME}_CREATE_SUCCESS`, {name})
            _createOrUpdateResource(name, content).then(resolve, reject)
          }
        }
      )
    })
  }

  /**
   * Reads a resource if it exists.
   * @returns a promise
   */
  function readResource (name) {
    return new Promise((resolve, reject) => {
      logger.silly(`${RESOURCE_NAME}_READ`, {name})
      Resource.get(name)
        .then(
          resource => {
            logger.error(`${RESOURCE_NAME}_READ_SUCCESS`, {name})
            resolve(resource)
          },
          error => {
            logger.debug(`${RESOURCE_NAME}_READ_ERROR`, {name, error})
            reject(new crudErrors.ResourceNotFoundError())
          }
        )
    })
  }

  /**
   * Updates an existing resource.
   * @returns a promise
   */
  function updateResource (name, content) {
    return new Promise(
      (resolve, reject) => {
        logger.silly(`${RESOURCE_NAME}_UPDATE`, {name})
        _checkIfResourceExists(name).then(
          resourceExists => {
            if (!resourceExists) {
              const error = new crudErrors.ResourceToUpdateNotFoundError()
              logger.error(`${RESOURCE_NAME}_UPDATE_ERROR`, {error, name})
              reject(error)
            }
            else {
              logger.debug(`${RESOURCE_NAME}_UPDATE_SUCCESS`, {name})
              _createOrUpdateResource(name, content).then(resolve, reject)
            }
          }
        )
      }
    )
  }

  /**
   * Deletes an existing resource.
   * @returns a promise
   */
  function deleteResource (name) {
    return new Promise(
      (resolve, reject) => {
        logger.silly(`${RESOURCE_NAME}_DELETE`, {name})
        _checkIfResourceExists(name).then(
          resourceExists => {
            if (!resourceExists) {
              const error = new crudErrors.ResourceAlreadyExistsError()
              logger.error(`${RESOURCE_NAME}_DELETE_ERROR`, {name, error})
              reject(error)
            }
            else {
              Resource.delete({name}, error => {
                if (error) {
                  logger.error(`${RESOURCE_NAME}_DELETE_ERROR`, {name, error})
                  reject(new crudErrors.ResourceDeleteError())
                }
                else {
                  logger.debug(`${RESOURCE_NAME}_DELETE_SUCCESS`, {name})
                  resolve()
                }
              })
            }
          }
        )
      }
    )
  }

  return {
    create: createResource,
    read: readResource,
    update: updateResource,
    delete: deleteResource
  }

}
