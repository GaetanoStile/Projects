import type { Card, Tag } from '@/state/store'
import { AVAILABLE_TAGS } from '@/state/store'

export interface TagMeta {
  id: Tag
  label: string
  description: string
  group: 'warmup' | 'touch' | 'explicit' | 'power'
}

export const TAG_GROUPS: { id: TagMeta['group']; label: string }[] = [
  { id: 'warmup', label: 'Warm-up & Romance' },
  { id: 'touch', label: 'Touch & Sensation' },
  { id: 'explicit', label: 'Explicit Play' },
  { id: 'power', label: 'Power & Play' },
]

export const TAG_META: Record<Tag, TagMeta> = {
  romantic: {
    id: 'romantic',
    label: 'Romantic',
    description: 'Compliments, slow intimacy, cuddling, and affectionate connection.',
    group: 'warmup',
  },
  kissing: {
    id: 'kissing',
    label: 'Kissing',
    description: 'Kiss-focused warm-up cards from Deck A.',
    group: 'warmup',
  },
  massage: {
    id: 'massage',
    label: 'Massage & Touch',
    description: 'Oil, body massage, chest/back/neck touch, and sensual caressing.',
    group: 'touch',
  },
  teasing: {
    id: 'teasing',
    label: 'Teasing',
    description: 'Build anticipation with feathers, ice, grinding, striptease, and edging.',
    group: 'touch',
  },
  oral: {
    id: 'oral',
    label: 'Oral',
    description: 'Mouth and tongue play, including 69 and explicit oral actions.',
    group: 'explicit',
  },
  toys: {
    id: 'toys',
    label: 'Toys',
    description: 'Vibrators, toys, and toy-assisted play.',
    group: 'explicit',
  },
  positions: {
    id: 'positions',
    label: 'Positions',
    description: 'Intercourse positions and structured physical setups (Black deck + advanced D).',
    group: 'explicit',
  },
  domination: {
    id: 'domination',
    label: 'Domination',
    description: 'Spanking, binding, control, pinning, and taking the lead.',
    group: 'power',
  },
  submission: {
    id: 'submission',
    label: 'Submission',
    description: 'Surrender, being guided, tied, or following partner direction.',
    group: 'power',
  },
  roleplay: {
    id: 'roleplay',
    label: 'Roleplay & Performance',
    description: 'Striptease, lap dance, performance, and playful scenarios.',
    group: 'power',
  },
}

