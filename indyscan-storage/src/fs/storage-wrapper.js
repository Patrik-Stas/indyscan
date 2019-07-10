const storage = require('node-persist')

async function createStorage (name) {
  const storageInstance = storage.create({ dir: name })
  await storageInstance.init()

  async function set (id, data, metadata = null) {
    if (!data) {
      throw Error('Trying to persist data of value "null" or "undefined".')
    }
    return storageInstance.set(id.toString(), JSON.stringify({ data, metadata }))
  }

  async function get (id) {
    const { data } = await getFull(id.toString())
    return data
  }

  async function getFull (id) {
    return JSON.parse(await storageInstance.get(id.toString()))
  }

  async function values () {
    const fullValues = await valuesFull()
    return fullValues.map(f => f.data)
  }

  async function valuesFull () {
    const fullValues = await storageInstance.values() || []
    return fullValues.map(f => JSON.parse(f))
  }

  async function keys () {
    return storageInstance.keys() || []
  }

  async function hasKey (key) {
    const res = await get(key.toString())
    return !!res
  }

  async function del (key) {
    return storageInstance.removeItem(key.toString())
  }

  async function length () {
    const keys = await this.keys()
    return keys.length
  }

  function readOnly () {
    return {
      get: get.bind(this),
      getFull: get.bind(this),
      values: values.bind(this),
      valuesFull: valuesFull.bind(this),
      keys: keys.bind(this),
      hasKey: hasKey.bind(this),
      length: length.bind(this)
    }
  }

  return {
    set,
    get,
    getFull,
    values,
    valuesFull,
    keys,
    hasKey,
    del,
    length,
    readOnly
  }
}

module.exports.createStorage = createStorage
