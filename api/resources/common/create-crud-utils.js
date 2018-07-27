module.exports = {
  plainEnglishToUppercaseUnderscored: function(plainEnglishString) {
    return plainEnglishString.toUpperCase().replace(/ /g, '_')
  }
}