/** Per-card tag assignments for all base deck cards (by id). Swap cards are omitted — they bypass tag filters. */
export const BASE_CARD_TAGS: Record<string, Tag[]> = {
  // Deck A
  'a-1': ['kissing', 'romantic'], 'e-1': ['kissing', 'romantic'],
  'a-2': ['kissing', 'teasing'], 'e-2': ['kissing', 'teasing'],
  'a-3': ['kissing', 'teasing'], 'e-3': ['kissing', 'teasing'],
  'a-4': ['kissing', 'romantic'], 'e-4': ['kissing', 'romantic'],
  'a-5': ['kissing', 'romantic'], 'e-5': ['kissing', 'romantic'],
  'a-6': ['kissing', 'romantic'], 'e-6': ['kissing', 'romantic'],
  'a-7': ['kissing', 'teasing'], 'e-7': ['kissing', 'teasing'],
  'a-8': ['kissing', 'teasing'], 'e-8': ['kissing', 'teasing'],
  'a-9': ['kissing', 'romantic'], 'e-9': ['kissing', 'romantic'],
  'a-10': ['kissing', 'romantic'], 'e-10': ['kissing', 'romantic'],
  'a-11': ['kissing', 'teasing'], 'e-11': ['kissing', 'teasing'],
  'a-12': ['kissing', 'oral', 'teasing'], 'e-12': ['kissing', 'oral', 'teasing'],
  'a-13': ['kissing', 'romantic'], 'e-13': ['kissing', 'romantic'],
  'a-14': ['massage', 'kissing'], 'e-14': ['massage', 'kissing'],
  'a-15': ['kissing', 'teasing'], 'e-15': ['kissing', 'teasing'],
  'a-16': ['kissing', 'romantic'], 'e-16': ['kissing', 'romantic'],
  'a-17': ['kissing', 'teasing'], 'e-17': ['kissing', 'teasing'],

  // Deck B
  'b-1': ['massage', 'teasing'], 'f-1': ['massage', 'teasing'],
  'b-2': ['massage', 'kissing'], 'f-2': ['massage', 'kissing'],
  'b-3': ['teasing', 'massage'], 'f-3': ['teasing', 'massage'],
  'b-4': ['oral', 'teasing'], 'f-4': ['oral', 'teasing'],
  'b-5': ['romantic', 'teasing'], 'f-5': ['romantic', 'teasing'],
  'b-6': ['teasing', 'massage'], 'f-6': ['teasing', 'massage'],
  'b-7': ['massage'], 'f-7': ['massage'],
  'b-8': ['kissing', 'teasing'], 'f-8': ['kissing', 'teasing'],
  'b-9': ['teasing', 'domination'], 'f-9': ['teasing', 'domination'],
  'b-10': ['domination', 'teasing'], 'f-10': ['domination', 'teasing'],
  'b-11': ['roleplay', 'teasing'], 'f-11': ['roleplay', 'teasing'],
  'b-12': ['kissing', 'teasing'], 'f-12': ['kissing', 'teasing'],
  'b-13': ['toys', 'teasing'], 'f-13': ['toys', 'teasing'],
  'b-14': ['romantic', 'massage'], 'f-14': ['romantic', 'massage'],
  'b-15': ['oral', 'teasing'], 'f-15': ['oral', 'teasing'],
  'b-16': ['teasing', 'kissing'], 'f-16': ['teasing', 'kissing'],
  'b-17': ['oral', 'teasing', 'domination'], 'f-17': ['oral', 'teasing', 'domination'],

  // Deck C
  'c-1': ['oral', 'teasing'], 'g-1': ['oral', 'teasing'],
  'c-2': ['oral', 'positions'], 'g-2': ['oral', 'positions'],
  'c-3': ['roleplay', 'teasing'], 'g-3': ['roleplay', 'teasing'],
  'c-4': ['oral', 'teasing'], 'g-4': ['oral', 'teasing'],
  'c-5': ['oral'], 'g-5': ['oral'],
  'c-6': ['oral', 'positions'], 'g-6': ['oral', 'positions'],
  'c-7': ['toys', 'teasing'], 'g-7': ['toys', 'teasing'],
  'c-8': ['teasing'], 'g-8': ['teasing'],
  'c-9': ['oral', 'positions'], 'g-9': ['oral', 'positions'],
  'c-10': ['oral', 'teasing'], 'g-10': ['oral', 'teasing'],
  'c-11': ['toys', 'teasing'], 'g-11': ['toys', 'teasing'],
  'c-12': ['oral', 'positions'], 'g-12': ['oral', 'positions'],
  'c-13': ['oral', 'teasing'], 'g-13': ['oral', 'teasing'],
  'c-14': ['oral', 'positions'], 'g-14': ['oral', 'positions'],
  'c-15': ['oral'], 'g-15': ['oral'],
  'c-16': ['oral', 'teasing'],
  'c-17': ['toys', 'oral'],
  'c-18': ['teasing', 'positions'],
  'g-16': ['oral', 'teasing'],
  'g-17': ['teasing', 'positions'],
  'g-18': ['roleplay', 'teasing'],

  // Deck D
  'd-2': ['oral', 'teasing', 'positions'],
  'd-3': ['oral', 'positions'],
  'd-4': ['oral', 'positions'],
  'd-5': ['oral', 'positions'],
  'd-6': ['teasing', 'positions'],
  'd-7': ['oral', 'positions'],
  'd-8': ['oral', 'positions'],
  'd-9': ['oral', 'positions'],
  'd-10': ['oral', 'positions'],
  'd-11': ['oral', 'positions'],
  'd-12': ['oral', 'positions'],
  'd-13': ['teasing', 'positions'],
  'd-14': ['toys', 'oral'],
  'd-15': ['oral', 'domination'],
  'd-16': ['romantic', 'oral'],
  'd-17': ['oral'],
  'd-18': ['oral', 'submission'],
  'd-19': ['oral', 'teasing'],
  'h-2': ['teasing', 'positions'],
  'h-3': ['teasing', 'submission'],
  'h-4': ['submission', 'teasing', 'romantic'],
  'h-5': ['domination', 'teasing'],
  'h-6': ['oral', 'positions'],
  'h-7': ['domination', 'oral'],
  'h-8': ['oral', 'roleplay'],
  'h-9': ['teasing', 'oral'],
  'h-10': ['submission', 'teasing'],
  'h-11': ['teasing', 'domination', 'positions'],
  'h-12': ['oral', 'domination', 'positions'],
  'h-13': ['domination', 'oral'],
  'h-14': ['domination', 'submission', 'positions', 'toys'],
  'h-15': ['teasing', 'toys'],
  'h-16': ['roleplay', 'toys'],
  'h-17': ['toys', 'teasing'],
  'h-18': ['oral', 'toys', 'positions'],
  'h-19': ['oral', 'domination', 'positions'],

  // Black deck — positions; oral variants noted
  'black-missionary': ['positions'],
  'black-her-mission': ['positions'],
  'black-double-up': ['positions'],
  'black-froggy': ['positions'],
  'black-rising-hips': ['positions'],
  'black-side-straddle': ['positions'],
  'black-standing-behind': ['positions'],
  'black-flat-iron': ['positions'],
  'black-standing-face-to-face': ['positions'],
  'black-her-69': ['oral', 'positions'],
  'black-spooning': ['positions', 'romantic'],
  'black-side-angle': ['positions'],
  'black-doggy': ['positions'],
  'black-cowgirl': ['positions'],
  'black-split': ['positions'],
  'black-missionary-raised-hips': ['positions'],
  'black-running-man': ['positions'],
  'black-in-control': ['oral', 'domination', 'positions'],
  'black-legs-up': ['positions'],
  'black-lotus': ['positions', 'romantic'],
  'black-feet-on-chest': ['positions'],
  'black-sideways-lazy-doggy': ['positions'],
  'black-open-show': ['positions'],
  'black-downward-lick': ['oral', 'positions'],
  'black-at-attention': ['oral', 'positions'],
  'black-lap-dance': ['roleplay', 'teasing', 'positions'],
  'black-hot-seat': ['positions'],
  'black-sideways-lick': ['oral', 'positions'],
  'black-bizarro': ['positions'],
  'black-workout': ['positions'],
  'black-on-the-edge': ['positions'],
  'black-bend-over': ['positions'],
  'black-reverse-cowgirl': ['positions'],
  'black-magic-chair': ['positions'],
  'black-dinner-plate': ['oral', 'positions'],
}

export function getTagsForCard(card: Pick<Card, 'id' | 'tags' | 'isSwapCard'>): Tag[] {
  if (card.tags && card.tags.length > 0) {
    return card.tags.filter((tag): tag is Tag => AVAILABLE_TAGS.includes(tag as Tag))
  }
  if (card.isSwapCard) return []
  return BASE_CARD_TAGS[card.id] ?? []
}

/** Returns true when the card should appear during gameplay given disabled tag categories. */
export function cardPassesTagFilter(
  card: Pick<Card, 'id' | 'tags' | 'isSwapCard'>,
  disabledTags: Tag[],
): boolean {
  if (card.isSwapCard) return true
  if (disabledTags.length === 0) return true

  const cardTags = getTagsForCard(card)
  if (cardTags.length === 0) return true

  return !cardTags.some(tag => disabledTags.includes(tag))
}

export function countCardsByTag(cards: Card[]): Record<Tag, number> {
  const counts = Object.fromEntries(AVAILABLE_TAGS.map(tag => [tag, 0])) as Record<Tag, number>
  for (const card of cards) {
    if (card.isSwapCard) continue
    const tags = getTagsForCard(card)
    for (const tag of tags) {
      counts[tag] += 1
    }
  }
  return counts
}
