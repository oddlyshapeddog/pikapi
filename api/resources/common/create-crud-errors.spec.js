const expect = require('chai').expect

// target module
const createCrudErrors = require('./create-crud-errors')

// test vars
let crudErrors = null

describe ('createCrudErrors', () => {
  beforeEach(() => {
    crudErrors = createCrudErrors({
      resourceNamePlainEnglish: 'oddly shaped dog'
    })
  })

  it ('should export all expected error types', () => {
    expect(crudErrors).to.have.property('ResourceAlreadyExistsError')
    expect(crudErrors).to.have.property('ResourceDeleteError')
    expect(crudErrors).to.have.property('ResourceNotFoundError')
    expect(crudErrors).to.have.property('ResourceToUpdateNotFoundError')
    expect(crudErrors).to.have.property('ResourceWriteError')
  })

  it ('should use the resource name in error messages', () => {
    expect(new crudErrors.ResourceAlreadyExistsError().toString()).to.contain('oddly shaped dog')
  })
})
