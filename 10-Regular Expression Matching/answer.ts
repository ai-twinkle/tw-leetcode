// Character code constants pre-computed at module load for O(1) comparison
const DOT_CODE = 46;
const STAR_CODE = 42;

// Reusable scratch buffers sized for the maximum constraint
// Storing outside the function avoids per-call allocation overhead
const MAX_LENGTH = 32;
const tokenCharCodes = new Uint8Array(MAX_LENGTH);
const tokenIsStar = new Uint8Array(MAX_LENGTH);
// Memo entries: 0 = unvisited, 1 = false, 2 = true
const memoTable = new Uint8Array((MAX_LENGTH + 1) * (MAX_LENGTH + 1));
const stringCodes = new Uint8Array(MAX_LENGTH);

// Module-level state for recursion (avoids passing many parameters)
let currentTokenCount = 0;
let currentStringLength = 0;
let memoStride = 0;

/**
 * Recursive matcher with memoization on (stringIndex, tokenIndex) state.
 * @param stringIndex - current position in the input string
 * @param tokenIndex - current position in the compressed token stream
 * @return true if the remaining string matches the remaining tokens
 */
function matchHelper(stringIndex: number, tokenIndex: number): boolean {
  // Pattern exhausted: success only when string is also fully consumed
  if (tokenIndex === currentTokenCount) {
    return stringIndex === currentStringLength;
  }

  const memoOffset = stringIndex * memoStride + tokenIndex;
  const cached = memoTable[memoOffset];
  if (cached !== 0) {
    return cached === 2;
  }

  const tokenCode = tokenCharCodes[tokenIndex];
  const firstMatch = (stringIndex < currentStringLength) &&
    (tokenCode === DOT_CODE || tokenCode === stringCodes[stringIndex]);

  let result: boolean;
  if (tokenIsStar[tokenIndex] === 1) {
    // Either skip the starred token (zero occurrences) or consume one matching char
    result = matchHelper(stringIndex, tokenIndex + 1) ||
      (firstMatch && matchHelper(stringIndex + 1, tokenIndex));
  } else {
    result = firstMatch && matchHelper(stringIndex + 1, tokenIndex + 1);
  }

  memoTable[memoOffset] = result ? 2 : 1;
  return result;
}

/**
 * Determines whether the input string fully matches the given regex pattern.
 * Supports '.' (any single character) and '*' (zero or more of preceding element).
 * @param s - input string of lowercase English letters
 * @param p - pattern string containing lowercase letters, '.', and '*'
 * @return true if the pattern matches the entire string, false otherwise
 */
function isMatch(s: string, p: string): boolean {
  const stringLength = s.length;
  const patternLength = p.length;

  // Compress pattern into tokens, simultaneously tracking whether any star exists
  let tokenCount = 0;
  let patternIndex = 0;
  let hasStar = false;
  while (patternIndex < patternLength) {
    const code = p.charCodeAt(patternIndex);
    const nextIndex = patternIndex + 1;
    if (nextIndex < patternLength && p.charCodeAt(nextIndex) === STAR_CODE) {
      tokenCharCodes[tokenCount] = code;
      tokenIsStar[tokenCount] = 1;
      patternIndex += 2;
      hasStar = true;
    } else {
      tokenCharCodes[tokenCount] = code;
      tokenIsStar[tokenCount] = 0;
      patternIndex += 1;
    }
    tokenCount++;
  }

  // Fast path: no '*' anywhere means each pattern char must match exactly one string char
  // This avoids both memo allocation traffic and recursion entirely
  if (!hasStar) {
    if (tokenCount !== stringLength) {
      return false;
    }
    for (let index = 0; index < stringLength; index++) {
      const tokenCode = tokenCharCodes[index];
      if (tokenCode !== DOT_CODE && tokenCode !== s.charCodeAt(index)) {
        return false;
      }
    }
    return true;
  }

  // Pre-compute string char codes once for fast random access during recursion
  for (let index = 0; index < stringLength; index++) {
    stringCodes[index] = s.charCodeAt(index);
  }

  // Reset only the cells we will potentially visit
  const stride = tokenCount + 1;
  const totalCells = (stringLength + 1) * stride;
  for (let index = 0; index < totalCells; index++) {
    memoTable[index] = 0;
  }

  currentTokenCount = tokenCount;
  currentStringLength = stringLength;
  memoStride = stride;

  return matchHelper(0, 0);
}
