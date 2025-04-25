function countInterestingSubarrays(
  nums: number[],
  modulo: number,
  k: number
): number {
  const n = nums.length;

  // The maximum distinct remainders we'll ever see:
  // - If modulo ≤ n, remainders run [0 .. modulo-1]
  // - Otherwise, counts never wrap and run [0 .. n]
  const maxRemainderValue = modulo <= n ? modulo : n + 1;

  // frequencyOfPrefixRemainder[r] = how many prefixes have remainder r
  const frequencyOfPrefixRemainder = new Uint32Array(maxRemainderValue);
  frequencyOfPrefixRemainder[0] = 1;  // empty prefix has remainder 0

  let cumulativeMatchCount = 0;            // current prefix remainder
  let totalInterestingSubarrays = 0;

  for (let index = 0; index < n; index++) {
    // 1 if this element “matches” (nums[i] % modulo === k), else 0
    const matchIndicator = (nums[index] % modulo === k) ? 1 : 0;

    // update remainder (avoid costly % when possible)
    cumulativeMatchCount += matchIndicator;
    if (cumulativeMatchCount >= modulo) {
      cumulativeMatchCount -= modulo;
    }

    // we need prior prefixes r such that:
    //   (cumulativeMatchCount - r) % modulo === k
    // => r ≡ (cumulativeMatchCount - k) mod modulo
    let neededRemainder = cumulativeMatchCount - k;
    if (neededRemainder < 0) {
      neededRemainder += modulo;
    }

    // only add if neededRemainder is within our array bounds
    if (neededRemainder < frequencyOfPrefixRemainder.length) {
      totalInterestingSubarrays += frequencyOfPrefixRemainder[neededRemainder];
    }

    // record this prefix remainder for future subarrays
    frequencyOfPrefixRemainder[cumulativeMatchCount]++;
  }

  return totalInterestingSubarrays;
}
