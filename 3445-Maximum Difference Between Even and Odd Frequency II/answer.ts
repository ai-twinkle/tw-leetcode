function maxDifference(s: string, k: number): number {
  const n = s.length;

  // 1. Decode string s into digits (0-4) for faster access.
  const digits = new Uint8Array(n);
  for (let i = 0; i < n; i++) {
    digits[i] = s.charCodeAt(i) - 48;
  }

  // 2. Build prefix sum arrays for each digit ('0'..'4'), so we can query freq quickly.
  const prefixFreq: Uint16Array[] = new Array(5);
  for (let d = 0; d < 5; d++) {
    const arr = new Uint16Array(n + 1);
    let count = 0;
    for (let i = 0; i < n; i++) {
      if (digits[i] === d) {
        count++;
      }
      arr[i + 1] = count;
    }
    prefixFreq[d] = arr;
  }

  let maxDiff = Number.NEGATIVE_INFINITY;
  const INF = 0x3f3f3f3f; // Large sentinel value

  // 3. Try all ordered pairs (oddChar, evenChar)
  for (let oddChar = 0; oddChar < 5; oddChar++) {
    const prefixOdd = prefixFreq[oddChar];
    for (let evenChar = 0; evenChar < 5; evenChar++) {
      if (evenChar === oddChar) {
        continue;
      }

      const prefixEven = prefixFreq[evenChar];
      const totalEven = prefixEven[n];
      if (totalEven < 2) {
        continue; // Need at least two to have even count
      }

      // Prepare 4 parity buckets: [00, 01, 10, 11]
      const bucketSize = totalEven + 1;
      const minDiffAtCount: Int32Array[] = new Array(4);
      for (let i = 0; i < 4; i++) {
        const arr = new Int32Array(bucketSize);
        arr.fill(INF);
        minDiffAtCount[i] = arr;
      }

      // Tracks the minimal value seen so far for each parity pattern
      const minBucket = [INF, INF, INF, INF];
      let prevThreshold = -1;

      // Slide end index j from k..n (substring at least size k)
      for (let end = k; end <= n; end++) {
        // Calculate frequencies at substring start (start = end - k)
        const start = end - k;
        const freqOddStart = prefixOdd[start];
        const freqEvenStart = prefixEven[start];
        const startParity = ((freqOddStart & 1) << 1) | (freqEvenStart & 1);
        const diffAtStart = freqOddStart - freqEvenStart;

        // Record minimal diff at this parity and even-count
        const currBucket = minDiffAtCount[startParity];
        if (diffAtStart < currBucket[freqEvenStart]) {
          currBucket[freqEvenStart] = diffAtStart;
        }

        // If count is within prevThreshold, update minBucket immediately
        if (freqEvenStart <= prevThreshold && diffAtStart < minBucket[startParity]) {
          minBucket[startParity] = diffAtStart;
        }

        // Compute evenChar count up to `end`
        const freqEvenEnd = prefixEven[end];
        // Only consider substrings where evenChar appears at least twice (even)
        const currThreshold = freqEvenEnd - 2;

        // Whenever threshold increases, update minBucket for all new entries
        if (currThreshold > prevThreshold) {
          for (let x = prevThreshold + 1; x <= currThreshold; x++) {
            if (x < 0 || x >= bucketSize) {
              continue;
            }

            for (let p = 0; p < 4; p++) {
              const val = minDiffAtCount[p][x];
              if (val < minBucket[p]) {
                minBucket[p] = val;
              }
            }
          }
          prevThreshold = currThreshold;
        }

        // If less than 2 evenChars, skip (cannot form even frequency)
        if (currThreshold < 0) {
          continue;
        }

        // Get frequencies at the end of the substring
        const freqOddEnd = prefixOdd[end];
        const diffAtEnd = freqOddEnd - freqEvenEnd;
        // We need the start to have the *opposite* parity for oddChar
        const neededParity = (((freqOddEnd & 1) ^ 1) << 1) | (freqEvenEnd & 1);
        const bestStart = minBucket[neededParity];

        if (bestStart === INF) {
          continue;
        }

        const candidateDiff = diffAtEnd - bestStart;
        if (candidateDiff > maxDiff) {
          maxDiff = candidateDiff; // Update the best answer so far
        }
      }
    }
  }

  return maxDiff;
}
