/**
 * @param {number[]} nums
 * @return {number}
 */
function maximumTripletValue(nums: number[]): number {
  let maxTriplet = 0;       // Store the maximum triplet value found so far
  let bestLeft = nums[0];   // Track the maximum element from the left (as candidate for nums[i])
  let bestDiff = 0;         // Track the best difference (bestLeft - nums[j])

  // Loop over possible middle indices (j) such that there's a valid k (j+1)
  for (let j = 1; j < nums.length - 1; j++) {
    // Update bestDiff: best difference so far between an element to the left and the current element
    bestDiff = Math.max(bestDiff, bestLeft - nums[j]);
    // Calculate candidate triplet value using nums[j+1] as the right element (multiplier)
    maxTriplet = Math.max(maxTriplet, bestDiff * nums[j + 1]);
    // Update bestLeft to include the current element for future iterations
    bestLeft = Math.max(bestLeft, nums[j]);
  }

  return maxTriplet;
}
