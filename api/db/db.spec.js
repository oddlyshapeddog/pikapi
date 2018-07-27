require('dotenv').config()

const expect = require('chai').expect
const dynamoose = require('dynamoose')

describe('db', () => {
  beforeEach(() => {})

  it ('should expose an instance of the AWS SDK', () => {
    expect(dynamoose && dynamoose.AWS && dynamoose.AWS.config).to.be.an('object')
  })

  it ('should use the credentials from process.env by default', (done) => {
    dynamoose.AWS.config.getCredentials(function(err) {
      if (err) done(err)
      else {
        const accessKey = dynamoose.AWS.config.credentials.accessKeyId
        expect(accessKey).to.equal(process.env.AWS_ACCESS_KEY_ID)
        done()
      }
    })
  })

  it ('should use the credentials provided through .update()', (done) => {
    dynamoose.AWS.config.update({
      accessKeyId: 'oddly shaped dog',
      secretAccessKey: 'hunter2',
      region: 'us-east-1'
    })
    dynamoose.AWS.config.getCredentials(function(err) {
      if (err) done(err)
      else {
        const accessKey = dynamoose.AWS.config.credentials.accessKeyId
        expect(accessKey).to.equal('oddly shaped dog')
        done()
      }
    })
  })
})