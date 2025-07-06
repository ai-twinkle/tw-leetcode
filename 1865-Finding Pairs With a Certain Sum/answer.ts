class FindSumPairs {
  // Sorted nums1 for efficient count query
  private readonly sortedNumbers1: number[];
  // Reference to nums2 for direct updates
  private readonly numbers2Array: number[];
  // Frequency table for nums2 values
  private readonly frequencyTableNumbers2: Record<number, number>;

  constructor(numbers1: number[], numbers2: number[]) {
    // Sort numbers1 for early stopping in count()
    this.sortedNumbers1 = numbers1.slice().sort((a, b) => a - b);

    // Direct reference for O(1) updates
    this.numbers2Array = numbers2;

    // Build frequency table for numbers2
    this.frequencyTableNumbers2 = {};
    for (let i = 0, n = numbers2.length; i < n; i++) {
      const value = numbers2[i];
      this.frequencyTableNumbers2[value] = (this.frequencyTableNumbers2[value] || 0) + 1;
    }
  }

  add(index: number, valueToAdd: number): void {
    const previousValue = this.numbers2Array[index];
    const newValue = previousValue + valueToAdd;
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

  count(targetSum: number): number {
    let result = 0;
    const frequencyTable = this.frequencyTableNumbers2;
    const sortedNumbers1 = this.sortedNumbers1;

    // Loop through sorted numbers1, break early if current value exceeds targetSum
    for (let i = 0, length = sortedNumbers1.length; i < length; i++) {
      const value1 = sortedNumbers1[i];
      if (value1 > targetSum) {
        break;
      }
      result += frequencyTable[targetSum - value1] || 0;
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
