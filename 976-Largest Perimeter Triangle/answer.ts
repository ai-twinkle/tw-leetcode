function largestPerimeter(nums: number[]): number {
  // Early exit: fewer than 3 sides cannot form a triangle
  const totalLengthCount = nums.length;
  if (totalLengthCount < 3) {
    return 0;
  }

  // Copy values into a typed array for numeric storage and fast sort
  const sides = new Uint32Array(totalLengthCount);
  for (let i = 0; i < totalLengthCount; i++) {
    sides[i] = nums[i] >>> 0; // Keep within unsigned 32-bit
  }

  // Sort ascending using native numeric sort (no comparator overhead)
  sides.sort();

  // Scan from the largest side downward; first valid triple is the max perimeter
  for (let i = totalLengthCount - 1; i >= 2; i--) {
    const lengthC = sides[i];       // Largest in current triple
    const lengthB = sides[i - 1];
    const lengthA = sides[i - 2];

    if (lengthA + lengthB > lengthC) {
      return lengthA + lengthB + lengthC; // Return perimeter immediately
    }
  }

  // No valid triangle found
  return 0;
}
