/* eslint-env jest */

const toCanonicalJson = require('canonical-json')
const { esAndFilters } = require('../../../src/es/es-query-builder')
const { esFullTextsearch } = require('../../../src/es/es-query-builder')

describe('elasticsearch utils', () => {
  it('should turn null, undefined, empty array into empty array', async () => {
    const q1 = esAndFilters(null)
    expect(toCanonicalJson(q1)).toBe(toCanonicalJson({}))

    const q2 = esAndFilters(undefined)
    expect(toCanonicalJson(q2)).toBe(toCanonicalJson({}))

    const q3 = esAndFilters([])
    expect(toCanonicalJson(q3)).toBe(toCanonicalJson({}))

    const q4 = esAndFilters([], null, [], undefined)
    expect(toCanonicalJson(q4)).toBe(toCanonicalJson({}))
  })

  it('should create and-filter from single query', async () => {
    const q = esAndFilters(esFullTextsearch('foobar'))
    expect(toCanonicalJson(q)).toBe(toCanonicalJson(
      {
        bool: {
          filter: [{
            simple_query_string: {
              default_operator: 'and',
              query: 'foobar'
            }
          }]
        }
      }))
  })

  it('should create and-filter from 2 queries', async () => {
    const q = esAndFilters(esFullTextsearch('foo'), esFullTextsearch('bar'))
    expect(toCanonicalJson(q)).toBe(toCanonicalJson(
      {
        bool: {
          filter: [
            {
              simple_query_string: {
                query: 'foo',
                default_operator: 'and'
              }
            },
            {
              simple_query_string:
                {
                  query: 'bar',
                  default_operator: 'and'
                }
            }
          ]
        }
      }
    ))
  })

  it('should create and-filter from 2 queries in arrays', async () => {
    const q = esAndFilters([esFullTextsearch('foo')], [esFullTextsearch('bar')])
    expect(toCanonicalJson(q)).toBe(toCanonicalJson(
      {
        bool: {
          filter: [
            {
              simple_query_string: {
                query: 'foo',
                default_operator: 'and'
              }
            },
            {
              simple_query_string:
                {
                  query: 'bar',
                  default_operator: 'and'
                }
            }
          ]
        }
      }
    ))
  })


  it('should create filter for seqno', async () => {
    const q = esFilterSeqNoGte()
    expect(toCanonicalJson(q)).toBe(toCanonicalJson(
      {
        bool: {
          filter: [
            {
              simple_query_string: {
                query: 'foo',
                default_operator: 'and'
              }
            },
            {
              simple_query_string:
                {
                  query: 'bar',
                  default_operator: 'and'
                }
            }
          ]
        }
      }
    ))
  })
})
