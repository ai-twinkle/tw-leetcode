function minimumChanges(s: string, k: number): number {
  const stringLength = s.length;
  const width = stringLength + 1;
  const maxLength = stringLength - 2 * (k - 1);
  const tableSize = width * (maxLength + 1);

  // Read character codes once into a typed array
  const codes = new Uint8Array(stringLength);
  for (let index = 0; index < stringLength; index++) {
    codes[index] = s.charCodeAt(index);
  }

  // diagonal[offset * width + position] = mismatches of s[i] vs s[i + offset] for all i < position
  const diagonal = new Uint8Array(tableSize);
  for (let offset = 1; offset < maxLength; offset++) {
    const row = offset * width;
    const lastPosition = stringLength - offset;
    let running = 0;
    for (let position = 0; position < lastPosition; position++) {
      if (codes[position] !== codes[position + offset]) {
        running++;
      }
      diagonal[row + position + 1] = running;
    }
  }

  // costByLength[length * width + left] = min changes making s[left, left + length) a semi-palindrome
  const costByLength = new Uint8Array(tableSize).fill(255);
  // inner[length * width + left] = changes for the current divisor only, reused by the next longer length
  const inner = new Uint8Array(tableSize);
  for (let divisor = 1; divisor * 2 <= maxLength; divisor++) {
    for (let length = divisor * 2; length <= maxLength; length += divisor) {
      const lastLeft = stringLength - length;
      const row = length * width;
      // Outer block pair compares s[left + i] with s[left + length - divisor + i]
      const diagonalRow = (length - divisor) * width;

      if (length >= divisor * 4) {
        // Add the already-solved inner part s[left + divisor, right - divisor)
        const innerRow = (length - divisor * 2) * width + divisor;
        for (let left = 0; left <= lastLeft; left++) {
          const changes = diagonal[diagonalRow + left + divisor] - diagonal[diagonalRow + left] + inner[innerRow + left];
          inner[row + left] = changes;
          if (changes < costByLength[row + left]) {
            costByLength[row + left] = changes;
          }
        }
      } else {
        for (let left = 0; left <= lastLeft; left++) {
          const changes = diagonal[diagonalRow + left + divisor] - diagonal[diagonalRow + left];
          inner[row + left] = changes;
          if (changes < costByLength[row + left]) {
            costByLength[row + left] = changes;
          }
        }
      }
    }
  }

  if (k === 1) {
    return costByLength[stringLength * width];
  }

  // Transpose into end-major rows so the DP scans start positions contiguously
  const costByEnd = new Uint8Array(width * width);
  for (let end = 2; end <= stringLength; end++) {
    const row = end * width;
    const lastStart = end - 2;
    const firstStart = end > maxLength ? end - maxLength : 0;
    for (let start = firstStart; start <= lastStart; start++) {
      costByEnd[row + start] = costByLength[(end - start) * width + start];
    }
  }

  let previous = new Uint8Array(width).fill(255);
  let current = new Uint8Array(width).fill(255);
  const prefixMinimum = new Uint8Array(width);

  // One part: the cost of the whole prefix
  for (let end = 2; end <= maxLength; end++) {
    previous[end] = costByLength[end * width];
  }

  for (let parts = 2; parts <= k; parts++) {
    const limit = stringLength - 2 * (k - parts);
    const firstStart = (parts - 1) * 2;
    // The last layer only needs the full string
    const firstEnd = parts === k ? stringLength : parts * 2;

    // prefixMinimum[start] = smallest previous value up to start, a lower bound for any candidate
    let running = 255;
    for (let start = firstStart; start <= limit - 2; start++) {
      if (previous[start] < running) {
        running = previous[start];
      }
      prefixMinimum[start] = running;
    }

    for (let end = firstEnd; end <= limit; end++) {
      const row = end * width;
      let best = 255;
      // Scan short last segments first; stop once no earlier split can beat the best
      for (let start = end - 2; start >= firstStart; start--) {
        if (prefixMinimum[start] >= best) {
          break;
        }
        const candidate = previous[start] + costByEnd[row + start];
        if (candidate < best) {
          best = candidate;
        }
      }
      current[end] = best;
    }

    const swap = previous;
    previous = current;
    current = swap;
  }

  return previous[stringLength];
}
