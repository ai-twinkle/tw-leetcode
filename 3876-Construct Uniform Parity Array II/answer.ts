function uniformArray(nums1: number[]): boolean {
  const length = nums1.length;

  // Sentinel sits above the 10^9 value limit, so an absent parity is detectable by identity.
  const ABSENT = 0x7fffffff;
  let smallestOdd = ABSENT;
  let smallestEven = ABSENT;

  for (let index = 0; index < length; index += 1) {
    const value = nums1[index];

    if ((value & 1) === 1) {
      if (value < smallestOdd) {
        smallestOdd = value;
        // 1 is the global minimum possible, so no even value can undercut it.
        if (value === 1) {
          return true;
        }
      }
    } else {
      if (value < smallestEven) {
        smallestEven = value;
      }
    }
  }

  // All even: every element keeps itself. All odd: same. Both are trivially uniform.
  if (smallestOdd === ABSENT || smallestEven === ABSENT) {
    return true;
  }

  // Mixed parities: each even element must find a strictly smaller odd element to subtract.
  return smallestOdd < smallestEven;
}
