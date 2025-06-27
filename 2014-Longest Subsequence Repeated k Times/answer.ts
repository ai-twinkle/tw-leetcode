function longestSubsequenceRepeatedK(s: string, k: number): string {
  const stringLength = s.length;
  const asciiCodeOfA = 'a'.charCodeAt(0);
  const alphabetSize = 26;

  // 1. Encode s into 0–25 with a Uint8Array
  const encodedCharacters = new Uint8Array(stringLength);
  for (let i = 0; i < stringLength; i++) {
    encodedCharacters[i] = s.charCodeAt(i) - asciiCodeOfA;
  }

  // 2. Count occurrences and collect valid characters (count ≥ k), in 'z'->'a' order
  const characterCounts = new Uint16Array(alphabetSize);
  for (let i = 0; i < stringLength; i++) {
    characterCounts[encodedCharacters[i]]++;
  }
  const validCharacterCodes: number[] = [];
  for (let code = alphabetSize - 1; code >= 0; code--) {
    if (characterCounts[code] >= k) {
      validCharacterCodes.push(code);
    }
  }
  if (validCharacterCodes.length === 0) {
    return "";
  }

  // 3. Build flattened next-position table and precompute row-base offsets
  const totalRows = stringLength + 1;
  const nextPositionTable = new Uint16Array(totalRows * alphabetSize);
  const rowOffset = new Uint32Array(totalRows);
  for (let row = 0; row < totalRows; row++) {
    rowOffset[row] = row * alphabetSize;
  }
  // Last row: all point to sentinel = stringLength
  for (let c = 0; c < alphabetSize; c++) {
    nextPositionTable[rowOffset[stringLength] + c] = stringLength;
  }
  // Fill backwards
  for (let pos = stringLength - 1; pos >= 0; pos--) {
    const destBase = rowOffset[pos];
    const srcBase  = rowOffset[pos + 1];
    // Copy entire row
    for (let c = 0; c < alphabetSize; c++) {
      nextPositionTable[destBase + c] = nextPositionTable[srcBase + c];
    }
    // Override current character
    nextPositionTable[destBase + encodedCharacters[pos]] = pos;
  }

  // 4. Prepare for DFS backtracking
  const maxPossibleLength = Math.floor(stringLength / k);
  const prefixSequence = new Uint8Array(maxPossibleLength);
  let answer = "";

  // Try lengths from maxPossibleLength down to 1
  for (let targetLength = maxPossibleLength; targetLength > 0; targetLength--) {
    // Depth-first search with early exit
    const dfs = (depth: number): boolean => {
      if (depth === targetLength) {
        // Build answer once
        const chars = new Array<string>(targetLength);
        for (let i = 0; i < targetLength; i++) {
          chars[i] = String.fromCharCode(prefixSequence[i] + asciiCodeOfA);
        }
        answer = chars.join("");
        return true;
      }
      // Try each valid character in lex-largest order
      for (const code of validCharacterCodes) {
        prefixSequence[depth] = code;
        // Check if prefixSequence[0..depth] * k is subsequence
        let scanPosition = 0;
        let ok = true;
        for (let repetition = 0; repetition < k && ok; repetition++) {
          // For each character in current prefix
          for (let i = 0; i <= depth; i++) {
            const nextIdx = nextPositionTable[rowOffset[scanPosition] + prefixSequence[i]];
            if (nextIdx === stringLength) {
              ok = false;
              break;
            }
            scanPosition = nextIdx + 1;
          }
        }
        if (ok && dfs(depth + 1)) {
          return true;
        }
      }
      return false;
    };

    if (dfs(0)) {
      break;
    }
  }

  return answer;
}
