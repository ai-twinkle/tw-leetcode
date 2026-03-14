function myAtoi(s: string): number {
  const length = s.length
  const maxInt = 2147483647
  const minInt = -2147483648
  const overflowThreshold = 214748364
  let index = 0
  let sign = 1
  let value = 0

  // Skip leading whitespaces
  while (index < length && s.charCodeAt(index) === 32) {
    index++
  }

  // Handle optional sign
  if (index < length) {
    const firstCharacterCode = s.charCodeAt(index)

    if (firstCharacterCode === 45) {
      sign = -1
      index++
    } else if (firstCharacterCode === 43) {
      index++
    }
  }

  // Build number directly and clamp during parsing
  while (index < length) {
    const currentCharacterCode = s.charCodeAt(index)
    const digit = currentCharacterCode - 48

    if (digit < 0 || digit > 9) {
      break
    }

    // Clamp before multiplication to avoid unnecessary work
    if (value > overflowThreshold || (value === overflowThreshold && digit > (sign === 1 ? 7 : 8))) {
      return sign === 1 ? maxInt : minInt
    }

    value = value * 10 + digit
    index++
  }

  return value * sign
}
