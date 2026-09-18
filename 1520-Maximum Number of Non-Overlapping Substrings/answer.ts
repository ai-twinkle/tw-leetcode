function maxNumOfSubstrings(s: string): string[] {
  const length = s.length;
  const letterCodes = new Uint8Array(length);
  const firstIndex = new Int32Array(26).fill(-1);
  const lastIndex = new Int32Array(26);

  // Single pass: cache letter codes and record first/last occurrence of each letter
  for (let index = 0; index < length; index++) {
    const code = s.charCodeAt(index) - 97;
    letterCodes[index] = code;
    if (firstIndex[code] === -1) {
      firstIndex[code] = index;
    }
    lastIndex[code] = index;
  }

  // At most 26 candidate intervals, stored in typed arrays
  const chosenStarts = new Int32Array(26);
  const chosenEnds = new Int32Array(26);
  let chosenCount = 0;
  let previousEnd = -1;

  for (let start = 0; start < length; start++) {
    const code = letterCodes[start];

    // Only the first occurrence of a letter can start a valid interval
    if (firstIndex[code] !== start) {
      continue;
    }

    let end = lastIndex[code];
    let isValid = true;

    // Expand the interval to cover every letter inside it; invalid if a letter starts earlier
    for (let scan = start + 1; scan <= end; scan++) {
      const innerCode = letterCodes[scan];
      if (firstIndex[innerCode] < start) {
        isValid = false;
        break;
      }
      if (lastIndex[innerCode] > end) {
        end = lastIndex[innerCode];
      }
    }

    if (!isValid) {
      continue;
    }

    if (start > previousEnd) {
      // Disjoint from the previous choice: take it as a new substring
      chosenStarts[chosenCount] = start;
      chosenEnds[chosenCount] = end;
      chosenCount++;
    } else {
      // Nested inside the previous choice: the smaller interval replaces it
      chosenStarts[chosenCount - 1] = start;
      chosenEnds[chosenCount - 1] = end;
    }
    previousEnd = end;
  }

  // Build substrings only once, at the end
  const result: string[] = new Array(chosenCount);
  for (let index = 0; index < chosenCount; index++) {
    result[index] = s.substring(chosenStarts[index], chosenEnds[index] + 1);
  }
  return result;
}
