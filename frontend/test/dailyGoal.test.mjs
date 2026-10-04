import assert from 'node:assert/strict'
import { test } from 'node:test'
import { parseDailyGoal } from '../src/utils/dailyGoal.mjs'

test('accepts integer daily goals from 1 to 100', () => {
  assert.equal(parseDailyGoal(1), 1)
  assert.equal(parseDailyGoal('5'), 5)
  assert.equal(parseDailyGoal(100), 100)
})

test('rejects empty, fractional, and out-of-range daily goals', () => {
  for (const value of ['', '1.5', 1.5, '0', 0, '-1', 101, 'not a number']) {
    assert.equal(parseDailyGoal(value), null, `expected ${String(value)} to be rejected`)
  }
})
