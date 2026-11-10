function climbStairs(n: number, costs: number[]): number {
  // Zero start is safe: a virtual step before 0 always costs more than jumping from step 0, and it keeps values in V8's fast integer form
  let costThreeBack = 0;
  let costTwoBack = 0;
  let costOneBack = 0;

  for (let index = 0; index < n; index++) {
    // Jump penalties for distances 1, 2, 3 are 1, 4, 9
    let bestPrevious = costOneBack + 1;
    const viaTwo = costTwoBack + 4;
    if (viaTwo < bestPrevious) {
      bestPrevious = viaTwo;
    }
    const viaThree = costThreeBack + 9;
    if (viaThree < bestPrevious) {
      bestPrevious = viaThree;
    }

    // Shift the window forward and add the landing cost of this step
    costThreeBack = costTwoBack;
    costTwoBack = costOneBack;
    costOneBack = bestPrevious + costs[index];
  }

  return costOneBack;
}
