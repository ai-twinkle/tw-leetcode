function successfulPairs(spells: number[], potions: number[], success: number): number[] {
  // Define upper bound of potion strength based on problem constraint
  const maximumPotionValue = 100000;

  // Create a typed array histogram to count potion occurrences (fast and memory efficient)
  const greaterOrEqual = new Uint32Array(maximumPotionValue + 1);
  const potionsLength = potions.length;

  // Count each potion's strength
  for (let i = 0; i < potionsLength; i++) {
    const potionStrength = potions[i];
    greaterOrEqual[potionStrength] += 1;
  }

  // Build suffix sum array: ge[v] = count of potions with strength ≥ v
  let cumulativeCount = 0;
  for (let v = maximumPotionValue; v >= 1; v--) {
    cumulativeCount += greaterOrEqual[v];
    greaterOrEqual[v] = cumulativeCount;
  }

  // Prepare variables for fast access in loop (helps JIT optimization)
  const totalPotions = potionsLength;
  const ge = greaterOrEqual;
  const maxV = maximumPotionValue;
  const requiredSuccess = success;
  const successMinusOne = requiredSuccess - 1;

  // Preallocate result array for performance
  const spellsLength = spells.length;
  const result = new Array<number>(spellsLength);

  // Iterate through each spell to compute qualifying potion count
  for (let i = 0; i < spellsLength; i++) {
    const spellStrength = spells[i];

    // Fast check: if the spell itself already ≥ success, every potion works
    if (spellStrength >= requiredSuccess) {
      result[i] = totalPotions;
      continue;
    }

    // Compute minimum potion strength needed (threshold = ceil(success / spell))
    const threshold = Math.floor((successMinusOne + spellStrength) / spellStrength);

    let countSuccessful: number;

    // If threshold ≤ 1, all potions qualify
    if (threshold <= 1) {
      countSuccessful = totalPotions;
    } else {
      // If threshold exceeds possible potion values, none qualify
      if (threshold > maxV) {
        countSuccessful = 0;
      } else {
        // Direct O(1) lookup using suffix array
        countSuccessful = ge[threshold];
      }
    }

    // Store the count of successful potion pairs for this spell
    result[i] = countSuccessful;
  }

  // Return the array of results
  return result;
}
