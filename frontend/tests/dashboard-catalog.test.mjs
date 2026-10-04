import test from 'node:test'
import assert from 'node:assert/strict'
import { mapDashboardCatalog } from '../src/pages/dashboardCatalog.mjs'

test('maps only named subcategories with a positive API exercise count', () => {
  const catalog = mapDashboardCatalog([
    {
      id: 4,
      name: 'Grammar',
      subcategories: [
        { id: 11, name: 'Conditionals', totalItems: 8 },
        { id: 12, name: 'Empty topic', totalItems: 0 },
        { id: 13, name: 'Unknown count' },
        { id: 14, name: 'Invalid count', totalItems: '3' },
        { id: null, name: 'Missing id', totalItems: 5 },
        { id: 15, name: '', totalItems: 5 },
      ],
    },
    { id: 5, name: 'Empty category', subcategories: [{ id: 16, name: 'Empty', totalItems: 0 }] },
  ])

  assert.deepEqual(catalog, [{ id: '11', title: 'Conditionals', category: 'Grammar' }])
})

test('does not synthesize progress fields for catalog entries', () => {
  const [module] = mapDashboardCatalog([
    {
      id: 4,
      name: 'Grammar',
      subcategories: [{ id: 11, name: 'Conditionals', totalItems: 8 }],
    },
  ])

  assert.deepEqual(Object.keys(module).sort(), ['category', 'id', 'title'])
})

test('returns an empty catalog for empty or malformed API data', () => {
  assert.deepEqual(mapDashboardCatalog([]), [])
  assert.deepEqual(mapDashboardCatalog(null), [])
  assert.deepEqual(mapDashboardCatalog([{ id: 4, name: 'Grammar', subcategories: 'invalid' }]), [])
})
