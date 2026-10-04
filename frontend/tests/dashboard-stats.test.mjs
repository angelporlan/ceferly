import test from 'node:test'
import assert from 'node:assert/strict'
import { parseDashboardStats } from '../src/pages/dashboardStats.mjs'

test('preserves zero values returned by the API', () => {
  assert.deepEqual(
    parseDashboardStats({ attemptsToday: 0, dailyGoal: 5, streak: 0 }),
    { attemptsToday: 0, dailyGoal: 5, streak: 0 },
  )
})

test('accepts the API alias when attemptsToday is absent', () => {
  assert.deepEqual(
    parseDashboardStats({ numberOfAttempts: 3, dailyGoal: 8, streak: 2 }),
    { attemptsToday: 3, dailyGoal: 8, streak: 2 },
  )
})

test('rejects missing, malformed, negative, or non-finite statistics', () => {
  assert.equal(parseDashboardStats(null), null)
  assert.equal(parseDashboardStats({ attemptsToday: 0, streak: 0 }), null)
  assert.equal(parseDashboardStats({ attemptsToday: '0', dailyGoal: 5, streak: 0 }), null)
  assert.equal(parseDashboardStats({ attemptsToday: -1, dailyGoal: 5, streak: 0 }), null)
  assert.equal(parseDashboardStats({ attemptsToday: 0, dailyGoal: 5, streak: Number.NaN }), null)
})
