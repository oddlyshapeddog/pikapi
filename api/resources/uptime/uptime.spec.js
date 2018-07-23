const request = require('supertest')
const expect = require('chai').expect
const JSDOM = require('jsdom').JSDOM

// fixtures
const appRootPath = require('app-root-path').path + '/api'
const createApp = require(`${appRootPath}/tests/test-utils/app-factory`)

let app = null

describe('GET /uptime', () => {
  beforeEach(() => {
    app = createApp()
    app.use('/uptime', require('./uptime'))
  })

  it('should return the uptime in text by default', (done) => {
    request(app)
      .get('/uptime')
      .expect('Content-Type', /text/)
      .expect(200, function (err, res) {
        expect(res.text).to.match(/^Uptime: [0-9]+s$/)
        done()
      })
  })

  it('should return the uptime in json when requested', (done) => {
    request(app)
      .get('/uptime')
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200, function (err, res) {
        expect(res.body).to.have.property('uptime')
        expect(res.body.uptime).to.be.a('number')
        done()
      })
  })

  it('should return the uptime in html when requested', (done) => {
    request(app)
      .get('/uptime')
      .set('Accept', 'text/html')
      .expect('Content-Type', /html/)
      .expect(200, function (err, res) {
        expect(res.text).to.not.be.empty
        const dom = new JSDOM(res.text)
        const document = dom.window.document
        expect(document.querySelector('dl').textContent).to.match(/Uptime\s*[0-9]+s/)
        done()
      })
  })
})
