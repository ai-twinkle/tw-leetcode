function largestAltitude(gain: number[]): number {
  // The trip starts at point 0 with altitude 0, the initial highest candidate
  let highestAltitude = 0;
  let currentAltitude = 0;
  const pointCount = gain.length;

  // Single pass builds the running prefix sum while tracking its maximum
  for (let index = 0; index < pointCount; index++) {
    currentAltitude += gain[index];

    // Record a new peak only when the current point rises above the best seen
    if (currentAltitude > highestAltitude) {
      highestAltitude = currentAltitude;
    }
  }

  return highestAltitude;
}
