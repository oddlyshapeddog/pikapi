const expect = require('chai').expect

// deps
const Schema = require('dynamoose').Schema

// test target
const createCrud = require('./create-crud')

// test vars
let crud = null

describe ('createCrud', () => {
  beforeEach (() => {
    crud = createCrud({
      resourceName: 'OddlyShapedDog',
      resourceNamePlainEnglish: 'oddly shaped dog',
      resourceSchema: new Schema({
        name: {
          type: String,
          required: true
        },
        content: {
          type: String,
          enum: ['Tetrahedron', 'Dodecahedron', 'Tesseract']
        }
      })
    })
  })

  it ('should return a complete set of CRUD functions', () => {
    expect(crud).to.have.property('create')
    expect(crud).to.have.property('read')
    expect(crud).to.have.property('update')
    expect(crud).to.have.property('delete')
    expect(crud.create).to.be.a('function')
    expect(crud.read).to.be.a('function')
    expect(crud.update).to.be.a('function')
    expect(crud.delete).to.be.a('function')
  })
})
