function maxValue(nums: number[]): number[] {
  const arrayLength = nums.length;

  // Trivial single-element case
  if (arrayLength === 1) {
    return [nums[0]];
  }

  // Prefix maximum: prefixMaximum[i] = max(nums[0..i])
  const prefixMaximum = new Int32Array(arrayLength);
  prefixMaximum[0] = nums[0];
  for (let i = 1; i < arrayLength; i++) {
    const previousMaximum = prefixMaximum[i - 1];
    const currentValue = nums[i];
    prefixMaximum[i] = previousMaximum > currentValue ? previousMaximum : currentValue;
  }

  // Suffix minimum: suffixMinimum[i] = min(nums[i..n-1])
  const suffixMinimum = new Int32Array(arrayLength);
  suffixMinimum[arrayLength - 1] = nums[arrayLength - 1];
  for (let i = arrayLength - 2; i >= 0; i--) {
    const nextMinimum = suffixMinimum[i + 1];
    const currentValue = nums[i];
    suffixMinimum[i] = nextMinimum < currentValue ? nextMinimum : currentValue;
  }

  // Walk left to right, closing each component the moment its right boundary is detected
  const answer = new Array<number>(arrayLength);
  let componentStart = 0;
  for (let i = 0; i < arrayLength; i++) {
    // Position i ends a component when no edge can cross the cut between i and i+1
    const isLastIndex = i === arrayLength - 1;
    const isComponentEnd = isLastIndex || prefixMaximum[i] <= suffixMinimum[i + 1];
    if (isComponentEnd) {
      // The component's maximum equals the prefix max at its right end
      const componentMaximum = prefixMaximum[i];
      for (let fillIndex = componentStart; fillIndex <= i; fillIndex++) {
        answer[fillIndex] = componentMaximum;
      }
      componentStart = i + 1;
    }
  }

  return answer;
}
