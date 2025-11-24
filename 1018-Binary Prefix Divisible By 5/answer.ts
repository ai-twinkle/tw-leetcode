function prefixesDivBy5(nums: number[]): boolean[] {
  const length = nums.length;
  const result: boolean[] = new Array(length);

  // Keep track of the current prefix value modulo 5
  let prefixModulo = 0;

  for (let index = 0; index < length; index++) {
    const currentBit = nums[index];

    // Update prefix: multiply by 2 using bit shift and add current bit
    prefixModulo = (prefixModulo << 1) + currentBit;

    // Keep the prefixModulo in [0, 4] without using costly modulo operator
    if (prefixModulo >= 5) {
      prefixModulo -= 5;
    }

    // Record whether current prefix value is divisible by 5
    result[index] = prefixModulo === 0;
  }

  return result;
}
