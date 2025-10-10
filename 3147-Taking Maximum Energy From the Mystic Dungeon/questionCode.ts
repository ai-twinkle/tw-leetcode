function maximumEnergy(energy: number[], k: number): number {
  const length = energy.length;

  // Use Int32Array for efficient memory and CPU performance
  const accumulatedEnergy = new Int32Array(length);

  // Initialize to the smallest possible integer to handle all-negative cases
  let maximumTotalEnergy = Number.MIN_SAFE_INTEGER;

  // Traverse from right to left to build dynamic relation efficiently
  for (let index = length - 1; index >= 0; index--) {
    let currentTotal = energy[index];

    // Accumulate with the next reachable magician if within range
    if (index + k < length) {
      currentTotal += accumulatedEnergy[index + k];
    }

    // Store computed value in typed array
    accumulatedEnergy[index] = currentTotal;

    // Update maximum if this path yields a better result
    if (currentTotal > maximumTotalEnergy) {
      maximumTotalEnergy = currentTotal;
    }
  }

  return maximumTotalEnergy;
}
