function queryResults(_limit: number, queries: number[][]): number[] {
  const ballColor = new Map<number, number>();  // Record the updated color of each ball
  const colorCount = new Map<number, number>(); // Record the count of each color

  const result: number[] = [];

  for (const [index, color] of queries) {
    if (ballColor.has(index)) {
      // If the ball has been colored before, decrease the count of the previous color
      const prevColor = ballColor.get(index)!;
      const count = colorCount.get(prevColor)!;
      if (count === 1) {
        // Remove the previous color if the count is 1
        colorCount.delete(prevColor);
      } else {
        // Decrease the count of the previous color
        colorCount.set(prevColor, count - 1);
      }
    }

    // Update the color of the ball
    ballColor.set(index, color);
    // Increase the count of the current color
    colorCount.set(color, (colorCount.get(color) || 0) + 1);

    // Record the number of distinct colors
    result.push(colorCount.size);
  }

  return result;
}
