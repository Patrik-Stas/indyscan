const sleep = require('sleep-promise')
const { performance } = require('perf_hooks')

function getRandomArbitrary (min, max) {
  return Math.random() * (max - min) + min
}

function jitterize (number, jitterRatio) {
  return number + (number * getRandomArbitrary(-jitterRatio, jitterRatio))
}

async function sleepWithJitter (logPrefix, seconds, jitterRatio) {
  const timeoutMs = jitterize(seconds * 1000, jitterRatio)
  await sleep(timeoutMs)
}

async function runWithTimer (closure, resultCallback) {
  const t0 = performance.now()
  const result = await closure()
  const t1 = performance.now()
  try {
    resultCallback(t1 - t0)
  } catch (e) {}
  return result
}

module.exports.jitterize = jitterize
module.exports.sleepWithJitter = sleepWithJitter
module.exports.runWithTimer = runWithTimer
