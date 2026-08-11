/** Largest magnitude allowed by the constraints, used to reject impossible partners early. */
const VALUE_LIMIT = 100000;

/**
 * Locates a value inside an ascending, duplicate-free typed array.
 * @param values Ascending distinct values.
 * @param length Number of valid entries at the front of the array.
 * @param wanted Value to look for.
 * @returns True when the value is present.
 */
function containsValue(values: Int32Array, length: number, wanted: number): boolean {
  let low = 0;
  let high = length - 1;

  while (low <= high) {
    const middle = (low + high) >> 1;
    const current = values[middle];

    if (current === wanted) {
      return true;
    }

    if (current < wanted) {
      low = middle + 1;
    }
    else {
      high = middle - 1;
    }
  }

  return false;
}

/**
 * Collects every distinct triplet summing to zero.
 * @param nums Input values, each within the +/-10^5 constraint.
 * @returns Every unique triplet whose three members add up to zero.
 */
function threeSum(nums: number[]): number[][] {
  const length = nums.length;
  const result: number[][] = [];

  if (length < 3) {
    return result;
  }

  // Int32Array.sort runs a native numeric sort, removing the per-comparison JS callback.
  const sortedValues = new Int32Array(nums);
  sortedValues.sort();

  // Compress the sorted data into distinct values plus their multiplicities.
  const uniqueValues = new Int32Array(length);
  const valueCounts = new Int32Array(length);
  let uniqueCount = 0;
  let previousValue = sortedValues[0];
  let repeatCount = 1;

  for (let index = 1; index < length; index += 1) {
    const currentValue = sortedValues[index];

    if (currentValue === previousValue) {
      repeatCount += 1;
      continue;
    }

    uniqueValues[uniqueCount] = previousValue;
    valueCounts[uniqueCount] = repeatCount;
    uniqueCount += 1;
    previousValue = currentValue;
    repeatCount = 1;
  }

  uniqueValues[uniqueCount] = previousValue;
  valueCounts[uniqueCount] = repeatCount;
  uniqueCount += 1;

  // All-positive or all-negative data can never reach zero.
  if (uniqueValues[0] > 0 || uniqueValues[uniqueCount - 1] < 0) {
    return result;
  }

  // Pass 1: triplets that reuse the same value twice, driven by the multiplicity table.
  for (let index = 0; index < uniqueCount; index += 1) {
    const availableCopies = valueCounts[index];

    if (availableCopies < 2) {
      continue;
    }

    const value = uniqueValues[index];

    if (value === 0) {
      if (availableCopies >= 3) {
        result.push([0, 0, 0]);
      }
      continue;
    }

    // Two copies of value need exactly -2 * value to close the triplet.
    const partnerValue = -2 * value;

    if (partnerValue < -VALUE_LIMIT || partnerValue > VALUE_LIMIT) {
      continue;
    }

    if (!containsValue(uniqueValues, uniqueCount, partnerValue)) {
      continue;
    }

    if (value < 0) {
      result.push([value, value, partnerValue]);
    }
    else {
      result.push([partnerValue, value, value]);
    }
  }

  // Pass 2: triplets of three different values, so no duplicate-skipping loop is needed.
  const lastIndex = uniqueCount - 1;
  let rightStart = lastIndex;

  for (let index = 0; index + 2 < uniqueCount; index += 1) {
    const firstValue = uniqueValues[index];

    // Smallest reachable sum already exceeds zero, and it only grows from here.
    if (firstValue + uniqueValues[index + 1] + uniqueValues[index + 2] > 0) {
      break;
    }

    // Largest reachable sum is still negative for this anchor.
    if (firstValue + uniqueValues[lastIndex - 1] + uniqueValues[lastIndex] < 0) {
      continue;
    }

    const pairTarget = -firstValue;
    const smallestPartner = uniqueValues[index + 1];

    // The useful upper bound only moves left as the anchor grows, so amortize it across iterations.
    while (rightStart > index + 1 && smallestPartner + uniqueValues[rightStart] > pairTarget) {
      rightStart -= 1;
    }

    if (rightStart <= index + 1) {
      continue;
    }

    let left = index + 1;
    let right = rightStart;

    while (left < right) {
      const pairSum = uniqueValues[left] + uniqueValues[right];

      if (pairSum < pairTarget) {
        left += 1;
      }
      else if (pairSum > pairTarget) {
        right -= 1;
      }
      else {
        result.push([firstValue, uniqueValues[left], uniqueValues[right]]);
        left += 1;
        right -= 1;
      }
    }
  }

  return result;
}
