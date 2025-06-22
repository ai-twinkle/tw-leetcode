function divideString(s: string, k: number, fill: string): string[] {
  // Compute how many groups we'll have
  const totalGroups = Math.ceil(s.length / k);

  // Precompute a fill string of length k, so we can slice it in O(1)
  const fullFillString = fill.repeat(k);

  // Allocate result array exactly once
  const result: string[] = new Array(totalGroups);

  for (let groupIndex = 0; groupIndex < totalGroups; groupIndex++) {
    const startIndex = groupIndex * k;
    const endIndex = startIndex + k;

    // Extract up to k characters in O(1) (native)
    let groupSegment = s.substring(startIndex, endIndex);

    // If shorter than k, append the slice of precomputed fill
    if (groupSegment.length < k) {
      groupSegment += fullFillString.slice(0, k - groupSegment.length);
    }

    result[groupIndex] = groupSegment;
  }

  return result;
}
