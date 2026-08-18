function largestInteger(nums: number[], k: number): number {
  const length = nums.length;

  // Exactly one window exists, so every present value is covered by that single window.
  if (k === length) {
    let maximum = nums[0];
    for (let index = 1; index < length; index++) {
      if (nums[index] > maximum) {
        maximum = nums[index];
      }
    }
    return maximum;
  }

  // Windows of size 1: each index is its own window, so a value qualifies iff it occurs once.
  if (k === 1) {
    // Values are bounded by 50, so a fixed-size byte table replaces any hash structure.
    const occurrences = new Uint8Array(51);
    for (let index = 0; index < length; index++) {
      occurrences[nums[index]]++;
    }
    // Walk values downward and stop at the first unique one.
    for (let value = 50; value >= 0; value--) {
      if (occurrences[value] === 1) {
        return value;
      }
    }
    return -1;
  }

  // For 1 < k < length only the two border positions belong to a single window,
  // so the only possible answers are the first and the last element.
  const firstValue = nums[0];
  const lastValue = nums[length - 1];
  let firstCount = 0;
  let lastCount = 0;
  for (let index = 0; index < length; index++) {
    const current = nums[index];
    if (current === firstValue) {
      firstCount++;
    }
    if (current === lastValue) {
      lastCount++;
    }
  }

  // A border value is valid only when it never reappears anywhere else in the array.
  let answer = -1;
  if (firstCount === 1) {
    answer = firstValue;
  }
  if (lastCount === 1 && lastValue > answer) {
    answer = lastValue;
  }
  return answer;
}
