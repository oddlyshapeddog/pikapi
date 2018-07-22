const startTime = new Date().getTime()

module.exports = function getUptime() {
  const currentTime = new Date().getTime()
  return currentTime - startTime
}
