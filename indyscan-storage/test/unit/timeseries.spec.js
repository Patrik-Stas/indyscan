/* eslint-env jest */
import 'jest'
import { createHistogram, createHistogramInRange } from '../../src/histogram'
import 'assert'
import { timestamps } from './../data-timestamps'

describe('API claim issuance scenario', () => {
  it('should create histogram', async () => {
    const timestamps = [1, 1, 1, 2, 2, 3, 3, 8, 10]
    // 0 _ 1 _ 2 _ 3 _ 4 _ 5 _ 6 _ 7 _ 8 _ 9 _ 10           < values
    //     1__________ 2__________ 3__________  4________   < buckets of size 3 given min and max of dataset
    const histogram = await createHistogram(timestamps, 3)
    expect(histogram[0][0]).toBe(1)
    expect(histogram[0][1]).toBe(7)

    expect(histogram[1][0]).toBe(4)
    expect(histogram[1][1]).toBe(0)

    expect(histogram[2][0]).toBe(7)
    expect(histogram[2][1]).toBe(1)
  })

  it('should create histogram when values are not ordered', async () => {
    const timestamps = [10, 1, 3, 2, 8, 1, 2, 1, 3]
    // 0 _ 1 _ 2 _ 3 _ 4 _ 5 _ 6 _ 7 _ 8 _ 9 _ 10           < values
    //     1__________ 2__________ 3__________  4________   < buckets of size 3 given min and max of dataset
    const histogram = await createHistogram(timestamps, 3)
    expect(histogram[0][0]).toBe(1)
    expect(histogram[0][1]).toBe(7)

    expect(histogram[1][0]).toBe(4)
    expect(histogram[1][1]).toBe(0)

    expect(histogram[2][0]).toBe(7)
    expect(histogram[2][1]).toBe(1)
  })

  it('should create from histogram bounded in interval', async () => {
    const timestamps = [1, 1, 1, 2, 2, 3, 3, 5, 6, 6, 7, 8, 9, 10, 11]
    const histogram = await createHistogramInRange(timestamps, 2, 6, 9)
    expect(histogram[0][0]).toBe(6)
    expect(histogram[0][1]).toBe(3)

    expect(histogram[1][0]).toBe(8)
    expect(histogram[1][1]).toBe(2)
  })

  it('should create from histogram bounded in interval when values are not ordered', async () => {
    const timestamps = [2, 5, 6, 1, 1, 6, 7, 8, 2, 3, 1, 3, 9, 10, 11]
    const histogram = await createHistogramInRange(timestamps, 2, 6, 9)
    expect(histogram[0][0]).toBe(6)
    expect(histogram[0][1]).toBe(3)

    expect(histogram[1][0]).toBe(8)
    expect(histogram[1][1]).toBe(2)
  })

  it('should fill zeroes to empty buckets on interval wider than range of dataset', async () => {
    const timestamps = [4, 5, 5, 6]
    const histogram = await createHistogramInRange(timestamps, 1, 1, 8)
    expect(histogram[0][0]).toBe(1)
    expect(histogram[0][1]).toBe(0)

    expect(histogram[1][0]).toBe(2)
    expect(histogram[1][1]).toBe(0)

    expect(histogram[2][0]).toBe(3)
    expect(histogram[2][1]).toBe(0)

    expect(histogram[3][0]).toBe(4)
    expect(histogram[3][1]).toBe(1)

    expect(histogram[4][0]).toBe(5)
    expect(histogram[4][1]).toBe(2)

    expect(histogram[5][0]).toBe(6)
    expect(histogram[5][1]).toBe(1)

    expect(histogram[6][0]).toBe(7)
    expect(histogram[6][1]).toBe(0)

    expect(histogram[7][0]).toBe(8)
    expect(histogram[7][1]).toBe(0)
  })

  it('should work with small bucketsize', async () => {
    const timestamps = [1, 3]
    const histogram = await createHistogram(timestamps, 1)
    expect(histogram[0][0]).toBe(1)
    expect(histogram[0][1]).toBe(1)

    expect(histogram[1][0]).toBe(2)
    expect(histogram[1][1]).toBe(0)

    expect(histogram[2][0]).toBe(3)
    expect(histogram[2][1]).toBe(1)
  })

  it('should handle small dataset', async () => {
    const timestamps = [1]
    const histogram = await createHistogram(timestamps, 3)
    expect(histogram[0][0]).toBe(1)
    expect(histogram[0][1]).toBe(1)
  })

  it('should not fail on big dataset', async () => {
    const intervalSec = 60 * 60 * 24
    await createHistogram(timestamps, intervalSec)
  })

  it('should not fail on big dataset', async () => {
    const dailySec = 60 * 60 * 24
    const startTime = 1286705410 // 10/10/2010 @ 10:10am (UTC)
    const timestamps = [
      startTime,
      startTime + dailySec,
      startTime + dailySec * 2,
      startTime + dailySec * 3,
      startTime + dailySec * 4,
      startTime + dailySec * 5
    ]
    const endTime = timestamps[timestamps.length - 1]
    await createHistogramInRange(timestamps, dailySec, startTime, endTime)
  })
})
