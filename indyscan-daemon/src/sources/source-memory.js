const {interfaces, implSource} = require('../factory')

// https://stackoverflow.com/questions/2631001/test-for-existence-of-nested-javascript-object-key
function checkNested(obj, level,  ...rest) {
  if (obj === undefined) return false
  if (rest.length === 0 && obj.hasOwnProperty(level)) return true
  return checkNested(obj[level], ...rest)
}

function createSourceMemory ({id, dataspace}) {

  if (!dataspace.domain) {
    throw Error(`Dataspace needs to have field 'domain'`)
  }

  if (!dataspace.config) {
    throw Error(`Dataspace needs to have field 'config'`)
  }

  if (!dataspace.pool) {
    throw Error(`Dataspace needs to have field 'pool'`)
  }

  function getTxData (subledger, seqNo, format = 'original') {
    subledger = subledger.toLowerCase()
    format = format.toLowerCase()
    if (!checkNested(dataspace, subledger, seqNo, format)) {
      return undefined
    }
    return dataspace[subledger][seqNo][format]
  }

  function getHighestSeqno(subledger) {
    let seqNos = Object.keys(dataspace[subledger])
    if (seqNos.length === 0) {
      return 0
    }
    return Math.max(...seqNos)
  }

  function getObjectId() {
    return id
  }


  async function getInterfaceName() {
    return interfaces.source
  }

  async function getImplName() {
    return implSource.memory
  }

  return {
    getObjectId,
    getTxData,
    getHighestSeqno,
    getInterfaceName,
    getImplName
  }
}

module.exports.createSourceMemory = createSourceMemory
