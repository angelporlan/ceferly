import test from 'node:test'
import assert from 'node:assert/strict'
import { parseHeaderCounters } from '../src/components/layout/headerStats.mjs'

test('preserves explicit zero counters from the authenticated profile', () => {
  assert.deepEqual(
    parseHeaderCounters({ streak: 0, coins: 0, hearts: 0 }),
    { streak: 0, coins: 0, hearts: 0 },
  )
})

test('returns valid profile counters without adding fallback values', () => {
  assert.deepEqual(
    parseHeaderCounters({ streak: 4, coins: 27, hearts: 3, name: 'Ada' }),
    { streak: 4, coins: 27, hearts: 3 },
  )
})

test('rejects missing or invalid profile counters', () => {
  assert.equal(parseHeaderCounters(null), null)
  assert.equal(parseHeaderCounters({ streak: 0, coins: 0 }), null)
  assert.equal(parseHeaderCounters({ streak: 0, coins: '0', hearts: 0 }), null)
  assert.equal(parseHeaderCounters({ streak: -1, coins: 0, hearts: 0 }), null)
  assert.equal(parseHeaderCounters({ streak: 0, coins: 0, hearts: 1.5 }), null)
})
