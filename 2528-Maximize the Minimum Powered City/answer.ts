function maxPower(stations: number[], r: number, k: number): number {
  const cityCount = stations.length;

  if (cityCount === 0) {
    return 0;
  }

  // Step 1: precompute current power for every city via sliding window
  const currentPower = new Float64Array(cityCount); // Current power for each city

  // Initialize window covering [0, rightLimit] for city 0
  let rightLimit = r;
  if (rightLimit > cityCount - 1) {
    rightLimit = cityCount - 1;
  }

  let windowSum = 0;
  for (let index = 0; index <= rightLimit; index++) {
    windowSum += stations[index];
  }
  currentPower[0] = windowSum; // base window sum for city 0

  // Slide window: for city i, window is [i - r, i + r] within bounds
  for (let city = 1; city < cityCount; city++) {
    const leftOutIndex = city - r - 1;
    if (leftOutIndex >= 0) {
      windowSum -= stations[leftOutIndex];
    }
    const rightInIndex = city + r;
    if (rightInIndex < cityCount) {
      windowSum += stations[rightInIndex];
    }
    currentPower[city] = windowSum;
  }

  // Step 2: compute tight binary search bounds
  // Lower bound: current minimum power; Upper bound: average cap after using all additions.
  let minCurrentPower = currentPower[0];
  let totalCurrentPower = currentPower[0];
  for (let city = 1; city < cityCount; city++) {
    const value = currentPower[city];
    if (value < minCurrentPower) {
      minCurrentPower = value;
    }
    totalCurrentPower += value;
  }

  const coverageSpan = 2 * r + 1; // max number of cities covered by one new station
  let lowBound = Math.floor(minCurrentPower); // conservative floor
  if (lowBound < 0) {
    lowBound = 0;
  }
  let highBound = Math.floor((totalCurrentPower + k * coverageSpan) / cityCount); // average-cap upper bound

  // Step 3: greedy feasibility check with reusable difference buffer
  // extraDiff length cityCount+1 allows scheduling a "stop effect" at endIndex+1 safely.
  const extraDiff = new Float64Array(cityCount + 1);

  /**
   * Check if we can make all cities have power >= target using at most k new stations.
   *
   * Greedy rule: when city i is short, "place" stations effectively at position min(cityCount-1, i + r)
   * so they cover i and push benefit forward. Implement with rolling extra power + difference array.
   *
   * @param target - desired minimum power for every city
   * @returns true if feasible, otherwise false
   */
  function canReach(target: number): boolean {
    // Reset difference buffer (typed-array fill is fast)
    extraDiff.fill(0);

    let remainingStations = k;   // Number of stations we can still allocate
    let rollingExtra = 0;        // Accumulated active extra power at current index

    for (let city = 0; city < cityCount; city++) {
      // Apply deferred "stop effects" that end at this city
      rollingExtra += extraDiff[city];

      // Current available power at this city
      const availablePower = currentPower[city] + rollingExtra;

      // If short, add the exact amount needed here
      if (availablePower < target) {
        const requiredAdditions = target - availablePower;

        if (requiredAdditions > remainingStations) {
          return false; // Not enough budget to fix this city
        }

        // Consume budget immediately
        remainingStations -= requiredAdditions;

        // These additions start helping from this city onward
        rollingExtra += requiredAdditions;

        // Their effect ends after coverageSpan cities (i + 2r), clamp to array end
        let endIndexPlusOne = city + coverageSpan;
        if (endIndexPlusOne > cityCount) {
          endIndexPlusOne = cityCount;
        }
        extraDiff[endIndexPlusOne] -= requiredAdditions; // Schedule stop effect
      }
    }

    return true; // All cities met the target
  }

  // Step 4: binary search to maximize the feasible minimum power
  let bestAnswer = lowBound;
  while (lowBound <= highBound) {
    const middle = lowBound + ((highBound - lowBound) >> 1); // Middle without overflow

    // Important: single O(n) feasibility pass
    if (canReach(middle)) {
      bestAnswer = middle;     // Record feasible value
      lowBound = middle + 1;   // Try to raise the bar
    } else {
      highBound = middle - 1;  // Lower the bar
    }
  }

  return bestAnswer;
}
