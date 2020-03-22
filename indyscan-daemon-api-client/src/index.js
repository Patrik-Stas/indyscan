const axios = require('axios')
const qs = require('query-string')

async function getRequest (url) {
  const res = await axios.get(url)
  return res.data
}



async function postRequest (url, payload) {
  const res = await axios.post(url, payload)
  return res.data
}


// async function returnNullFor404 (axiosCallableReturningResponseData) {
//   try {
//     const data = await axiosCallableReturningResponseData()
//     return data
//   } catch (err) {
//     if (err.response && err.response.status === 404) {
//       return null
//     } else throw err
//   }
// }

async function getWorkers (baseUrl, operationType, subledger, targetEsIndex ) {
  const query = qs.stringify({ operationType, subledger, targetEsIndex })
  return getRequest(`${baseUrl}/api/workers?${query}`)
}

async function stopWorkers (baseUrl) {
  const query = qs.stringify({ enabled: false })
  return postRequest(`${baseUrl}/api/workers?${query}`)
}


module.exports.getWorkers = getWorkers
module.exports.stopWorkers = stopWorkers
