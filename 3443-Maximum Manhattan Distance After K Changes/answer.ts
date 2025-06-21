function maxDistance(s: string, k: number): number {
  const length = s.length;

  // Pre-decode all direction chars into a Uint16Array of char-codes
  const directionCodes = new Uint16Array(length);
  for (let i = 0; i < length; ++i) {
    directionCodes[i] = s.charCodeAt(i);
  }

  let currentLatitude = 0;
  let currentLongitude = 0;
  let maxDistanceSoFar = 0;
  // k*2 is the extra Manhattan you can “buy” with k changes
  const twoTimesK = k << 1; // Bit-shift is marginally faster than *2

  for (let stepIndex = 0; stepIndex < length; ++stepIndex) {
    const code = directionCodes[stepIndex];

    // One-chain of increments/decrements
    if (code === 78) {
      // Code for 'N'
      ++currentLatitude;
    } else if (code === 83) {
      // Code for 'S'
      --currentLatitude;
    } else if (code === 69) {
      // Code for 'E'
      ++currentLongitude;
    } else {
      // Code for 'W'
      --currentLongitude;
    }

    // Inline abs
    const absoluteLatitude = currentLatitude < 0 ? -currentLatitude : currentLatitude;
    const absoluteLongitude = currentLongitude < 0 ? -currentLongitude : currentLongitude;

    // Potential if you spend all k changes right now
    const potentialDistance = absoluteLatitude + absoluteLongitude + twoTimesK;
    // But you can never exceed moves so far (stepIndex + 1)
    const reachableDistance = potentialDistance < stepIndex + 1
      ? potentialDistance
      : stepIndex + 1;

    // Track the global max
    maxDistanceSoFar = maxDistanceSoFar > reachableDistance
      ? maxDistanceSoFar
      : reachableDistance;
  }

  return maxDistanceSoFar;
}
