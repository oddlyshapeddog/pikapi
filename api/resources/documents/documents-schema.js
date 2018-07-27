const Schema = require('dynamoose').Schema

const NAME_REGEX = /^[a-z0-9\-_]+$/
const NAME_MAX_LENGTH = 32

const CONTENT_MAX_LENGTH = 64 * 1024

const documentSchema = new Schema({
  name: {
    type: String,
    trim: true,
    required: true,
    validate: function(name) {
      return name &&
        name.length < NAME_MAX_LENGTH &&
        NAME_REGEX.test(name)
    },
    hashKey: true
  },
  content: {
    type: String,
    validate: function(content) {
      return content.length < CONTENT_MAX_LENGTH
    }
  }
})

module.exports = documentSchema
