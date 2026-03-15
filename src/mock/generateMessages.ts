import type { DemoAuthor, DemoMessage } from '../types/message'
import { mulberry32, pickOne, randomInt } from './seededRandom'

type GenerateMessagesOptions = {
  count: number
  imageRatio: number
  seed: number
}

const AUTHORS: Record<DemoAuthor, string[]> = {
  me: ['Alex', 'Jordan', 'Riley'],
  other: ['Taylor', 'Morgan', 'Casey', 'Avery']
}

const LOREM_POOL = [
  'The latest render test is ready for another measurement pass.',
  'I swapped the dataset to keep the scroll profile deterministic.',
  'This thread mixes short notes with long paragraphs to stress layout.',
  'Image cards are useful for revealing row height variance during scroll.',
  'We should compare plain rendering with virtualization under the same seed.',
  'Scrolling feels stable even when the list jumps between text and media.',
  'A reproducible seed matters more than realistic wording in this demo.',
  'The toolbar updates the URL so every scenario is shareable.',
  'Long task measurements become easier to reason about after each reset.',
  'The DOM count should stay flat in virtualized mode as the dataset grows.'
]

function buildText(random: () => number) {
  const sentenceCount = randomInt(random, 1, 4)
  return Array.from({ length: sentenceCount }, () => pickOne(random, LOREM_POOL)).join(' ')
}

function buildImageUrl(index: number, random: () => number) {
  const width = randomInt(random, 320, 720)
  const height = randomInt(random, 220, 540)
  return `https://picsum.photos/seed/chat-virtualization-${index}/${width}/${height}`
}

export function generateMessages({
  count,
  imageRatio,
  seed
}: GenerateMessagesOptions): DemoMessage[] {
  const random = mulberry32(seed)
  const normalizedImageRatio = Math.max(0, Math.min(1, imageRatio))
  const startTimestamp = Date.UTC(2025, 0, 1, 9, 0, 0)

  return Array.from({ length: count }, (_, index) => {
    const author: DemoAuthor = random() > 0.5 ? 'me' : 'other'
    const kind = random() < normalizedImageRatio ? 'image' : 'text'
    const timestamp = startTimestamp + index * randomInt(random, 20_000, 180_000)
    const authorName = pickOne(random, AUTHORS[author])

    return {
      id: `msg-${seed}-${index}`,
      author,
      kind,
      text: kind === 'text' ? buildText(random) : undefined,
      imageUrl: kind === 'image' ? buildImageUrl(index, random) : undefined,
      timestamp,
      authorName
    }
  })
}
