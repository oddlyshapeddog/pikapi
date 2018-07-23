const format = require('logform').format

module.exports = format((info, opts) => {
  for (let key in opts) {
    info[key] = opts[key]
  }
  return info
})
