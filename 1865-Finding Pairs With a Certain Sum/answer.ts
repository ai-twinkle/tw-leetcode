class FindSumPairs {
  // Sorted nums1 for efficient count query
  private readonly sortedNumbers1: number[];
  // Reference to nums2 for direct updates
  private readonly numbers2Array: number[];
  // Frequency table for nums2 values
  private readonly frequencyTableNumbers2: Record<number, number>;

  constructor(nums1: number[], nums2: number[]) {
    // Sort nums1 for early stopping in count()
    this.sortedNumbers1 = nums1.slice().sort((a, b) => a - b);

    // Direct reference for O(1) updates
    this.numbers2Array = nums2;

    // Build frequency table for nums2
    this.frequencyTableNumbers2 = {};
    for (let i = 0, n = nums2.length; i < n; i++) {
      const value = nums2[i];
      this.frequencyTableNumbers2[value] = (this.frequencyTableNumbers2[value] || 0) + 1;
    }
  }

  add(index: number, val: number): void {
    const previousValue = this.numbers2Array[index];
    const newValue = previousValue + val;
    this.numbers2Array[index] = newValue;

    // Update frequency table: remove old value
    const previousCount = this.frequencyTableNumbers2[previousValue];
    if (previousCount > 1) {
      this.frequencyTableNumbers2[previousValue] = previousCount - 1;
    } else {
      delete this.frequencyTableNumbers2[previousValue];
    }

    // Update frequency table: add new value
    this.frequencyTableNumbers2[newValue] = (this.frequencyTableNumbers2[newValue] || 0) + 1;
  }

  count(tot: number): number {
    let result = 0;
    const frequencyTable = this.frequencyTableNumbers2;
    const sortedNumbers1 = this.sortedNumbers1;

    // Loop through sorted nums1, break early if current value exceeds tot
    for (let i = 0, length = sortedNumbers1.length; i < length; i++) {
      const value1 = sortedNumbers1[i];
      if (value1 > tot) {
        break;
      }
      result += frequencyTable[tot - value1] || 0;
    }

    return result;
  }
}

/**
 * Your FindSumPairs object will be instantiated and called as such:
 * var obj = new FindSumPairs(nums1, nums2)
 * obj.add(index,val)
 * var param_2 = obj.count(tot)
 */
