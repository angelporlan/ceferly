import assert from 'node:assert/strict'
import { afterEach, test } from 'node:test'
import {
  getStreakBadge,
  mergeUserStats,
  publishUserStats,
  subscribeToUserStats,
} from '../src/services/userStats.mjs'

afterEach(() => {
  delete globalThis.window
})

test('publishes server stats to subscribed layout components', () => {
  globalThis.window = new EventTarget()
  let received
  const unsubscribe = subscribeToUserStats((update) => {
    received = update
  })

  const update = { coins: 18, hearts: 4, streak: 7 }
  publishUserStats(update)

  assert.deepEqual(received, update)
  unsubscribe()
})

test('unsubscribed components stop receiving stats updates', () => {
  globalThis.window = new EventTarget()
  let updates = 0
  const unsubscribe = subscribeToUserStats(() => {
    updates += 1
  })

  unsubscribe()
  publishUserStats({ coins: 20 })

  assert.equal(updates, 0)
})

test('merges only supplied values and preserves the rest of the profile', () => {
  const current = { coins: 5, hearts: 3, streak: 2, name: 'Ana', level: 'B2 First' }

  assert.deepEqual(mergeUserStats(current, { coins: 15, hearts: 5 }), {
    ...current,
    coins: 15,
    hearts: 5,
  })
})

test('returns the highest earned streak badge at 3, 7, and 30 day milestones', () => {
  assert.equal(getStreakBadge(2), null)
  assert.equal(getStreakBadge(3).label, '3d')
  assert.equal(getStreakBadge(6).label, '3d')
  assert.equal(getStreakBadge(7).label, '7d')
  assert.equal(getStreakBadge(29).label, '7d')
  assert.equal(getStreakBadge(30).label, '30d')
})
