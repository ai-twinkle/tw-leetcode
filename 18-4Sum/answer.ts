function fourSum(nums: number[], target: number): number[][] {
  const length = nums.length;
  const result: number[][] = [];

  // Fewer than four numbers can never form a quadruplet
  if (length < 4) {
    return result;
  }

  // Float64Array sorts numerically in native code, much faster than a comparator sort
  const sorted = Float64Array.from(nums);
  sorted.sort();

  const lastIndex = length - 1;

  for (let firstIndex = 0; firstIndex < length - 3; firstIndex++) {
    const firstValue = sorted[firstIndex];

    // Skip duplicate first values to keep quadruplets unique
    if (firstIndex > 0 && firstValue === sorted[firstIndex - 1]) {
      continue;
    }

    // Smallest possible sum already exceeds target, so no later first value can work
    if (firstValue + sorted[firstIndex + 1] + sorted[firstIndex + 2] + sorted[firstIndex + 3] > target) {
      break;
    }

    // Largest possible sum with this first value is still too small, so try a larger first value
    if (firstValue + sorted[lastIndex] + sorted[lastIndex - 1] + sorted[lastIndex - 2] < target) {
      continue;
    }

    for (let secondIndex = firstIndex + 1; secondIndex < length - 2; secondIndex++) {
      const secondValue = sorted[secondIndex];

      // Skip duplicate second values within the same first value
      if (secondIndex > firstIndex + 1 && secondValue === sorted[secondIndex - 1]) {
        continue;
      }

      const pairSum = firstValue + secondValue;

      // Smallest remaining sum too large, so no larger second value can work
      if (pairSum + sorted[secondIndex + 1] + sorted[secondIndex + 2] > target) {
        break;
      }

      // Largest remaining sum too small, so try a larger second value
      if (pairSum + sorted[lastIndex] + sorted[lastIndex - 1] < target) {
        continue;
      }

      // Remaining amount the two-pointer pair must reach
      const remainingTarget = target - pairSum;
      let leftIndex = secondIndex + 1;
      let rightIndex = lastIndex;

      while (leftIndex < rightIndex) {
        const leftValue = sorted[leftIndex];
        const rightValue = sorted[rightIndex];
        const currentSum = leftValue + rightValue;

        if (currentSum < remainingTarget) {
          leftIndex++;
        } else if (currentSum > remainingTarget) {
          rightIndex--;
        } else {
          result.push([firstValue, secondValue, leftValue, rightValue]);

          // Move both pointers past duplicates of the matched values
          leftIndex++;
          while (leftIndex < rightIndex && sorted[leftIndex] === leftValue) {
            leftIndex++;
          }
          rightIndex--;
          while (leftIndex < rightIndex && sorted[rightIndex] === rightValue) {
            rightIndex--;
          }
        }
      }
    }
  }

  return result;
}
