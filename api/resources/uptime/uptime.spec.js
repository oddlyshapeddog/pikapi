const request = require('supertest')
const express = require('express')
const expect = require('chai').expect

let app = null

describe('GET /uptime', () => {
  beforeEach(() => {
    app = express()
    app.use('/uptime', require('./uptime'))
  })

  it('should return the uptime in json', (done) => {
    request(app)
      .get('/uptime')
      .expect('Content-Type', /text/)
      .expect(200, function (err, res) {
        expect(res.body).to.equal({
          uptime: 0
        })
        done()
      })
  })

  it('should return the uptime in html', (done) => {
    request(app)
      .get('/uptime')
      .expect('Content-Type', /text/)
      .expect(200, function (err, res) {
        expect(res.body).to.equal({
          uptime: 0
        })
        done()
      })
  })
})
