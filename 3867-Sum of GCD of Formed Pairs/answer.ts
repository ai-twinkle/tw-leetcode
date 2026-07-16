function computeGcd(first: number, second: number): number {
  while (second !== 0) {
    const remainder = first % second;
    first = second;
    second = remainder;
  }

  return first;
}

function gcdSum(nums: number[]): number {
  const length = nums.length;

  // Use a typed array for the prefix gcd values to reduce memory overhead.
  const prefixGcd = new Int32Array(length);
  let runningMax = 0;

  // Build prefixGcd; mx_i is monotonic, so track it in a single pass.
  for (let index = 0; index < length; index++) {
    const current = nums[index];

    if (current > runningMax) {
      runningMax = current;
    }

    prefixGcd[index] = computeGcd(current, runningMax);
  }

  // Sort in non-decreasing order in place on the typed array.
  prefixGcd.sort();

  let total = 0;
  let left = 0;
  let right = length - 1;

  // Pair smallest with largest, summing the gcd of each pair.
  while (left < right) {
    total += computeGcd(prefixGcd[right], prefixGcd[left]);
    left++;
    right--;
  }

  return total;
}
