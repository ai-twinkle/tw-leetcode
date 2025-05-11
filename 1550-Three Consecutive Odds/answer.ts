function threeConsecutiveOdds(arr: number[]): boolean {
  return arr.some((_, i) => arr[i] % 2 && arr[i + 1] % 2 && arr[i + 2] % 2);
}
