async function buildDidStateTransforms (getPreviousStateModification) {

  function createUpdateRecord (updateType, authorDid, updateTime, updateTxId, newStateData) {
    const isGenesis = !(updateTime)
    const updateRecord = { updateType, isGenesis, newStateData }
    if (updateRecord.isGenesis === false) {
      updateRecord.from = authorDid
      updateRecord.time = updateTime
      updateRecord.id = updateTxId
    }
    return updateRecord
  }
  function createInitialState (did, authorDid, createTime, createTxId) {
    const creationRecord = createUpdateRecord()
    return {
      did: did,
      stateData: {},
      creationRecord,
      history: []
    }
  }

  function updateWithStateData (oldState, newStateData) {
    const updatedState = { ...oldState }
    updatedState.stateData = { ...oldState.stateData, ...newStateData }
    return updatedState
  }

  function extractBasicInfo (expansionTx) {
    const targetDid = expansionTx.txn.data.dest
    const authorDid = expansionTx.txn.metadata.from
    const updateTime = expansionTx.txnMetadata.txnTime
    const updateTxId = expansionTx.txnMetadata.txnId
    const stateDataUpdate = expansionTx.txn.data || {}
    return { targetDid, authorDid, updateTime, updateTxId, stateDataUpdate }
  }

  async function transformNymToState (expansionTx) {
    const { targetDid, authorDid, updateTime, updateTxId, stateDataUpdate } = extractBasicInfo(expansionTx)
    const update = await createUpdateRecord('nym', authorDid, updateTime, updateTxId, stateDataUpdate)

    let oldState = await getPreviousStateModification(targetDid)
    let newState = (oldState)
      ? updateWithStateData(oldState, stateDataUpdate)
      : createInitialState(targetDid, authorDid, updateTime, updateTxId)


    newState['history'].push(updateRecord)
    return newState
  }

  async function transformAttribToState (expansionTx) {

  }

  return {
    transformAttribToState,
    transformNymToState
  }
}

module.exports.buildDidStateTransforms = buildDidStateTransforms
