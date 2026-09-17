/**
 * Finds two non-overlapping sub-arrays each summing to target with minimum total length.
 * @param arr - Array of positive integers.
 * @param target - Required sum of each sub-array.
 * @returns The minimum sum of the two lengths, or -1 if impossible.
 */
function minSumOfLengths(arr: number[], target: number): number {
  const length = arr.length;
  // Any value above length means "not found"; two disjoint windows can never exceed length in total
  const unreachable = length + 1;

  // shortestUpTo[index] = shortest valid sub-array lying entirely within arr[0..index]
  const shortestUpTo = new Int32Array(length);

  let runningShortest = unreachable;
  let answer = unreachable;
  let left = 0;
  let windowSum = 0;

  for (let right = 0; right < length; right++) {
    windowSum += arr[right];

    // All elements are positive, so shrinking from the left is the only way to reduce the sum
    while (windowSum > target) {
      windowSum -= arr[left];
      left++;
    }

    if (windowSum === target) {
      const windowLength = right - left + 1;

      // Pair this window with the best window that ends strictly before it starts
      if (left > 0) {
        const candidate = windowLength + shortestUpTo[left - 1];
        if (candidate < answer) {
          answer = candidate;
        }
      }

      if (windowLength < runningShortest) {
        runningShortest = windowLength;
      }
    }

    shortestUpTo[right] = runningShortest;
  }

  return answer > length ? -1 : answer;
}
