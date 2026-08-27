import { readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const cardsPath = join(__dirname, '../src/data/cards.json')

function loadTagsFromSource() {
  const src = readFileSync(join(__dirname, '../src/lib/cardTags.ts'), 'utf8')
  const match = src.match(/export const BASE_CARD_TAGS[^=]*=\s*\{([\s\S]*?)\n\}/)
  if (!match) throw new Error('Could not parse BASE_CARD_TAGS from cardTags.ts')

  const tags = {}
  const entryRe = /'([^']+)':\s*\[([^\]]*)\]/g
  let m
  while ((m = entryRe.exec(match[1])) !== null) {
    const id = m[1]
    const tagList = m[2]
      .split(',')
      .map(s => s.trim().replace(/['"]/g, ''))
      .filter(Boolean)
    tags[id] = tagList
  }
  return tags
}

const tagMap = loadTagsFromSource()
const cards = JSON.parse(readFileSync(cardsPath, 'utf8'))

let tagged = 0
let skipped = 0
const missing = []

const updated = cards.map(card => {
  if (card.isSwapCard) {
    skipped++
    return card
  }
  const tags = tagMap[card.id]
  if (!tags || tags.length === 0) {
    missing.push(`${card.id}: ${card.title}`)
    return card
  }
  tagged++
  return { ...card, tags }
})

writeFileSync(cardsPath, JSON.stringify(updated, null, 2) + '\n')
console.log(`Tagged ${tagged} cards, skipped ${skipped} swap cards.`)
if (missing.length) {
  console.warn('Missing tags for:', missing.join(', '))
}
