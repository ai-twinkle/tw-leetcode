function maxDistance(colors: number[]): number {
  const lastIndex = colors.length - 1;
  const firstColor = colors[0];
  const lastColor = colors[lastIndex];

  // Check from the end backward for a color different from the first house
  let distanceFromStart = 0;
  for (let i = lastIndex; i > 0; i--) {
    if (colors[i] !== firstColor) {
      distanceFromStart = i;
      break;
    }
  }

  // Check from the start forward for a color different from the last house
  let distanceFromEnd = 0;
  for (let i = 0; i < lastIndex; i++) {
    if (colors[i] !== lastColor) {
      distanceFromEnd = lastIndex - i;
      break;
    }
  }

  return distanceFromStart > distanceFromEnd ? distanceFromStart : distanceFromEnd;
}
