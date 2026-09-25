const CHARACTER_CODE_COMMA = 44;
const CHARACTER_CODE_LEFT_BRACE = 123;
const CHARACTER_CODE_RIGHT_BRACE = 125;
const CHARACTER_CODE_LOWERCASE_A = 97;

/**
 * Builds the 26 single character strings once, so the parser never calls
 * String.fromCharCode or charAt while walking the expression.
 * @returns One string per lowercase letter, indexed by (characterCode - 97).
 */
function buildLowercaseLetterTable(): string[] {
  const letterTable: string[] = new Array(26);
  for (let letterIndex = 0; letterIndex < 26; letterIndex += 1) {
    letterTable[letterIndex] = String.fromCharCode(CHARACTER_CODE_LOWERCASE_A + letterIndex);
  }
  return letterTable;
}

/** Pre-computed lookup table giving O(1) access to any lowercase letter string. */
const LOWERCASE_LETTER_TABLE = buildLowercaseLetterTable();

/** Character codes of the expression currently being parsed (constraint: length <= 60). */
let scannedCharacterCodes = new Uint8Array(64);
let scanCursor = 0;
let scanLength = 0;

/**
 * Parses a concatenation: a run of letters and brace groups with no top level comma.
 * @returns The words produced by this concatenation, with no ordering guarantee.
 */
function parseConcatenation(): string[] {
  let accumulatedWords: string[] | null = null;
  let pendingLiteral = "";

  while (scanCursor < scanLength) {
    const characterCode = scannedCharacterCodes[scanCursor];
    if (characterCode === CHARACTER_CODE_COMMA || characterCode === CHARACTER_CODE_RIGHT_BRACE) {
      break;
    }

    // Plain letters are merged into one literal chunk instead of one cross product per letter.
    if (characterCode !== CHARACTER_CODE_LEFT_BRACE) {
      pendingLiteral += LOWERCASE_LETTER_TABLE[characterCode - CHARACTER_CODE_LOWERCASE_A];
      scanCursor += 1;
      continue;
    }

    scanCursor += 1;
    const groupWords = parseUnion();
    scanCursor += 1;
    const groupCount = groupWords.length;

    if (accumulatedWords === null) {
      if (pendingLiteral.length === 0) {
        // Nothing on the left yet, so the group itself becomes the accumulator.
        accumulatedWords = groupWords;
      } else {
        const prefixedWords: string[] = new Array(groupCount);
        for (let groupIndex = 0; groupIndex < groupCount; groupIndex += 1) {
          prefixedWords[groupIndex] = pendingLiteral + groupWords[groupIndex];
        }
        accumulatedWords = prefixedWords;
      }
    } else {
      // Cartesian product written into one exactly sized array, no push and no re-allocation.
      const leftCount = accumulatedWords.length;
      const productWords: string[] = new Array(leftCount * groupCount);
      let writeIndex = 0;
      for (let leftIndex = 0; leftIndex < leftCount; leftIndex += 1) {
        const leftPart = accumulatedWords[leftIndex] + pendingLiteral;
        for (let groupIndex = 0; groupIndex < groupCount; groupIndex += 1) {
          productWords[writeIndex] = leftPart + groupWords[groupIndex];
          writeIndex += 1;
        }
      }
      accumulatedWords = productWords;
    }
    pendingLiteral = "";
  }

  if (accumulatedWords === null) {
    return [pendingLiteral];
  }
  if (pendingLiteral.length === 0) {
    return accumulatedWords;
  }

  // Trailing letters are appended in place: every array here has a single consumer.
  const accumulatedCount = accumulatedWords.length;
  for (let wordIndex = 0; wordIndex < accumulatedCount; wordIndex += 1) {
    accumulatedWords[wordIndex] += pendingLiteral;
  }
  return accumulatedWords;
}

/**
 * Parses a comma separated union of concatenations.
 * @returns The union of the words of every term, de-duplicated when more than one term exists.
 */
function parseUnion(): string[] {
  const firstTermWords = parseConcatenation();
  if (scanCursor >= scanLength || scannedCharacterCodes[scanCursor] !== CHARACTER_CODE_COMMA) {
    return firstTermWords;
  }

  // De-duplicating here keeps every later cross product as small as possible.
  const uniqueWords = new Set<string>(firstTermWords);
  while (scanCursor < scanLength && scannedCharacterCodes[scanCursor] === CHARACTER_CODE_COMMA) {
    scanCursor += 1;
    const termWords = parseConcatenation();
    const termCount = termWords.length;
    for (let termIndex = 0; termIndex < termCount; termIndex += 1) {
      uniqueWords.add(termWords[termIndex]);
    }
  }
  return Array.from(uniqueWords);
}

/**
 * Expands a brace expression into the sorted list of distinct words it represents.
 * @param expression The expression to expand, following the grammar of the problem.
 * @returns The sorted, duplicate free list of represented words.
 */
function braceExpansionII(expression: string): string[] {
  const expressionLength = expression.length;
  if (scannedCharacterCodes.length < expressionLength) {
    scannedCharacterCodes = new Uint8Array(expressionLength);
  }

  // One charCodeAt pass up front turns all later reads into typed array reads.
  for (let characterIndex = 0; characterIndex < expressionLength; characterIndex += 1) {
    scannedCharacterCodes[characterIndex] = expression.charCodeAt(characterIndex);
  }
  scanLength = expressionLength;
  scanCursor = 0;

  const expandedWords = parseUnion();
  if (expandedWords.length < 2) {
    return expandedWords;
  }

  expandedWords.sort();

  // Duplicates are adjacent after sorting, so they are removed in one in place sweep.
  let writeIndex = 1;
  const expandedCount = expandedWords.length;
  for (let readIndex = 1; readIndex < expandedCount; readIndex += 1) {
    if (expandedWords[readIndex] !== expandedWords[writeIndex - 1]) {
      expandedWords[writeIndex] = expandedWords[readIndex];
      writeIndex += 1;
    }
  }
  expandedWords.length = writeIndex;
  return expandedWords;
}
