function countServers(grid: number[][]): number {
  const rowCount = grid.length;
  if (rowCount === 0) {
    return 0;
  }
  const colCount = grid[0].length;

  // Use typed arrays to store counts with minimal JS-object overhead
  const serversPerRow = new Uint16Array(rowCount);
  const serversPerCol = new Uint16Array(colCount);

  // Phase 1: count all servers in each row & column
  for (let i = 0; i < rowCount; i++) {
    const row = grid[i]; // Alias for one fewer bounds-check
    let rowServerCount = 0;         // Local accumulator
    for (let j = 0; j < colCount; j++) {
      // Direct addition of 0 or 1 is faster than an if-branch
      const hasServer = row[j];
      rowServerCount += hasServer;
      serversPerCol[j] += hasServer;
    }
    serversPerRow[i] = rowServerCount;
  }

  // Phase 2: only scan server cells, check if there's ≥2 in its row or column
  let totalCommunicating = 0;
  for (let i = 0; i < rowCount; i++) {
    const row = grid[i];
    const rowServers = serversPerRow[i];
    for (let j = 0; j < colCount; j++) {
      // Skip empties fast, then test if this server can talk
      if (row[j] && (rowServers > 1 || serversPerCol[j] > 1)) {
        totalCommunicating++;
      }
    }
  }

  return totalCommunicating;
}
