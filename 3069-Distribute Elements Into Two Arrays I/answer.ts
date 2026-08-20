function resultArray(nums: number[]): number[] {
  const length = nums.length;
  const result: number[] = new Array(length);

  // Operation 1 and 2 are fixed by the problem statement.
  let lastOfFirst = nums[0];
  let lastOfSecond = nums[1];
  let firstEnd = 1;
  let secondStart = length - 1;
  result[0] = lastOfFirst;
  result[secondStart] = lastOfSecond;

  for (let index = 2; index < length; index++) {
    const value = nums[index];

    // Only the two tail values decide the destination, so no array reads are required.
    if (lastOfFirst > lastOfSecond) {
      result[firstEnd] = value;
      firstEnd++;
      lastOfFirst = value;
    } else {
      secondStart--;
      result[secondStart] = value;
      lastOfSecond = value;
    }
  }

  // The arr2 region was written back-to-front, so reverse that region in place.
  let left = secondStart;
  let right = length - 1;
  while (left < right) {
    const temporary = result[left];
    result[left] = result[right];
    result[right] = temporary;
    left++;
    right--;
  }

  return result;
}
