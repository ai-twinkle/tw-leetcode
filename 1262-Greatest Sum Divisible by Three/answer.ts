function maxSumDivThree(nums: number[]): number {
  const length = nums.length;

  // Running total sum of all elements
  let totalSum = 0;

  // Track two smallest numbers with remainder 1 when divided by 3
  let minRemainderOneFirst = Number.MAX_SAFE_INTEGER;
  let minRemainderOneSecond = Number.MAX_SAFE_INTEGER;

  // Track two smallest numbers with remainder 2 when divided by 3
  let minRemainderTwoFirst = Number.MAX_SAFE_INTEGER;
  let minRemainderTwoSecond = Number.MAX_SAFE_INTEGER;

  // Single pass: accumulate sum and update candidates for minimal removal
  for (let index = 0; index < length; index++) {
    const currentNumber = nums[index];

    // Add current number to total sum
    totalSum += currentNumber;

    const currentRemainder = currentNumber % 3;

    if (currentRemainder === 1) {
      // Maintain first and second-smallest numbers with remainder 1
      if (currentNumber < minRemainderOneFirst) {
        minRemainderOneSecond = minRemainderOneFirst;
        minRemainderOneFirst = currentNumber;
      } else if (currentNumber < minRemainderOneSecond) {
        minRemainderOneSecond = currentNumber;
      }
    } else if (currentRemainder === 2) {
      // Maintain first and second-smallest numbers with remainder 2
      if (currentNumber < minRemainderTwoFirst) {
        minRemainderTwoSecond = minRemainderTwoFirst;
        minRemainderTwoFirst = currentNumber;
      } else if (currentNumber < minRemainderTwoSecond) {
        minRemainderTwoSecond = currentNumber;
      }
    }
  }

  // If already divisible by 3, we keep the full sum
  const remainder = totalSum % 3;
  if (remainder === 0) {
    return totalSum;
  }

  // Compute the minimal amount to subtract to make the sum divisible by 3
  let minimumToSubtract = Number.MAX_SAFE_INTEGER;

  if (remainder === 1) {
    // Option 1: remove one smallest remainder-1 number
    if (minRemainderOneFirst !== Number.MAX_SAFE_INTEGER) {
      minimumToSubtract = minRemainderOneFirst;
    }

    // Option 2: remove two smallest remainder-2 numbers
    if (minRemainderTwoSecond !== Number.MAX_SAFE_INTEGER) {
      const removeTwoRemainderTwo =
        minRemainderTwoFirst + minRemainderTwoSecond;

      if (removeTwoRemainderTwo < minimumToSubtract) {
        minimumToSubtract = removeTwoRemainderTwo;
      }
    }
  } else {
    // remainder === 2

    // Option 1: remove one smallest remainder-2 number
    if (minRemainderTwoFirst !== Number.MAX_SAFE_INTEGER) {
      minimumToSubtract = minRemainderTwoFirst;
    }

    // Option 2: remove two smallest remainder-1 numbers
    if (minRemainderOneSecond !== Number.MAX_SAFE_INTEGER) {
      const removeTwoRemainderOne =
        minRemainderOneFirst + minRemainderOneSecond;

      if (removeTwoRemainderOne < minimumToSubtract) {
        minimumToSubtract = removeTwoRemainderOne;
      }
    }
  }

  // Fallback: if no valid removal strategy exists, result is zero
  if (minimumToSubtract === Number.MAX_SAFE_INTEGER) {
    return 0;
  }

  // Return the adjusted maximum sum divisible by 3
  return totalSum - minimumToSubtract;
}
