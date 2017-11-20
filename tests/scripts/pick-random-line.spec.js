'use strict'

const expect = require('chai').expect
const mockery = require('mockery')
const path = require('path')
const appRootPath = require('app-root-path').path
require('app-module-path').addPath(appRootPath + '/lib')

// mocks
const winstonMock = require('../mocks/winston-mock')
const remoteDocumentLoaderMock = require('../mocks/remote-document-loader-mock')

// non-mocks
const allowedDependencies = [
  'scripts/pick-random-line'
]

// test data
const DUMMY_URL = 'http://fake.domain/file.txt'
const DUMMY_LINE = 'lorem et ipsum'

beforeEach(() => {
  mockery.enable({ warnOnReplace: false })
  mockery.registerAllowables(allowedDependencies)
  mockery.registerMock('winston', winstonMock)
  mockery.registerMock('../util/remote-document-loader', remoteDocumentLoaderMock)
})

describe('pick-random-line', () => {

  beforeEach(() => {
    remoteDocumentLoaderMock.setMockResponse(DUMMY_LINE)
  })

  it('should return a promise', () => {
    const requestHandler = require('scripts/pick-random-line')
      .requestHandler()
      .catch(() => {})
    expect(requestHandler).to.have.property('then')
    expect(requestHandler.then).to.be.a('function')
  })

  it('should pick the only line when available', (done) => {
    require('scripts/pick-random-line').requestHandler({
      line: null,
      url: DUMMY_URL
    }).then(
      (result) => {
        expect(result.to.be(DUMMY_LINE))
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
