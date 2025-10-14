function minTime(skill: number[], mana: number[]): number {
  const wizardCount = skill.length;
  const potionCount = mana.length;

  // Compute prefix sums of wizard skills: prefixSkill[k] = sum of skill[0..k-1]
  const prefixSkill = new Uint32Array(wizardCount + 1);
  for (let wizardIndex = 0; wizardIndex < wizardCount; wizardIndex++) {
    prefixSkill[wizardIndex + 1] = prefixSkill[wizardIndex] + (skill[wizardIndex] >>> 0);
  }

  // Build prefixIncreasingStack: indices where wizard skill reaches a new maximum (from left to right)
  const prefixIncreasingStack = new Int32Array(wizardCount);
  let prefixStackSize = 0;
  prefixIncreasingStack[prefixStackSize++] = 0;
  for (let wizardIndex = 1; wizardIndex < wizardCount; wizardIndex++) {
    if (skill[wizardIndex] > skill[prefixIncreasingStack[prefixStackSize - 1]]) {
      prefixIncreasingStack[prefixStackSize++] = wizardIndex;
    }
  }

  // Build suffixIncreasingStack: indices where wizard skill reaches a new maximum (from right to left)
  const suffixIncreasingStack = new Int32Array(wizardCount);
  let suffixStackSize = 0;
  suffixIncreasingStack[suffixStackSize++] = wizardCount - 1;
  for (let wizardIndex = wizardCount - 2; wizardIndex >= 0; wizardIndex--) {
    if (skill[wizardIndex] > skill[suffixIncreasingStack[suffixStackSize - 1]]) {
      suffixIncreasingStack[suffixStackSize++] = wizardIndex;
    }
  }

  // Accumulate the total minimum time
  let totalBrewingTime = 0;

  // Iterate through each adjacent pair of potions
  for (let potionIndex = 1; potionIndex < potionCount; potionIndex++) {
    const previousMana = mana[potionIndex - 1];
    const currentMana = mana[potionIndex];
    const isManaIncreasing = previousMana < currentMana;
    const manaDifference = previousMana - currentMana;

    let maximumTransitionValue = -Infinity;

    if (isManaIncreasing) {
      // Use prefixIncreasingStack if mana is increasing
      for (let stackIndex = 0; stackIndex < prefixStackSize; stackIndex++) {
        const wizardIndex = prefixIncreasingStack[stackIndex];
        const transitionValue = manaDifference * prefixSkill[wizardIndex] + previousMana * skill[wizardIndex];
        if (transitionValue > maximumTransitionValue) {
          maximumTransitionValue = transitionValue;
        }
      }
    } else {
      // Use suffixIncreasingStack if mana is decreasing or equal
      for (let stackIndex = 0; stackIndex < suffixStackSize; stackIndex++) {
        const wizardIndex = suffixIncreasingStack[stackIndex];
        const transitionValue = manaDifference * prefixSkill[wizardIndex] + previousMana * skill[wizardIndex];
        if (transitionValue > maximumTransitionValue) {
          maximumTransitionValue = transitionValue;
        }
      }
    }

    // Add the maximum transition value to the total time
    totalBrewingTime += maximumTransitionValue;
  }

  // Add the final potion’s contribution
  totalBrewingTime += mana[potionCount - 1] * prefixSkill[wizardCount];

  return totalBrewingTime;
}
