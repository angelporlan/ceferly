import test from 'node:test'
import assert from 'node:assert/strict'
import {
  areNumberedGapAnswersComplete,
  buildNumberedGapAnswers,
  getExerciseGapNumbers,
} from '../src/lib/exerciseGapAnswers.mjs'

test('extracts unique numbered gap markers and sorts them numerically', () => {
  assert.deepEqual(
    getExerciseGapNumbers('A (10)…………… sentence, then (2) ______ and (10) ...'),
    ['2', '10'],
  )
})

test('ignores ordinary question references and numbered instruction text', () => {
  assert.deepEqual(getExerciseGapNumbers('Question (1) asks you to use (ALLOW).'), [])
})

test('builds a trimmed answer map and requires every visible gap', () => {
  const gapNumbers = ['1', '2']
  const answers = buildNumberedGapAnswers(gapNumbers, { 1: '  first  ', 2: '' })

  assert.deepEqual(answers, { 1: 'first', 2: '' })
  assert.equal(areNumberedGapAnswersComplete(gapNumbers, answers), false)
  assert.equal(areNumberedGapAnswersComplete(gapNumbers, { 1: ' first ', 2: 'second' }), true)
  assert.equal(areNumberedGapAnswersComplete([], {}), false)
})
