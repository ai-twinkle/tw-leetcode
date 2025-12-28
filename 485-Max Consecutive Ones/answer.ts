function findMaxConsecutiveOnes(nums: number[]): number {
  let currentStreak = 0;
  let maximumStreak = 0;

  const length = nums.length;

  // Update maximum only when a streak ends to reduce per-element overhead.
  for (let index = 0; index < length; index++) {
    const value = nums[index];

    if (value === 1) {
      currentStreak++;
      continue;
    }

    if (currentStreak > maximumStreak) {
      maximumStreak = currentStreak;
    }
    currentStreak = 0;
  }

  if (currentStreak > maximumStreak) {
    maximumStreak = currentStreak;
  }

  return maximumStreak;
}
