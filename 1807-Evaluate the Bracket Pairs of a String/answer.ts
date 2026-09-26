const OPEN_BRACKET_CODE = 40;
const CLOSE_BRACKET_CODE = 41;
const LETTER_BASE = 27;
const LETTER_OFFSET = 96;
const FIRST_LETTER_CODE = 97;
const HASH_MULTIPLIER = 31;
const HASH_MIXER = 2246822519;
const QUESTION_MARK = '?';
const MINIMUM_TABLE_CAPACITY = 16;

/**
 * Replaces every bracket pair in `s` with the value of the key it contains,
 * or with "?" when the key is unknown.
 *
 * @param s - Source string containing non-nested bracket pairs.
 * @param knowledge - Pairs of [key, value] with unique lowercase keys.
 * @returns The evaluated string.
 */
function evaluate(s: string, knowledge: string[][]): string {
  const sourceLength = s.length;

  // A bracket pair costs at least 3 characters, so this bounds the pair count.
  const maximumPairCount = ((sourceLength / 3) | 0) + 1;

  let tableCapacity = MINIMUM_TABLE_CAPACITY;
  while (tableCapacity < maximumPairCount * 2) {
    tableCapacity *= 2;
  }
  const tableMask = tableCapacity - 1;

  // Open-addressed table holding only the keys that `s` actually asks about.
  const slotKeys = new Float64Array(tableCapacity);
  const slotValueIndex = new Int32Array(tableCapacity);
  const pairSlots = new Int32Array(maximumPairCount);
  const pairStarts = new Int32Array(maximumPairCount);
  const pairEnds = new Int32Array(maximumPairCount);

  let keyLengthMask = 0;
  let firstLetterMask = 0;
  let pairCount = 0;

  // Pass 1: record each bracket pair and register the key it demands.
  for (let index = 0; index < sourceLength; index += 1) {
    if (s.charCodeAt(index) !== OPEN_BRACKET_CODE) {
      continue;
    }

    let scanIndex = index + 1;
    let encodedKey = 0;
    let rawHash = 0;
    let charCode = s.charCodeAt(scanIndex);
    const firstCharCode = charCode;

    // Digits are 1..26 so base-27 packing is injective and fits in 2^53.
    while (charCode !== CLOSE_BRACKET_CODE) {
      encodedKey = encodedKey * LETTER_BASE + (charCode - LETTER_OFFSET);
      rawHash = (Math.imul(rawHash, HASH_MULTIPLIER) + charCode) | 0;
      scanIndex += 1;
      charCode = s.charCodeAt(scanIndex);
    }

    // Cheap rejection filters for the knowledge sweep below.
    keyLengthMask |= 1 << (scanIndex - index - 1);
    firstLetterMask |= 1 << (firstCharCode - FIRST_LETTER_CODE);

    const mixedHash = Math.imul(rawHash ^ (rawHash >>> 15), HASH_MIXER);
    let slot = ((mixedHash ^ (mixedHash >>> 13)) >>> 0) & tableMask;

    while (slotKeys[slot] !== 0 && slotKeys[slot] !== encodedKey) {
      slot = (slot + 1) & tableMask;
    }
    slotKeys[slot] = encodedKey;

    pairSlots[pairCount] = slot;
    pairStarts[pairCount] = index;
    pairEnds[pairCount] = scanIndex;
    pairCount += 1;
    index = scanIndex;
  }

  // No bracket pair means the answer is the input itself.
  if (pairCount === 0) {
    return s;
  }

  // Pass 2: sweep knowledge, skipping entries that cannot possibly be needed.
  const knowledgeCount = knowledge.length;
  for (let index = 0; index < knowledgeCount; index += 1) {
    const entry = knowledge[index];
    const key = entry[0];
    const keyLength = key.length;

    if (((keyLengthMask >>> keyLength) & 1) === 0) {
      continue;
    }

    const firstCharCode = key.charCodeAt(0);
    if (((firstLetterMask >>> (firstCharCode - FIRST_LETTER_CODE)) & 1) === 0) {
      continue;
    }

    let encodedKey = 0;
    let rawHash = 0;
    for (let charIndex = 0; charIndex < keyLength; charIndex += 1) {
      const charCode = key.charCodeAt(charIndex);
      encodedKey = encodedKey * LETTER_BASE + (charCode - LETTER_OFFSET);
      rawHash = (Math.imul(rawHash, HASH_MULTIPLIER) + charCode) | 0;
    }

    const mixedHash = Math.imul(rawHash ^ (rawHash >>> 15), HASH_MIXER);
    let slot = ((mixedHash ^ (mixedHash >>> 13)) >>> 0) & tableMask;

    while (slotKeys[slot] !== 0 && slotKeys[slot] !== encodedKey) {
      slot = (slot + 1) & tableMask;
    }

    // Store the row index only; the value string is fetched on demand.
    if (slotKeys[slot] === encodedKey) {
      slotValueIndex[slot] = index + 1;
    }
  }

  // Pass 3: stitch literal runs and resolved values, no re-scanning of keys.
  const outputParts: string[] = [];
  let literalStart = 0;

  for (let pairIndex = 0; pairIndex < pairCount; pairIndex += 1) {
    const pairStart = pairStarts[pairIndex];

    if (pairStart > literalStart) {
      outputParts.push(s.slice(literalStart, pairStart));
    }

    const valueIndex = slotValueIndex[pairSlots[pairIndex]];
    if (valueIndex === 0) {
      outputParts.push(QUESTION_MARK);
    } else {
      outputParts.push(knowledge[valueIndex - 1][1]);
    }

    literalStart = pairEnds[pairIndex] + 1;
  }

  if (literalStart < sourceLength) {
    outputParts.push(s.slice(literalStart));
  }

  return outputParts.join('');
}
