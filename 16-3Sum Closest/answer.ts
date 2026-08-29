/** Smallest value allowed by the constraints, used to shift values into bucket indices. */
const VALUE_OFFSET = 1000;

/** Number of distinct values allowed by the constraints: -1000 .. 1000 inclusive. */
const VALUE_RANGE = 2001;

/**
 * Finds the sum of three integers at distinct indices whose total is closest to the target.
 *
 * @param nums - Input array with a length of at least three, each value within [-1000, 1000].
 * @param target - Target sum within [-10^4, 10^4].
 * @returns The sum of the three chosen integers that is closest to the target.
 */
function threeSumClosest(nums: number[], target: number): number {
  const length = nums.length;

  // Values are bounded, so counting sort orders the input in O(n + range) with no comparator calls.
  const bucketCounts = new Uint16Array(VALUE_RANGE);
  for (let index = 0; index < length; index += 1) {
    bucketCounts[nums[index] + VALUE_OFFSET] += 1;
  }

  // Int16Array holds every possible value and keeps the scan inside a compact, unboxed buffer.
  const sorted = new Int16Array(length);
  let writeCursor = 0;
  for (let bucket = 0; bucket < VALUE_RANGE; bucket += 1) {
    let remaining = bucketCounts[bucket];
    const value = bucket - VALUE_OFFSET;
    while (remaining > 0) {
      sorted[writeCursor] = value;
      writeCursor += 1;
      remaining -= 1;
    }
  }

  let bestSum = sorted[0] + sorted[1] + sorted[2];
  let bestDistance = bestSum > target ? bestSum - target : target - bestSum;
  if (bestDistance === 0) {
    return bestSum;
  }

  const lastIndex = length - 1;
  for (let first = 0; first < length - 2; first += 1) {
    // A repeated leading value scans a subset of the previous window, so it can never improve.
    if (first > 0 && sorted[first] === sorted[first - 1]) {
      continue;
    }

    const firstValue = sorted[first];

    // Smallest sum reachable from here; if it already overshoots, every later row overshoots more.
    const minimumSum = firstValue + sorted[first + 1] + sorted[first + 2];
    if (minimumSum > target) {
      if (minimumSum - target < bestDistance) {
        bestSum = minimumSum;
      }
      break;
    }

    // Largest sum reachable from here; if it undershoots, it is the best this row can offer.
    const maximumSum = firstValue + sorted[lastIndex - 1] + sorted[lastIndex];
    if (maximumSum < target) {
      if (target - maximumSum < bestDistance) {
        bestSum = maximumSum;
        bestDistance = target - maximumSum;
      }
      continue;
    }

    // Comparing the pair against a residual removes one addition from the inner loop.
    const residual = target - firstValue;
    let low = first + 1;
    let high = lastIndex;
    while (low < high) {
      const pairSum = sorted[low] + sorted[high];
      if (pairSum === residual) {
        return target;
      }

      const distance = pairSum > residual ? pairSum - residual : residual - pairSum;
      if (distance < bestDistance) {
        bestDistance = distance;
        bestSum = firstValue + pairSum;
      }

      if (pairSum > residual) {
        high -= 1;
      } else {
        low += 1;
      }
    }
  }

  return bestSum;
}
