function arrayRankTransform(arr: number[]): number[] {
  const length = arr.length;

  // Handle empty input early to avoid unnecessary allocations
  if (length === 0) {
    return [];
  }

  // Copy into a typed array for faster native numeric sorting
  const sorted = Int32Array.from(arr);
  sorted.sort();

  // Deduplicate in place so index + 1 directly equals the rank of each value
  let uniqueCount = 1;

  for (let index = 1; index < length; index++) {
    if (sorted[index] !== sorted[uniqueCount - 1]) {
      sorted[uniqueCount] = sorted[index];
      uniqueCount++;
    }
  }

  // Build result via binary search: the found position plus one is the rank
  const result = new Array<number>(length);

  for (let index = 0; index < length; index++) {
    const target = arr[index];
    let low = 0;
    let high = uniqueCount - 1;

    // Locate target among the unique sorted values
    while (low < high) {
      const mid = (low + high) >>> 1;

      if (sorted[mid] < target) {
        low = mid + 1;
      } else {
        high = mid;
      }
    }

    // Rank is the 1-based position in the unique sorted sequence
    result[index] = low + 1;
  }

  return result;
}
