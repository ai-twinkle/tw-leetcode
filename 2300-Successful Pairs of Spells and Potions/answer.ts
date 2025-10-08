function successfulPairs(spells: number[], potions: number[], success: number): number[] {
  // Define the maximum possible potion strength based on constraint
  const maximumPotionValue = 100000;

  // Build a histogram of potion strengths (typed array for performance and low GC)
  const potionCountAtOrAbove = new Uint32Array(maximumPotionValue + 1);
  const totalPotionCount = potions.length;

  for (let i = 0; i < totalPotionCount; i++) {
    const potionStrength = potions[i];
    potionCountAtOrAbove[potionStrength] += 1;
  }

  // Convert histogram into suffix sum: potionCountAtOrAbove[v] = count of potions ≥ v
  let cumulativeCount = 0;
  for (let v = maximumPotionValue; v >= 1; v--) {
    cumulativeCount += potionCountAtOrAbove[v];
    potionCountAtOrAbove[v] = cumulativeCount;
  }

  // Prepare reusable constants for better performance
  const totalPotions = totalPotionCount;
  const maxPotionValue = maximumPotionValue;
  const requiredSuccess = success;
  const successMinusOne = requiredSuccess - 1;

  // Preallocate result array to avoid dynamic resizing
  const totalSpells = spells.length;
  const result = new Array<number>(totalSpells);

  // Process each spell to count matching potions
  for (let i = 0; i < totalSpells; i++) {
    const spellStrength = spells[i];

    // Fast path: if the spell itself already meets or exceeds success, all potions qualify
    if (spellStrength >= requiredSuccess) {
      result[i] = totalPotions;
      continue;
    }

    // Compute minimum potion strength needed using integer ceil division
    const threshold = Math.floor((successMinusOne + spellStrength) / spellStrength);

    let successfulPotionCount: number;

    // If the threshold ≤ 1, every potion is strong enough
    if (threshold <= 1) {
      successfulPotionCount = totalPotions;
    } else {
      // If the threshold exceeds any potion strength, no potions qualify
      if (threshold > maxPotionValue) {
        successfulPotionCount = 0;
      } else {
        // Lookup precomputed count from suffix array (O(1))
        successfulPotionCount = potionCountAtOrAbove[threshold];
      }
    }

    // Store result for this spell
    result[i] = successfulPotionCount;
  }

  // Return final counts for all spells
  return result;
}

