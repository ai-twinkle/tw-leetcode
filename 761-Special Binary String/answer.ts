function makeLargestSpecial(s: string): string {
  /**
   * Build the lexicographically largest special string for s[left:right).
   * @param s The original binary string.
   * @param left Inclusive left bound.
   * @param right Exclusive right bound.
   * @return The best (largest) special string for the segment.
   */
  function buildLargestSpecialSegment(s: string, left: number, right: number): string {
    const segments: string[] = [];
    let balance = 0;
    let segmentStart = left;

    // Split into primitive special substrings by tracking balance (1 => +1, 0 => -1).
    for (let index = left; index < right; index++) {
      if (s.charCodeAt(index) === 49) {
        balance++;
      } else {
        balance--;
      }

      if (balance === 0) {
        const innerLargest = buildLargestSpecialSegment(s, segmentStart + 1, index);
        segments.push("1" + innerLargest + "0");
        segmentStart = index + 1;
      }
    }

    if (segments.length <= 1) {
      return segments.length === 0 ? "" : segments[0];
    }

    // Sort segments descending so concatenation yields the lexicographically largest string.
    segments.sort((first, second) => {
      if (first > second) {
        return -1;
      }
      if (first < second) {
        return 1;
      }
      return 0;
    });

    return segments.join("");
  }

  return buildLargestSpecialSegment(s, 0, s.length);
}
