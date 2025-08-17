// Reusable scratch buffer to reduce allocations across calls.
// Grows monotonically; never shrinks, so repeated queries stay fast.
let SHARED_PROBABILITY_BUFFER: Float64Array | null = null;

function acquireProbabilityBuffer(requiredLength: number): Float64Array {
  if (SHARED_PROBABILITY_BUFFER === null || SHARED_PROBABILITY_BUFFER.length < requiredLength) {
    SHARED_PROBABILITY_BUFFER = new Float64Array(requiredLength);
  }
  return SHARED_PROBABILITY_BUFFER;
}

function new21Game(n: number, k: number, maxPts: number): number {
  // Fast exits:
  // If Alice never draws (k === 0) or even the worst case cannot exceed n, prob = 1.
  const upperBoundCertain = k - 1 + maxPts;
  if (k === 0 || n >= upperBoundCertain) {
    return 1.0;
  }

  // dp[i] = probability the total points end at exactly i.
  // We only need dp values to maintain a size-maxPts sliding window.
  const probabilityArray = acquireProbabilityBuffer(n + 1);
  probabilityArray.fill(0, 0, n + 1);

  probabilityArray[0] = 1.0;

  let probabilityWindowSum = 1.0;        // Sum of last maxPts dp's that can transition to current i
  const inverseMaxPoints = 1.0 / maxPts; // Avoid division inside the loop
  let result = 0.0;                      // Sum of dp[i] for i in [k, n]

  for (let points = 1; points <= n; points++) {
    // Probability to land exactly at "points"
    const probabilityAtPoints = probabilityWindowSum * inverseMaxPoints;
    probabilityArray[points] = probabilityAtPoints;

    // If we have not stopped yet (points < k), this contributes to future transitions;
    // else, we've reached a terminal total and add to the answer.
    if (points < k) {
      probabilityWindowSum += probabilityAtPoints;
    } else {
      result += probabilityAtPoints;
    }

    // Slide the window: remove the value that falls out of range [points-maxPts+1 .. points]
    const expiredIndex = points - maxPts;
    if (expiredIndex >= 0) {
      probabilityWindowSum -= probabilityArray[expiredIndex];
    }
  }

  return result;
}
