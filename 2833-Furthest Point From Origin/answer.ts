function furthestDistanceFromOrigin(moves: string): number {
  let rightCount = 0;
  let leftCount = 0;
  let wildcardCount = 0;

  const length = moves.length;

  // Single pass to tally each character type
  for (let index = 0; index < length; index++) {
    const character = moves.charCodeAt(index);
    if (character === 82) {
      // 'R'
      rightCount++;
    } else if (character === 76) {
      // 'L'
      leftCount++;
    } else {
      wildcardCount++;
    }
  }

  // Wildcards always add to the dominant direction
  const difference = rightCount - leftCount;
  return (difference < 0 ? -difference : difference) + wildcardCount;
}
