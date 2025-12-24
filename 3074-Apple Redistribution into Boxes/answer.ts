function minimumBoxes(apple: number[], capacity: number[]): number {
  let totalApples = 0;
  for (let appleIndex = 0; appleIndex < apple.length; appleIndex++) {
    totalApples += apple[appleIndex];
  }

  // Count capacities (1..50) to avoid sort() overhead
  const capacityCount = new Int8Array(51);
  for (let boxIndex = 0; boxIndex < capacity.length; boxIndex++) {
    capacityCount[capacity[boxIndex]]++;
  }

  let remainingApples = totalApples;
  let usedBoxes = 0;

  // Greedily pick boxes from largest capacity to smallest until all apples fit
  for (let currentCapacity = 50; currentCapacity >= 1; currentCapacity--) {
    let currentCount = capacityCount[currentCapacity];
    while (currentCount > 0) {
      remainingApples -= currentCapacity;
      usedBoxes++;

      if (remainingApples <= 0) {
        return usedBoxes;
      }

      currentCount--;
    }
  }


  // Guaranteed solvable by constraints, but keep a safe fallback
  return capacity.length;
}
