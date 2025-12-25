function maximumHappinessSum(happiness: number[], k: number): number {
  const childCount = happiness.length;
  const selectionCount = k;

  // Use a TypedArray to leverage fast native numeric sort (ascending).
  const happinessValues = new Int32Array(happiness);
  happinessValues.sort();

  let happinessSum = 0;

  for (let turnIndex = 0; turnIndex < selectionCount; turnIndex++) {
    const selectedIndex = childCount - 1 - turnIndex;
    const effectiveHappiness = happinessValues[selectedIndex] - turnIndex;

    if (effectiveHappiness <= 0) {
      break;
    }

    happinessSum += effectiveHappiness;
  }

  return happinessSum;
}
