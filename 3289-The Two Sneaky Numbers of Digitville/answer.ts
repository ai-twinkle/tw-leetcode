function getSneakyNumbers(nums: number[]): number[] {
  const frequencyMap = new Map<number, number>();
  const duplicates: number[] = [];

  for (let i = 0; i < nums.length; i++) {
    frequencyMap.set(nums[i], (frequencyMap.get(nums[i]) || 0) + 1);

    if (frequencyMap.get(nums[i]) === 2) {
      duplicates.push(nums[i]);
    }
  }

  return duplicates;
}
