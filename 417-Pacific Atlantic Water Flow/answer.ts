function pacificAtlantic(heights: number[][]): number[][] {
  const numberOfRows = heights.length;
  const numberOfColumns = heights[0].length;
  const totalCells = numberOfRows * numberOfColumns;

  // Create typed arrays for visited states (0 = unvisited, 1 = visited)
  const pacificVisited = new Uint8Array(totalCells);
  const atlanticVisited = new Uint8Array(totalCells);

  /**
   * Depth-first search traversal to mark reachable cells
   *
   * @param row - current row index
   * @param column - current column index
   * @param previousHeight - previous cell height to ensure non-decreasing path
   * @param visited - typed array to mark reachable cells
   */
  function depthFirstSearch(
    row: number,
    column: number,
    previousHeight: number,
    visited: Uint8Array
  ): void {
    if (row < 0 || column < 0 || row >= numberOfRows || column >= numberOfColumns) {
      return;
    }

    const linearIndex = row * numberOfColumns + column;

    if (visited[linearIndex] === 1) {
      return;
    }

    const currentHeight = heights[row][column];

    if (previousHeight > currentHeight) {
      return;
    }

    // Mark current cell as visited
    visited[linearIndex] = 1;

    // Explore up
    depthFirstSearch(row - 1, column, currentHeight, visited);

    // Explore down
    depthFirstSearch(row + 1, column, currentHeight, visited);

    // Explore left
    depthFirstSearch(row, column - 1, currentHeight, visited);

    // Explore right
    depthFirstSearch(row, column + 1, currentHeight, visited);
  }

  // Start DFS from all Pacific edge cells
  for (let row = 0; row < numberOfRows; row++) {
    depthFirstSearch(row, 0, 0, pacificVisited);
  }
  for (let column = 0; column < numberOfColumns; column++) {
    depthFirstSearch(0, column, 0, pacificVisited);
  }

  // Start DFS from all Atlantic edge cells
  const lastRow = numberOfRows - 1;
  const lastColumn = numberOfColumns - 1;

  for (let row = 0; row < numberOfRows; row++) {
    depthFirstSearch(row, lastColumn, 0, atlanticVisited);
  }
  for (let column = 0; column < numberOfColumns; column++) {
    depthFirstSearch(lastRow, column, 0, atlanticVisited);
  }

  // Collect cells reachable by both oceans
  const result: number[][] = [];
  for (let row = 0; row < numberOfRows; row++) {
    const baseIndex = row * numberOfColumns;
    for (let column = 0; column < numberOfColumns; column++) {
      const index = baseIndex + column;

      if (pacificVisited[index] === 1) {
        if (atlanticVisited[index] === 1) {
          result.push([row, column]);
        }
      }
    }
  }

  return result;
}
