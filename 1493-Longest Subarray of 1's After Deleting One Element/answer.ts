function longestSubarray(nums: number[]): number {
    const length = nums.length;
    if (length <= 1) {
        return 0;
    }

    let leftIndex = 0;
    let zeroCountInWindow = 0;
    let maximumLengthAfterDeletion = 0;

    for (let rightIndex = 0; rightIndex < length; rightIndex++) {
        if (nums[rightIndex] === 0) {
            zeroCountInWindow++;
        }

        while (zeroCountInWindow > 1) {
            if (nums[leftIndex] === 0) {
                zeroCountInWindow--;
            }
            leftIndex++;
        }

        // After deleting exactly one element in the window
        const candidateLength = rightIndex - leftIndex;
        if (candidateLength > maximumLengthAfterDeletion) {
            maximumLengthAfterDeletion = candidateLength;
        }

        // Optional early stop
        if (maximumLengthAfterDeletion >= length - leftIndex - 1) {
            break;
        }
    }

    return maximumLengthAfterDeletion;
}
