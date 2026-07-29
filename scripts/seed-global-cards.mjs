import fs from 'fs'

const env = Object.fromEntries(
  fs
    .readFileSync('.env.local', 'utf8')
    .split(/\r?\n/)
    .filter((l) => l && !l.startsWith('#') && l.includes('='))
    .map((l) => {
      const i = l.indexOf('=')
      return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^["']|["']$/g, '')]
    })
)
const url = env.SUPABASE_URL || env.VITE_SUPABASE_URL
const key = env.SUPABASE_SERVICE_ROLE_KEY
const cards = JSON.parse(fs.readFileSync('src/data/cards.json', 'utf8'))
const rows = cards.map((c) => ({
  title: c.title,
  description: c.description,
  deck: c.deck,
  player_color: c.playerColor,
  is_swap_card: !!c.isSwapCard,
  is_custom: false,
  is_enabled: true,
  is_favorite: false,
  intensity: 'medium',
  tags: [],
  image_url: null,
  visibility: 'private',
  owner_id: null,
}))

const countRes = await fetch(url + '/rest/v1/cards?select=id&owner_id=is.null&limit=1', {
  headers: { apikey: key, Authorization: 'Bearer ' + key, Prefer: 'count=exact' },
})
const range = countRes.headers.get('content-range') || ''
const total = Number(range.split('/')[1] || '0')
if (total > 0) {
  console.log('ALREADY_SEEDED', total)
  process.exit(0)
}
let inserted = 0
for (let i = 0; i < rows.length; i += 50) {
  const batch = rows.slice(i, i + 50)
  const r = await fetch(url + '/rest/v1/cards', {
    method: 'POST',
    headers: {
      apikey: key,
      Authorization: 'Bearer ' + key,
      'Content-Type': 'application/json',
      Prefer: 'return=minimal',
    },
    body: JSON.stringify(batch),
  })
  if (!r.ok) {
    console.log('FAIL', r.status, await r.text())
    process.exit(1)
  }
  inserted += batch.length
}
console.log('SEEDED', inserted)
