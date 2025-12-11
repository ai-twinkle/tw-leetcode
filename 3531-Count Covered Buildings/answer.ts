function countCoveredBuildings(n: number, buildings: number[][]): number {
  // Use typed arrays for better memory layout and performance
  const maxRow = new Int32Array(n + 1);
  const minRow = new Int32Array(n + 1);
  const maxCol = new Int32Array(n + 1);
  const minCol = new Int32Array(n + 1);

  // Initialize min arrays to a large sentinel (n + 1)
  for (let index = 1; index <= n; index++) {
    minRow[index] = n + 1;
    minCol[index] = n + 1;
  }

  const totalBuildings = buildings.length;

  // First pass: precompute min/max coordinates per row and column
  for (let index = 0; index < totalBuildings; index++) {
    const currentBuilding = buildings[index];
    const x = currentBuilding[0];
    const y = currentBuilding[1];

    // Update row extremes for this y
    if (x > maxRow[y]) {
      maxRow[y] = x;
    }
    if (x < minRow[y]) {
      minRow[y] = x;
    }

    // Update column extremes for this x
    if (y > maxCol[x]) {
      maxCol[x] = y;
    }
    if (y < minCol[x]) {
      minCol[x] = y;
    }
  }

  // Second pass: count buildings that are strictly between
  // both row and column extremes in all four directions
  let coveredCount = 0;

  for (let index = 0; index < totalBuildings; index++) {
    const currentBuilding = buildings[index];
    const x = currentBuilding[0];
    const y = currentBuilding[1];

    if (x > minRow[y] && x < maxRow[y] && y > minCol[x] && y < maxCol[x]) {
      coveredCount++;
    }
  }

  return coveredCount;
}
