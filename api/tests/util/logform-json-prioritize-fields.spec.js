'use strict'

const mockery = require('mockery')
const chai = require('chai')
const chaiString = require('chai-string')
const sinon = require('sinon')
const sinonChai = require('sinon-chai')
const expect = chai.expect
const sandbox = sinon.createSandbox()
chai.use(sinonChai)
chai.use(chaiString)

const appRootPath = require('app-root-path').path
require('app-module-path').addPath(appRootPath + '/api')

// mocks & utils
const commonAllowedDependencies = require('../test-utils/common-allowed-dependencies')
let logformMock = { format: function() {} }
let jsonPrioritizeFieldsTransform = null

// mock data
const EVENT = {
  foo: 'foo',
  bar: 'bar',
  timestamp: '0123456789',
  message: 'HELLO_WORLD',
  level: 'debug'
}

// non-mocks
const allowedDependencies = commonAllowedDependencies.concat([
  'lib/util/logform-json-prioritize-fields'
])

beforeEach(() => {
  sandbox.stub(logformMock, 'format').callsFake(transform => {
    jsonPrioritizeFieldsTransform = transform
  })
  mockery.enable({ warnOnReplace: false })
  mockery.registerAllowables(allowedDependencies)
  mockery.registerMock('logform', logformMock)
})

describe('logformJsonPrioritizeFields', () => {

  it('should pass a function to logform.format() and export it', () => {
    require('lib/util/logform-json-prioritize-fields')
    
    expect(logformMock.format).to.have.been.called
    expect(jsonPrioritizeFieldsTransform).to.be.a('function')
  })

  it('should behave like JSON.stringify by default', () => {
    require('lib/util/logform-json-prioritize-fields')
    const result = jsonPrioritizeFieldsTransform(EVENT)
    const expectedResult = JSON.stringify(EVENT)
    expect(result).to.equal(expectedResult)
  })

  it('should prioritize selected fields', () => {
    require('lib/util/logform-json-prioritize-fields')
    const result = jsonPrioritizeFieldsTransform(EVENT, {
      prioritize: ['timestamp', 'level', 'message']
    })
    const expectedResult = [
      `"timestamp":${JSON.stringify(EVENT.timestamp)}`,
      `"level":${JSON.stringify(EVENT.level)}`,
      `"message":${JSON.stringify(EVENT.message)}`
    ].join()
    expect(result).to.startWith(`{${expectedResult}`)
  })

})

afterEach(() => {
  mockery.disable()
  sandbox.restore()
})
