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

async function getWorkers (baseUrl, query) {
  const queryString = qs.stringify(query)
  return getRequest(`${baseUrl}/api/workers?${queryString}`)
}

async function disableWorkers (baseUrl, query) {
  const queryString = qs.stringify({ enabled: false, ... query })
  return postRequest(`${baseUrl}/api/workers?${queryString}`)
}

async function enableWorkers (baseUrl) {
  const queryString = qs.stringify({ enabled: true, ... query })
  return postRequest(`${baseUrl}/api/workers?${queryString}`)
}

async function flipWorkers (baseUrl, query) {
  const queryString = qs.stringify({ flipState: true, ... query })
  return postRequest(`${baseUrl}/api/workers?${queryString}`)
}

module.exports.getWorkers = getWorkers
module.exports.disableWorkers = disableWorkers
module.exports.enableWorkers = enableWorkers
module.exports.flipWorkers = flipWorkers

