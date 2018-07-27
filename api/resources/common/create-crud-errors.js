const util = require('util')

const ERROR_TEMPLATES = {
  ResourceAlreadyExistsError: 'You already have. A %s. With this name! Pick a different name. Be. Creative.',
  ResourceDeleteError: 'I couldn\'t delete. Your document. Please try again! But maybe wait a bit first.',
  ResourceNotFoundError: 'I couldn\'t find. A document. With this name! I looked everywhere!',
  ResourceToUpdateNotFoundError: 'I couldn\'t find. The document you tried to update! It\'s gone!',
  ResourceWriteError: 'I couldn\'t save. Your document. Please try again! But maybe wait a bit first.'
}

/**
 * Creates an object containing all possible CRUD error classes for the given resource name.
 * 
 * @param resourceNamePlainEnglish the resource name in plain english (e.g. 'cheese bagel')
 */
module.exports = function createCrudErrors ({resourceNamePlainEnglish}) {
  const errors = {}
  for (let className in ERROR_TEMPLATES) {
    const errorMessage = util.format(
      `${ERROR_TEMPLATES[className]}`,
      resourceNamePlainEnglish
    )
    errors[className] = class extends Error {
      constructor() {
        super(errorMessage)
      }
    }
  }
  return errors
}
