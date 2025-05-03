function minDominoRotations(tops: number[], bottoms: number[]): number {
  const candidates = [tops[0], bottoms[0]];

  /**
   * Calculate the number of rotations needed to make all elements in the array equal to target.
   * @param target {number} - The target number to match.
   * @returns {number} - The minimum number of rotations needed.
   */
  function rotations(target: number): number {
    let rotateTop = 0;
    let rotateBottom = 0;

    for (let i = 0; i < tops.length; i++) {
      if (tops[i] !== target && bottoms[i] !== target) {
        return Infinity;
      }

      // Rotate the top or bottom to match the target
      if (tops[i] !== target) {
        rotateTop++;
      }

      // Rotate the bottom to match the target
      if (bottoms[i] !== target) {
        rotateBottom++;
      }
    }
    return Math.min(rotateTop, rotateBottom);
  }

  const result = Math.min(rotations(candidates[0]), rotations(candidates[1]));
  return result === Infinity ? -1 : result;
}
