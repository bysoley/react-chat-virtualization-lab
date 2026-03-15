import type { DemoAuthor, DemoMessage, DemoMessageKind } from '../types/message'
import { mulberry32, pickOne, randomInt } from './seededRandom'

type GenerateMessagesOptions = {
  count: number
  imageRatio: number
  replyRatio: number
  seed: number
}

const DAY_BOUNDARY_RATIO = 0.05

const AUTHORS: Record<DemoAuthor, string[]> = {
  me: ['민준', '서연', '지호'],
  other: ['하은', '도현', '수아', '재원']
}

const LOREM_POOL = [
  '이번 렌더 테스트 결과 확인해봤어? 꽤 안정적이더라.',
  '데이터셋을 시드 기반으로 바꿔서 스크롤 패턴이 재현 가능해졌어.',
  '짧은 메시지랑 긴 단락을 섞어서 레이아웃 스트레스 테스트 중이야.',
  '이미지 카드가 포함되면 스크롤할 때 row 높이 분산을 확인하기 좋아.',
  '일반 렌더링이랑 가상화 방식 동일한 시드로 비교해봐야 할 것 같아.',
  '텍스트랑 미디어 혼합해도 스크롤이 꽤 안정적으로 유지되네.',
  '테스트 데이터라서 문장 내용보다 시드 재현성이 더 중요해.',
  '툴바에서 설정 바꾸면 URL에 반영되니까 테스트 환경 공유하기 편해.',
  '리셋 후에 롱 태스크 측정이 훨씬 이해하기 수월해졌어.',
  '가상화 모드에서는 데이터가 늘어도 DOM 수가 일정하게 유지돼야 해.',
  '오늘 PR 리뷰 부탁해도 될까? 스크롤 관련 버그 수정했어.',
  '페이지 사이즈 150이면 실제 서비스 환경이랑 비슷한 조건이야.',
  '답장 기능 추가하고 나서 메시지 높이 계산이 좀 복잡해졌어.',
  '첫 번째 아이템 인덱스 조정 방식이 핵심인 것 같아.',
  '스크롤 맨 위로 올리면 이전 페이지 로드되는 거 확인했어?',
  '실시간 메시지 시뮬레이션 켜두고 테스트해봐.',
  '낙관적 UI 처리 덕분에 전송 응답이 훨씬 빠르게 느껴지더라.',
]

function buildText(random: () => number) {
  const sentenceCount = randomInt(random, 1, 4)
  return Array.from({ length: sentenceCount }, () => pickOne(random, LOREM_POOL)).join(' ')
}

function buildImageSpec(index: number, random: () => number) {
  const width = randomInt(random, 320, 720)
  const height = randomInt(random, 220, 540)
  return {
    imageWidth: width,
    imageHeight: height,
    imageUrl: `https://picsum.photos/seed/chat-virtualization-${index}/${width}/${height}`
  }
}

function nextDayTimestamp(currentTimestamp: number, random: () => number) {
  const nextDay = new Date(currentTimestamp)
  nextDay.setUTCDate(nextDay.getUTCDate() + 1)
  nextDay.setUTCHours(randomInt(random, 8, 10), randomInt(random, 0, 59), 0, 0)
  return nextDay.getTime()
}

function buildReplyPreview(source: DemoMessage) {
  const previewText =
    source.text?.slice(0, 80) ??
    (source.kind === 'image' ? '이미지를 공유했습니다' : '이전 메시지를 인용했습니다')

  return {
    authorName: source.authorName,
    text: previewText
  }
}

export function generateMessages({
  count,
  imageRatio,
  replyRatio,
  seed
}: GenerateMessagesOptions): DemoMessage[] {
  const random = mulberry32(seed)
  const normalizedImageRatio = Math.max(0, Math.min(1, imageRatio))
  const normalizedReplyRatio = Math.max(0, Math.min(0.5, replyRatio))
  const startTimestamp = Date.UTC(2025, 0, 1, 9, 0, 0)
  const messages: DemoMessage[] = []
  let timestamp = startTimestamp

  for (let index = 0; index < count; index += 1) {
    const author: DemoAuthor = random() > 0.5 ? 'me' : 'other'
    const shouldReply = index > 0 && random() < normalizedReplyRatio
    const kind: DemoMessageKind = shouldReply
      ? 'reply'
      : random() < normalizedImageRatio
        ? 'image'
        : 'text'
    const authorName = pickOne(random, AUTHORS[author])
    const source =
      shouldReply && index > 0 ? messages[randomInt(random, 0, index - 1)] : undefined
    const imageSpec = kind === 'image' ? buildImageSpec(index, random) : undefined

    messages.push({
      id: `msg-${seed}-${index}`,
      author,
      kind,
      text: kind === 'image' ? undefined : buildText(random),
      imageUrl: imageSpec?.imageUrl,
      imageWidth: imageSpec?.imageWidth,
      imageHeight: imageSpec?.imageHeight,
      timestamp,
      authorName,
      replyTo: source ? buildReplyPreview(source) : undefined,
      status: 'sent'
    })

    const shouldAdvanceDay = random() < DAY_BOUNDARY_RATIO
    timestamp = shouldAdvanceDay
      ? nextDayTimestamp(timestamp, random)
      : timestamp + randomInt(random, 20_000, 180_000)
  }

  return messages
}
