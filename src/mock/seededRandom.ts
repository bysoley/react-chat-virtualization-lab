export function mulberry32(seed: number) {
  let current = seed >>> 0

  return () => {
    current += 0x6d2b79f5
    let value = Math.imul(current ^ (current >>> 15), 1 | current)
    value ^= value + Math.imul(value ^ (value >>> 7), 61 | value)
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296
  }
}

export function randomInt(random: () => number, min: number, max: number) {
  return Math.floor(random() * (max - min + 1)) + min
}

export function pickOne<T>(random: () => number, values: T[]) {
  return values[randomInt(random, 0, values.length - 1)]
}
