function checkOverlap(
  radius: number,
  xCenter: number,
  yCenter: number,
  x1: number,
  y1: number,
  x2: number,
  y2: number
): boolean {
  // Horizontal gap from the center to the rectangle (zero when the center is within [x1, x2])
  let deltaX = 0;
  if (xCenter < x1) {
    deltaX = x1 - xCenter;
  } else if (xCenter > x2) {
    deltaX = xCenter - x2;
  }

  // Early exit: the rectangle is out of reach horizontally
  if (deltaX > radius) {
    return false;
  }

  // Vertical gap from the center to the rectangle (zero when the center is within [y1, y2])
  let deltaY = 0;
  if (yCenter < y1) {
    deltaY = y1 - yCenter;
  } else if (yCenter > y2) {
    deltaY = yCenter - y2;
  }

  // Early exit: the rectangle is out of reach vertically
  if (deltaY > radius) {
    return false;
  }

  // Compare squared distances to avoid Math.sqrt; the maximum is about 8 * 10^8, which is exact in doubles
  return deltaX * deltaX + deltaY * deltaY <= radius * radius;
}
