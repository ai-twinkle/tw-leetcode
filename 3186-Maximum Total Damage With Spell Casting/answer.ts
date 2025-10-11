function maximumTotalDamage(power: number[]): number {
  if (power.length === 0) {
    return 0;
  }

  // Sort spell damages in ascending order
  const sortedPower = new Int32Array(power.length);
  for (let index = 0; index < power.length; index += 1) {
    sortedPower[index] = power[index];
  }
  sortedPower.sort();

  // Compress equal damages into unique values and their total contribution
  const values = new Int32Array(power.length);
  const weights = new Float64Array(power.length);
  let uniqueCount = 0;
  let index = 0;

  while (index < sortedPower.length) {
    const currentValue = sortedPower[index];
    let totalDamage = 0;

    // Accumulate total damage for this damage value
    while (index < sortedPower.length && sortedPower[index] === currentValue) {
      totalDamage += currentValue;
      index += 1;
    }

    values[uniqueCount] = currentValue;
    weights[uniqueCount] = totalDamage;
    uniqueCount += 1;
  }

  const uniqueValues = values.subarray(0, uniqueCount);
  const totalWeights = weights.subarray(0, uniqueCount);

  // Dynamic Programming to compute maximum total damage
  const dp = new Float64Array(uniqueCount);
  dp[0] = totalWeights[0];
  let lastCompatibleIndex = -1;

  for (let i = 1; i < uniqueCount; i += 1) {
    // Move pointer to find the last value compatible with the current one (difference ≥ 3)
    const requiredMaxValue = uniqueValues[i] - 3;
    while (
      lastCompatibleIndex + 1 < i &&
      uniqueValues[lastCompatibleIndex + 1] <= requiredMaxValue
      ) {
      lastCompatibleIndex += 1;
    }

    // Option 1: skip current damage value
    const skipCurrent = dp[i - 1];

    // Option 2: take the current value and add the best previous compatible total
    let takeCurrent = totalWeights[i];
    if (lastCompatibleIndex >= 0) {
      takeCurrent += dp[lastCompatibleIndex];
    }

    // Choose the maximum of the two options
    dp[i] = skipCurrent >= takeCurrent ? skipCurrent : takeCurrent;
  }

  // Return the best total damage achievable
  return dp[uniqueCount - 1];
}
