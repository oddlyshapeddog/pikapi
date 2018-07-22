'use strict'

const expect = require('chai').expect
const mockery = require('mockery')
const appRootPath = require('app-root-path').path
require('app-module-path').addPath(appRootPath + '/api')

// mocks
const winstonMock = require('../mocks/winston-mock')
const remoteDocumentLoaderMock = require('../mocks/remote-document-loader-mock')
const commonAllowedDependencies = require('../test-utils/common-allowed-dependencies')

// non-mocks
const allowedDependencies = commonAllowedDependencies.concat([
  'lib/scripts/debug'
])

// test data
const DUMMY_LINE = 'Uptime: 9001'
const UPTIME_REGEX = /\bUptime: \d+\b/g

beforeEach(() => {
  mockery.enable({ warnOnReplace: false })
  mockery.registerAllowables(allowedDependencies)
  mockery.registerMock('winston', winstonMock)
  mockery.registerMock('../util/remote-document-loader', remoteDocumentLoaderMock)
})

describe('debug', () => {

  it('should return a promise', () => {
    const requestHandler = require('lib/scripts/debug')
      .requestHandler()
      .catch(() => {})
    expect(requestHandler).to.have.property('then')
    expect(requestHandler.then).to.be.a('function')
  })

  it('should return the uptime', (done) => {
    remoteDocumentLoaderMock.setMockResponse(DUMMY_LINE)
    require('lib/scripts/debug').requestHandler().then(
      (result) => {
        expect(result).to.match(UPTIME_REGEX)
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
