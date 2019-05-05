function createHistogram (values, bucketSize) {
  return createHistogramInInterval(values, bucketSize, Math.min(...values), Math.max(...values))
}

function createHistogramWithLowerBound (values, bucketSize, min) {
  return createHistogramInInterval(values, bucketSize, min, Math.max(...values))
}

function createHistogramWithUpperBound (values, bucketSize, max) {
  return createHistogramInInterval(values, bucketSize, Math.min(...values), max)
}

// |____o___|_______|_o______|_______|
// ===========================  < 3 buckets
// floor(0.5) = 0, floor(2.2)=2, need 0,1,2 buckets
// need this: <floor(min), floor(max)> + 1 buckets
function createHistogramInInterval (values, bucketSize, bound1, bound2) {
  console.log(`Creating histogram from ${values.length} values`)
  console.log(`Creating histogram with bucketSize=${bucketSize}. B1=${bound1}, B2=${bound2}`)
  const minBucketSize = 0.000001
  if (Math.abs(bucketSize) < minBucketSize) {
    throw Error(`Bucket size must be bigger than ${minBucketSize}`)
  }
  const min = (bound1 < bound2) ? bound1 : bound2
  const max = (bound1 < bound2) ? bound2 : bound1
  const minBucketIdx = Math.floor(min / bucketSize)
  const maxBucketIdx = Math.floor(max / bucketSize)
  const bucketCnt = (maxBucketIdx - minBucketIdx) + 1
  console.log(`Creating histogram, calculated number of buckets = ${bucketCnt}`)
  let histogram = []
  histogram.length = bucketCnt
  for (let i = 0; i < bucketCnt; i++) { // initialize buckets to 0
    histogram[i] = [(bucketSize * i) + min, 0]
  }
  for (let i = 0; i < values.length; i++) { // fill buckets
    const value = values[i]
    if ((value > max) || (value < min)) { // ignore out of range data
      continue
    }
    const bucket = Math.floor((value - min) / bucketSize)
    histogram[bucket][1] += 1
  }
  return histogram
}

module.exports.createHistogram = createHistogram
module.exports.createHistogramInRange = createHistogramInInterval
module.exports.createHistogramWithLowerBound = createHistogramWithLowerBound
module.exports.createHistogramWithUpperBound = createHistogramWithUpperBound
