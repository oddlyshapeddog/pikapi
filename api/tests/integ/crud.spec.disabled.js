const expect = require('chai').expect
const uuidv4 = require('uuid/v4')

// deps
const Schema = require('dynamoose').Schema
const db = require('../../db/index')

// test target
const app = require('../../app')

// test vars
let crud = null

describe ('createCrud', () => {
  beforeEach ((done) => {
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
    db.connect().then(done)
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

  describe ('create-read', () => {
    it ('should create resources', (done) => {
      const RESOURCE_NAME = uuidv4()
      const RESOURCE_CONTENT = 'Tetrahedron'
      crud.create(RESOURCE_NAME, RESOURCE_CONTENT).then(
        doc => {
          expect(doc.name).to.equal(RESOURCE_NAME)
          expect(doc.content).to.equal(RESOURCE_CONTENT)
          done()
        },
        error => {
          done(error)
        }
      )
    })
  })
})
