function repairCars(ranks: number[], cars: number): number {
  /**
   * Helper function: determine if it's possible to repair all cars within 'time' minutes.
   * @param time - The time in minutes.
   * @returns True if it's possible to repair all cars within 'time' minutes, false otherwise.
   */
  const canRepairCars = (time: number): boolean => {
    let count = 0;
    for (let i = 0, len = ranks.length; i < len; i++) {
      count += Math.floor(Math.sqrt(time / ranks[i]));
      if (count >= cars) {
        // Early exit once target is met.
        return true;
      }
    }
    return false;
  };

  const maxRank = Math.max(...ranks);
  let lower = 0;
  let higher = maxRank * cars * cars;

  // Binary search to determine the minimum time required.
  while (lower < higher) {
    const middleNumber = lower + Math.floor((higher - lower) / 2);
    if (canRepairCars(middleNumber)) {
      higher = middleNumber;
    } else {
      lower = middleNumber + 1;
    }
  }
  return lower;
}
