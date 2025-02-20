function findDifferentBinaryString(nums: string[]): string {
  const n = nums.length;
  let result = '';

  for (let i = 0; i < n; i++) {
    // Flip the i-th bit of the i-th string:
    // if it's '0', append '1'; if '1', append '0'
    result += nums[i][i] === '0' ? '1' : '0';
  }

  return result;
}
