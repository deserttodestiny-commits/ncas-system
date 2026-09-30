// Cursor paging avoids Supabase's per-request row cap and keeps the order stable.
export async function collectCursorPages(fetchPage) {
  const rows = []
  let lastId = null
  while (true) {
    const page = await fetchPage(lastId)
    if (page.length === 0) return rows
    const nextId = page[page.length - 1].id
    if (!nextId || nextId === lastId) throw new Error('डेटा पृष्ठ क्रम अघि बढेन।')
    rows.push(...page)
    lastId = nextId
  }
}
