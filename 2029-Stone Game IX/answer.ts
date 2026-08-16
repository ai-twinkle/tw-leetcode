function stoneGameIX(stones: number[]): boolean {
  const stoneCount = stones.length;

  // Stones with remainder zero only flip the turn, so track parity alone.
  let remainderZeroParity = 0;
  let remainderOneCount = 0;
  let remainderTwoCount = 0;

  for (let index = 0; index < stoneCount; index += 1) {
    const remainder = stones[index] % 3;

    if (remainder === 1) {
      remainderOneCount += 1;
    } else if (remainder === 2) {
      remainderTwoCount += 1;
    } else {
      remainderZeroParity ^= 1;
    }
  }

  // Even count of remainder-zero stones: Alice needs both residue classes.
  if (remainderZeroParity === 0) {
    return remainderOneCount > 0 && remainderTwoCount > 0;
  }

  // Odd count grants Alice an extra tempo, usable only on a large imbalance.
  const residueDifference = remainderOneCount - remainderTwoCount;

  return residueDifference > 2 || residueDifference < -2;
}
