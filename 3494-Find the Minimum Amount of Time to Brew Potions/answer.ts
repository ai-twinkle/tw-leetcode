function minTime(skill: number[], mana: number[]): number {
  // Guard tiny inputs early
  const wizardCount = skill.length;
  const potionCount = mana.length;

  if (wizardCount === 0 || potionCount === 0) {
    return 0;
  }

  // Create tight typed views once per call (no cross-call caching).
  const skillView = new Int32Array(wizardCount);
  let totalSkillSum = 0;

  for (let i = 0; i < wizardCount; i++) {
    const value = skill[i];
    skillView[i] = value;
    totalSkillSum += value;
  }

  const manaView = new Int32Array(potionCount);
  for (let j = 0; j < potionCount; j++) {
    manaView[j] = mana[j];
  }

  // Accumulated best value across potion transitions
  let accumulatedBest = 0;

  // Process potions in order; last potion adds mana_last * sum(skill)
  for (let j = 1; j < potionCount; j++) {
    const manaPrevious = manaView[j - 1];
    const manaCurrent = manaView[j];

    // Precompute delta used across the inner loop
    const delta = manaPrevious - manaCurrent;

    // Track max candidate for this transition
    let bestForThisTransition = Number.NEGATIVE_INFINITY;

    // Running prefix sum of skill[0..i-1]
    let runningPrefix = 0;

    // Tight inner loop: stream prefix, avoid extra arrays/branches
    for (let i = 0; i < wizardCount; i++) {
      const candidate =
        accumulatedBest + runningPrefix * delta + manaPrevious * skillView[i];

      if (candidate > bestForThisTransition) {
        bestForThisTransition = candidate;
      }

      // Update prefix for next wizard
      runningPrefix += skillView[i];
    }

    // Commit the best transition
    accumulatedBest = bestForThisTransition;
  }

  // Add the final pass through all wizards for the last potion
  return accumulatedBest + manaView[potionCount - 1] * totalSkillSum;
}
