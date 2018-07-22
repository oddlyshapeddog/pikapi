const format = require('logform').format

function formatKeyValuePair (key, value) {
  return `"${key}":${JSON.stringify(value)}`
}

module.exports = format((info, opts) => {
  const prioritize = opts && opts.prioritize || []
  const prioritizedKeys = prioritize.reduce(
    (obj, key) => {
      obj[key] = true
      return obj
    },
    {}
  )
  const keyValuePairs = []

  prioritize.forEach(key => {
    if (key in info) {
      const value = info[key]
      keyValuePairs.push(formatKeyValuePair(key, value))
    }
  })

  Object.keys(info)
    .filter(key => !(key in prioritizedKeys))
    .forEach(
      key => {
        const value = info[key]
        keyValuePairs.push(formatKeyValuePair(key, value))
      }
    )

  return `{${keyValuePairs.join()}}`
})
