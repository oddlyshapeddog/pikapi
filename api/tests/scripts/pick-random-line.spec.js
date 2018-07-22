'use strict'

const expect = require('chai').expect
const mockery = require('mockery')
const appRootPath = require('app-root-path').path
require('app-module-path').addPath(appRootPath + '/api')
const ERRORS = require('lib/constants/errors')

// mocks & utils
const winstonMock = require('../mocks/winston-mock')
const remoteDocumentLoaderMock = require('../mocks/remote-document-loader-mock')
const commonAllowedDependencies = require('../test-utils/common-allowed-dependencies')

// non-mocks
const allowedDependencies = commonAllowedDependencies.concat([
  'lib/scripts/pick-random-line',
  '../util/remote-document-loader'
])

// test data
const DUMMY_URL = 'http://fake.domain/file.txt'
const DUMMY_LINE = 'lorem et ipsum'

beforeEach(() => {
  mockery.enable({ warnOnReplace: false })
  mockery.registerAllowables(allowedDependencies)
  mockery.registerMock('winston', winstonMock)
  mockery.registerMock('util/remote-document-loader', remoteDocumentLoaderMock)
})

describe('pick-random-line', () => {

  it('should return a promise', () => {
    const requestHandler = require('lib/scripts/pick-random-line')
      .requestHandler()
      .catch(() => {})
    expect(requestHandler).to.have.property('then')
    expect(requestHandler.then).to.be.a('function')
  })

  it('should throw an error if the document is empty', (done) => {
    remoteDocumentLoaderMock.setMockResponse('')
    require('lib/scripts/pick-random-line').requestHandler({
      line: null,
      url: DUMMY_URL
    }).then(
      // eslint-disable-next-line no-unused-vars
      (result) => {
        done(new Error())
      },
      (err) => {
        expect(err.toString()).to.contain(ERRORS.EMPTY_DOCUMENT)
        done()
      }
    )
  })

  it('should pick the only line when available', (done) => {
    remoteDocumentLoaderMock.setMockResponse(DUMMY_LINE)
    require('lib/scripts/pick-random-line').requestHandler({
      line: null,
      url: DUMMY_URL
    }).then(
      (result) => {
        expect(result).to.equal(DUMMY_LINE)
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
