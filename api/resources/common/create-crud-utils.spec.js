const expect = require('chai').expect
const { plainEnglishToUppercaseUnderscored } = require('./create-crud-utils')

describe ('createCrudUtils', () => {
  describe('plainEnglishToUppercaseUnderscored', () => {
    it ('should convert plain english strings to uppercase underscored', () => {
      expect(plainEnglishToUppercaseUnderscored('oddly shaped dog')).to.equal('ODDLY_SHAPED_DOG')
    })
  })
})
