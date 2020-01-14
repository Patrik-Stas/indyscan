/* eslint-env jest */
const {injectDependencies, registerInstance, flushDiContainer} = require('../../src/di-container')

describe('basic dependency injection', () => {
  beforeEach(() => {
    flushDiContainer()
  })

  it('should register and inject dependency', async () => {
    let instance = { some: "thing" }
    registerInstance('foobar', instance)
    let dependent = {
      a: "b",
      dependency: "@@foobar"
    }

    injectDependencies(dependent)
    expect(dependent.dependency.some).toBe("thing")
  })

  it('should require di-container in different scope and inject dependency', async () => {
    {
      const diContainer1 = require('../../src/di-container')
      let instance = {some: "thing"}
      diContainer1.registerInstance('foobar', instance)
    }
    {
      const diContainer2 = require('../../src/di-container')
      let dependent = {
        a: "b",
        dependency: "@@foobar"
      }
      diContainer2.injectDependencies(dependent)
      expect(dependent.dependency.some).toBe("thing")
    }
  })

  it('should throw error if same ID is used twice for DI registration', async () => {
    let instance1 = { foo: "foo" }
    let instance2 = { bar: "bar" }
    const t = () => {
      registerInstance('abc', instance1)
      registerInstance('abc', instance2)
    }
    expect(t).toThrow("Duplicate instance id 'abc' upon DI registration!")
  })

  it('should throw error if object refers to dependency which does not exist in DI container', async () => {
    const diContainer = require('../../src/di-container')
    let dependent = {
      dependency: "@@foobar"
    }
    const t = () => {
      diContainer.injectDependencies(dependent)
    }
    expect(t).toThrow(`Found reference to dependency identified as 'foobar' but no such object was registered.`)
  })

  it('should throw error if trying to register null as dependency', async () => {
    const t = () => {
      registerInstance('abc', null)
    }
    expect(t).toThrow(`Registering instance 'abc' but provided instance is null or undefined.`)
  })

  it('should throw error if trying to register undefined as dependency', async () => {
    const t = () => {
      registerInstance('abc', undefined)
    }
    expect(t).toThrow(`Registering instance 'abc' but provided instance is null or undefined.`)
  })
})
