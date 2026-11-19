function minimizeSum(nums: number[]): number {
  const length = nums.length;

  let smallest1 = Infinity;
  let smallest2 = Infinity;
  let smallest3 = Infinity;
  let largest1 = -Infinity;
  let largest2 = -Infinity;
  let largest3 = -Infinity;

  // Single pass to collect the three smallest and three largest values
  for (let index = 0; index < length; index++) {
    const value = nums[index];

    // Maintain ascending chain of the three smallest values
    if (value < smallest3) {
      if (value < smallest2) {
        smallest3 = smallest2;
        if (value < smallest1) {
          smallest2 = smallest1;
          smallest1 = value;
        } else {
          smallest2 = value;
        }
      } else {
        smallest3 = value;
      }
    }

    // Maintain descending chain of the three largest values
    if (value > largest3) {
      if (value > largest2) {
        largest3 = largest2;
        if (value > largest1) {
          largest2 = largest1;
          largest1 = value;
        } else {
          largest2 = value;
        }
      } else {
        largest3 = value;
      }
    }
  }

  // Low score becomes 0 by duplicating; minimize range by removing two extremes
  const dropTwoSmallest = largest1 - smallest3;
  const dropTwoLargest = largest3 - smallest1;
  const dropOneEach = largest2 - smallest2;

  let best = dropTwoSmallest < dropTwoLargest ? dropTwoSmallest : dropTwoLargest;
  if (dropOneEach < best) {
    best = dropOneEach;
  }

  return best;
}
