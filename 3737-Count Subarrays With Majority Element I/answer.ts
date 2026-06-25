/** Fenwick Tree (Binary Indexed Tree) for prefix-count queries */
class FenwickTree {
  private readonly tree: Int32Array;
  private readonly size: number;

  constructor(size: number) {
    this.size = size;
    this.tree = new Int32Array(size + 1);
  }

  /**
   * Add 1 at the given index.
   * @param index - 1-based index to update
   */
  update(index: number): void {
    for (let position = index; position <= this.size; position += position & (-position)) {
      this.tree[position]++;
    }
  }

  /**
   * Query the cumulative count from index 1 to the given index.
   * @param index - 1-based index upper bound (inclusive)
   * @returns Sum of counts in range [1, index]
   */
  query(index: number): number {
    let total = 0;
    for (let position = index; position > 0; position -= position & (-position)) {
      total += this.tree[position];
    }
    return total;
  }

  /**
   * Query the count of values strictly less than the given 1-based index.
   * @param index - 1-based index
   * @returns Count of values in range [1, index - 1]
   */
  queryLessThan(index: number): number {
    if (index <= 1) {
      return 0;
    }
    return this.query(index - 1);
  }
}

/**
 * Counts the number of subarrays where `target` is the majority element
 * (appears strictly more than half the time).
 *
 * Strategy: map target → +1, others → -1. A subarray is valid when its
 * element-sum > 0. Using a prefix-sum + Fenwick Tree, we count valid pairs
 * in O(n log n) instead of the naive O(n²).
 *
 * @param nums - Input integer array
 * @param target - The value that must be the majority element
 * @returns Count of valid subarrays
 */
function countMajoritySubarrays(nums: number[], target: number): number {
  const length = nums.length;

  // Prefix sums range from -length to +length; offset by length so all indices >= 0
  const offset = length;
  const treeSize = 2 * length + 1;
  const fenwickTree = new FenwickTree(treeSize);

  // Seed with prefix sum 0 (before the array starts), mapped to index offset+1 (1-based)
  fenwickTree.update(offset + 1);

  let prefixSum = 0;
  let count = 0;

  for (let index = 0; index < length; index++) {
    // Accumulate +1 for target, -1 for anything else
    prefixSum += nums[index] === target ? 1 : -1;

    // 1-based BIT index for current prefix sum
    const currentBitIndex = prefixSum + offset + 1;

    // Count how many prior prefix sums are strictly less than the current one
    // Those correspond to subarrays ending here with a positive sum (majority holds)
    count += fenwickTree.queryLessThan(currentBitIndex);

    // Record this prefix sum for future queries
    fenwickTree.update(currentBitIndex);
  }

  return count;
}
