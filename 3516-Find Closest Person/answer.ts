function findClosest(x: number, y: number, z: number): number {
  const distancePerson1ToTarget = Math.abs(x - z);
  const distancePerson2ToTarget = Math.abs(y - z);

  if (distancePerson1ToTarget === distancePerson2ToTarget) {
    return 0;
  }
  return distancePerson1ToTarget < distancePerson2ToTarget ? 1 : 2;
}
