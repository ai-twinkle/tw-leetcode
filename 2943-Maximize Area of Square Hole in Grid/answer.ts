function maximizeSquareHoleArea(n: number, m: number, hBars: number[], vBars: number[]): number {
  /**
   * Compute the maximum merged cell span produced by removing a longest consecutive run of bars.
   *
   * @param removableBars - Bar indices that may be removed.
   * @returns Maximum span in cells after removals.
   */
  function computeMaximumSpan(removableBars: number[]): number {
    const length = removableBars.length;
    if (length === 0) {
      return 1;
    }

    const sortedBars = Int32Array.from(removableBars);
    sortedBars.sort();

    let maximumConsecutive = 1;
    let currentConsecutive = 1;

    // Longest consecutive removable bars determines the maximum merged cell span.
    for (let index = 1; index < length; index++) {
      if (sortedBars[index] === sortedBars[index - 1] + 1) {
        currentConsecutive++;
        if (currentConsecutive > maximumConsecutive) {
          maximumConsecutive = currentConsecutive;
        }
      } else {
        currentConsecutive = 1;
      }
    }

    return maximumConsecutive + 1;
  }

  const maximumHoleHeight = computeMaximumSpan(hBars);
  const maximumHoleWidth = computeMaximumSpan(vBars);

  const squareSide = maximumHoleHeight < maximumHoleWidth ? maximumHoleHeight : maximumHoleWidth;
  return squareSide * squareSide;
}
