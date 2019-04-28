/* eslint-env jest */
const { jitterize } = require('../util')

describe('configuration processing', () => {
  it('should create config object from v1 config style', async () => {
    for (let i = 0; i < 1000; i++) {
      const res = jitterize(10, 0.1)
      expect(res >= 0.9).toBe(true)
      expect(res <= 11).toBe(true)
    }
  })
})
