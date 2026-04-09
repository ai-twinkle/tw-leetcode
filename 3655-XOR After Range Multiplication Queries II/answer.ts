const MODULAR_MOD_NUMBER = 1_000_000_007;
const MAX_QUERY_VALUE = 100_001;

/**
 * Computes (a * b) % MODULAR_MOD_NUMBER via 15-bit splitting.
 * Used only during module-level inverse table construction.
 * @param a First operand, must be < MODULAR_MOD_NUMBER
 * @param b Second operand, must be < MODULAR_MOD_NUMBER
 * @return (a * b) % MODULAR_MOD_NUMBER
 */
function buildTimeMulMod(a: number, b: number): number {
  const bLow = b & 0x7FFF;
  const bHigh = (b - bLow) >>> 15;
  // Each partial product stays below 2^45 < 2^53 — exact in float64
  return ((a * bHigh % MODULAR_MOD_NUMBER) * 32768 + a * bLow) % MODULAR_MOD_NUMBER;
}

// Precompute modular inverses for all v in [1, MAX_QUERY_VALUE) via linear recurrence:
// inv[i] = -(floor(MOD / i)) * inv[MOD % i]  (mod MOD)
// Replaces the O(log MOD) modPow call on every small-stride close boundary with O(1) lookup
const precomputedModularInverse = new Int32Array(MAX_QUERY_VALUE);
precomputedModularInverse[1] = 1;
for (let inverseIndex = 2; inverseIndex < MAX_QUERY_VALUE; inverseIndex++) {
  precomputedModularInverse[inverseIndex] =
    MODULAR_MOD_NUMBER - buildTimeMulMod(
      Math.floor(MODULAR_MOD_NUMBER / inverseIndex),
      precomputedModularInverse[MODULAR_MOD_NUMBER % inverseIndex]
    );
}

function xorAfterQueries(nums: number[], queries: number[][]): number {
  const numCount = nums.length;
  const MODULUS = 1_000_000_007n;
  // Square-root block boundary: strides below this use lazy event arrays
  const blockSize = (Math.sqrt(numCount) | 0) + 1;

  // Working array storing each element as BigInt for native 64-bit modular arithmetic
  const currentValues = new BigInt64Array(numCount);
  for (let position = 0; position < numCount; position++) {
    currentValues[position] = BigInt(nums[position]);
  }

  // Lazily allocated per-stride event marker arrays; null means no query used this stride
  const stepEventArrays: (Float64Array | null)[] = new Array(blockSize).fill(null);

  for (const [leftBound, rightBound, stepSize, multiplierValue] of queries) {
    const multiplierBig = BigInt(multiplierValue);

    if (stepSize >= blockSize) {
      // Large stride: at most O(n/k) affected positions, update values directly
      for (let position = leftBound; position <= rightBound; position += stepSize) {
        currentValues[position] = currentValues[position] * multiplierBig % MODULUS;
      }
      continue;
    }

    // Allocate event array on first use for this stride
    if (!stepEventArrays[stepSize]) {
      stepEventArrays[stepSize] = new Float64Array(numCount + 1).fill(1.0);
    }
    const eventArray = stepEventArrays[stepSize]!;

    // Open the multiplicative range at leftBound
    eventArray[leftBound] = Number(BigInt(eventArray[leftBound]) * multiplierBig % MODULUS);

    // Close position is always rightBound + stepSize - remainder, covering both cases:
    // remainder === 0 gives rightBound + stepSize; remainder > 0 subtracts the overshoot
    const closePosition = rightBound + stepSize - (rightBound - leftBound) % stepSize;
    if (closePosition <= numCount) {
      // O(1) table lookup replaces the O(log MOD) modPow call from the base code
      const inverseMultiplierBig = BigInt(precomputedModularInverse[multiplierValue]);
      eventArray[closePosition] = Number(BigInt(eventArray[closePosition]) * inverseMultiplierBig % MODULUS);
    }
  }

  // Propagate each stride's event markers into currentValues via per-lane running products
  for (let stepSize = 1; stepSize < blockSize; stepSize++) {
    const eventArray = stepEventArrays[stepSize];
    if (!eventArray) {
      continue;
    }

    // Each residue class modulo stepSize forms an independent lane
    for (let laneStart = 0; laneStart < stepSize && laneStart < numCount; laneStart++) {
      let runningMultiplier = 1n;
      for (let position = laneStart; position < numCount; position += stepSize) {
        if (eventArray[position] !== 1.0) {
          // Fold event marker into the running product for this lane
          runningMultiplier = runningMultiplier * BigInt(eventArray[position]) % MODULUS;
        }
        if (runningMultiplier !== 1n) {
          currentValues[position] = currentValues[position] * runningMultiplier % MODULUS;
        }
      }
    }
  }

  // XOR all final values; each fits within a safe integer after reduction
  let xorResult = 0;
  for (let position = 0; position < numCount; position++) {
    xorResult ^= Number(currentValues[position]);
  }
  return xorResult;
}
