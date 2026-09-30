import test from 'node:test'
import assert from 'node:assert/strict'
import { collectCursorPages } from '../src/data/pagedRows.js'

test('loads all records across a per-request limit', async () => {
  const source = Array.from({ length: 1001 }, (_, index) => ({ id: String(index).padStart(4, '0') }))
  const cursors = []
  const rows = await collectCursorPages(async (afterId) => {
    cursors.push(afterId)
    return source.filter((row) => !afterId || row.id > afterId).slice(0, 500)
  })
  assert.deepEqual(rows, source)
  assert.deepEqual(cursors, [null, '0499', '0999', '1000'])
})

test('returns an empty list when there are no visible records', async () => {
  assert.deepEqual(await collectCursorPages(async () => []), [])
})

test('stops if a page repeats its final cursor', async () => {
  await assert.rejects(
    collectCursorPages(async () => [{ id: 'same' }]),
    /पृष्ठ क्रम अघि बढेन/,
  )
})
