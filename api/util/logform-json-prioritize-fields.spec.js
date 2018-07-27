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
const commonAllowedDependencies = require(`tests/test-utils/common-allowed-dependencies`)
let logformMock = { format: function() {} }
let tripleBeamMock = require('tests/mocks/triple-beam-mock')
const MESSAGE = tripleBeamMock.MESSAGE

// test vars
let event = null
let jsonPrioritizeFieldsFn = null

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
  'util/logform-json-prioritize-fields'
])

beforeEach(() => {
  sandbox.stub(logformMock, 'format').callsFake(fn => {
    jsonPrioritizeFieldsFn = fn
    return fn
  })

  mockery.enable({ warnOnReplace: false })
  mockery.registerAllowables(allowedDependencies)
  mockery.registerMock('logform', logformMock)
  mockery.registerMock('triple-beam', tripleBeamMock)

  // create a mutable copy of the EVENT constant
  event = Object.assign({}, EVENT)
})

describe('logformJsonPrioritizeFields', () => {

  it('should pass a function to logform.format() and export a format', () => {
    require('util/logform-json-prioritize-fields')
    
    expect(logformMock.format).to.have.been.called
    expect(jsonPrioritizeFieldsFn).to.be.a('function')
  })

  it('should behave like JSON.stringify by default', () => {
    require('util/logform-json-prioritize-fields')
    const result = jsonPrioritizeFieldsFn(event)[MESSAGE]
    const expectedResult = JSON.stringify(EVENT)
    expect(result).to.equal(expectedResult)
  })

  it('should prioritize selected fields', () => {
    require('util/logform-json-prioritize-fields')
    const result = jsonPrioritizeFieldsFn(event, {
      prioritize: ['timestamp', 'level', 'message']
    })[MESSAGE]
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
