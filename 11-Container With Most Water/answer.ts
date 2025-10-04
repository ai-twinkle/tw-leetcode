function maxArea(height: number[]): number {
  const elementCount = height.length;

  // Early exit for degenerate inputs
  if (elementCount <= 1) {
    return 0;
  }

  let leftIndex = 0;
  let rightIndex = elementCount - 1;
  let maximumArea = 0;

  // Two-pointer sweep
  while (leftIndex < rightIndex) {
    // Read once per side to avoid repeated property access
    const leftHeight = height[leftIndex];
    const rightHeight = height[rightIndex];

    // Compute area using conditional min without Math.min
    const width = rightIndex - leftIndex;
    const limitingHeight = leftHeight < rightHeight ? leftHeight : rightHeight;
    const currentArea = limitingHeight * width;

    // Update maximum area without Math.max
    if (currentArea > maximumArea) {
      maximumArea = currentArea;
    }

    // Move the pointer on the shorter side
    if (leftHeight < rightHeight) {
      leftIndex++;
    } else {
      rightIndex--;
    }
  }

  return maximumArea;
}
