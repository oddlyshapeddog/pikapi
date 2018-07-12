'use strict'

let mockResponse = null

function setMockResponse(_mockResponse) {
  mockResponse = _mockResponse
}

function returnMockResponse() {
  return new Promise((resolve) => {
    resolve(mockResponse)
  })
}

module.exports = {
  setMockResponse: setMockResponse,
  QOTD: returnMockResponse
}
