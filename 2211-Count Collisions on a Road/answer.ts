function countCollisions(directions: string): number {
  const length = directions.length;

  // Early exit when there is 0 or 1 car, since collisions are impossible
  if (length <= 1) {
    return 0;
  }

  // Precompute char codes for better readability and small runtime benefit
  const codeL = "L".charCodeAt(0);
  const codeR = "R".charCodeAt(0);
  const codeS = "S".charCodeAt(0);

  let totalMovingCars = 0;
  let leadingLeftCount = 0;

  // This flag helps detect the continuous leading block of 'L'
  let isLeadingSegment = true;

  // First pass: count total moving cars and leading 'L' block
  for (let index = 0; index < length; index++) {
    const directionCode = directions.charCodeAt(index);

    // Count every moving car ('L' or 'R')
    if (directionCode !== codeS) {
      totalMovingCars++;
    }

    // Count only continuous 'L' from the very beginning
    if (isLeadingSegment) {
      if (directionCode === codeL) {
        leadingLeftCount++;
      } else {
        // Once we see any non-'L' at the front, the leading block ends
        isLeadingSegment = false;
      }
    }
  }

  // Second pass: count trailing continuous 'R' block
  let trailingRightCount = 0;
  for (let index = length - 1; index >= 0; index--) {
    const directionCode = directions.charCodeAt(index);

    if (directionCode === codeR) {
      trailingRightCount++;
    } else {
      // As soon as we see a non-'R' from the right, trailing block ends
      break;
    }
  }

  // Cars that never collide:
  // - Continuous 'L' from the left edge (nothing to their left)
  // - Continuous 'R' from the right edge (nothing to their right)
  // Every other moving car must eventually collide.
  return totalMovingCars - leadingLeftCount - trailingRightCount;
}
