/* eslint-env jest */
const keyTransform = require('../../src/mongo/transform-keys')

it('it should replace dots in object keys', async () => {
  const obj = { 'test.dot': 123 }
  const transformer = keyTransform.createReplacementFunction('.', 'U+FF0E')
  const transform = keyTransform.recursiveJSONKeyTransform(transformer)
  const transformed = transform(obj)
  expect(transformed['testU+FF0Edot']).toBe(123)
})

it('it should not replace dots in object values', async () => {
  const obj = { 'test': 'te.st' }
  const transformer = keyTransform.createReplacementFunction('.', 'U+FF0E')
  const transform = keyTransform.recursiveJSONKeyTransform(transformer)
  const transformed = transform(obj)
  expect(transformed['test']).toBe('te.st')
})

it('it should replace multiple dots', async () => {
  const obj = { 'te.st': 1, 'foo.bar': 2 }
  const transformer = keyTransform.createReplacementFunction('.', 'U+FF0E')
  const transform = keyTransform.recursiveJSONKeyTransform(transformer)
  const transformed = transform(obj)
  expect(transformed['teU+FF0Est']).toBe(1)
  expect(transformed['fooU+FF0Ebar']).toBe(2)
})

it('it should replace dots recursively', async () => {
  const obj = { 'a': { 'b.c': { 'c.d': 2 } } }
  const transformer = keyTransform.createReplacementFunction('.', 'U+FF0E')
  const transform = keyTransform.recursiveJSONKeyTransform(transformer)
  const transformed = transform(obj)
  expect(transformed['a']).toBeDefined()
  expect(transformed['a']['bU+FF0Ec']).toBeDefined()
  expect(transformed['a']['bU+FF0Ec']['cU+FF0Ed']).toBeDefined()
})
