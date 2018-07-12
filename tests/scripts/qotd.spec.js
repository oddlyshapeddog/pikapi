'use strict'

const expect = require('chai').expect
const mockery = require('mockery')
const appRootPath = require('app-root-path').path
require('app-module-path').addPath(appRootPath + '/lib')
const ERRORS = require('constants/errors')

// mocks & utils
const winstonMock = require('../mocks/winston-mock')
const wikiMock = require('../mocks/wikiquotesjs-mock')
const commonAllowedDependencies = require('../test-utils/common-allowed-dependencies')

// test data
const DUMMY_QUOTE = 'I understand now that boundaries between noise and sound are conventions. All boundaries are conventions, waiting to be transcended. One may transcend any convention if only one can first conceive of doing so.'

// non-mocks
const allowedDependencies = commonAllowedDependencies.concat([
  'scripts/qotd'
])

beforeEach(() => {
  mockery.enable({ warnOnReplace: false })
  mockery.registerAllowables(allowedDependencies)
  mockery.registerMock('winston', winstonMock)
  mockery.registerMock('wikiquotesjs', wikiMock)
})

describe('qotd', () => {

  it('should return a promise', () => {
    const requestHandler = require('scripts/qotd')
      .requestHandler()
      .catch(() => {})
    expect(requestHandler).to.have.property('then')
    expect(requestHandler.then).to.be.a('function')
  })

  it('should throw an error if the response is empty', (done) => {
    wikiMock.setMockResponse('')
    require('scripts/qotd').requestHandler()
      .then(
        () => {
          done(new Error())
        },
        (err) => {
          expect(err.toString()).to.contain(ERRORS.EMPTY_DOCUMENT)
          done()
        }
      )
  })

  it('should return a quote from wikiquotesjs', (done) => {
    wikiMock.setMockResponse(DUMMY_QUOTE)
    require('scripts/qotd').requestHandler()
      .then(
        (result) => {
          expect(result).to.equal(DUMMY_QUOTE)
          done()
        },
        (err) => {
          done(err)
        }
      )
  })

})

afterEach(() => {
  mockery.disable()
})
