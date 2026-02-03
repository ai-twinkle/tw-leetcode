function isTrionic(nums: number[]): boolean {
  const length = nums.length;

  // Need room for three non-empty trends with internal split points.
  if (length < 4) {
    return false;
  }

  let index = 1;

  // Consume the first strictly increasing run starting from index 0.
  while (index < length && nums[index] > nums[index - 1]) {
    index++;
  }

  const peakIndex = index - 1;
  if (peakIndex <= 0) {
    return false;
  }
  if (index >= length - 1) {
    return false;
  }

  // Consume the strictly decreasing run starting from peakIndex.
  while (index < length && nums[index] < nums[index - 1]) {
    index++;
  }

  const valleyIndex = index - 1;
  if (valleyIndex <= peakIndex) {
    return false;
  }
  if (index >= length) {
    return false;
  }
  if (valleyIndex >= length - 1) {
    return false;
  }

  // Consume the final strictly increasing run until the end.
  const startFinalIndex = index;
  while (index < length && nums[index] > nums[index - 1]) {
    index++;
  }

  // Important: require at least one increasing step in the last segment and consume the entire array.
  if (startFinalIndex === index) {
    return false;
  }

  return index === length;
}
