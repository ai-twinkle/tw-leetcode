function minNumberOperations(target: number[]): number {
  // Handle empty input array (defensive guard, though constraint ensures ≥1)
  const length = target.length;
  if (length === 0) {
    return 0;
  }

  // Initialize total operations with the first element (base cost)
  let totalOperations = target[0];

  // Store previous value to track rises in subsequent elements
  let previousValue = target[0];

  // Traverse array once to accumulate positive rises only
  for (let index = 1; index < length; index += 1) {
    const currentValue = target[index];

    // When the value increases, add the difference to total operations
    if (currentValue > previousValue) {
      totalOperations += (currentValue - previousValue);
    }

    // Update previous value for the next comparison
    previousValue = currentValue;
  }

  // Return total operations as the final minimum count
  return totalOperations;
}
