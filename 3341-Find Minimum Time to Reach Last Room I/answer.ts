function minTimeToReach(moveTime: number[][]): number {
  const n = moveTime.length;
  const m = moveTime[0].length;
  const totalCells = n * m;

  // 1. Flatten moveTime into a typed array for O(1) access
  const flattenedMoveTime = new Int32Array(totalCells);
  for (let row = 0; row < n; row++) {
    const rowStartIndex = row * m;
    const thisRow = moveTime[row];
    for (let col = 0; col < m; col++) {
      flattenedMoveTime[rowStartIndex + col] = thisRow[col];
    }
  }

  // 2. Distance array, initialize to Infinity
  const distance = new Float64Array(totalCells);
  distance.fill(Infinity);
  distance[0] = 0;  // start at (0,0) at time 0

  // 3. SPFA‐style queue (no .shift())
  const nodeQueue: number[] = [0];
  for (let headIndex = 0; headIndex < nodeQueue.length; headIndex++) {
    const currentIndex = nodeQueue[headIndex];
    const currentTime = distance[currentIndex];
    const currentRow = (currentIndex / m) | 0;
    const currentCol = currentIndex % m;


    for (let direction = 0; direction < 4; direction++) {
      // 4.1 Try all four directions
      const nextRow = direction === 0 ? currentRow :
        direction === 1 ? currentRow + 1 :
          direction === 2 ? currentRow : currentRow - 1;
      const nextCol = direction === 0 ? currentCol + 1 :
        direction === 1 ? currentCol :
          direction === 2 ? currentCol - 1 : currentCol;

      // 4.2 Check if the next cell is valid
      if (nextRow < 0 || nextRow >= n || nextCol < 0 || nextCol >= m) {
        continue;
      }

      // 4.3 Check if the next cell is open
      const neighborIndex = nextRow * m + nextCol;
      // must wait until the room is open, then +1 to move
      const departureTime = currentTime > flattenedMoveTime[neighborIndex] ?
        currentTime : flattenedMoveTime[neighborIndex];
      const arrivalTime = departureTime + 1;

      // 4.4 Relax the edge
      if (arrivalTime < distance[neighborIndex]) {
        distance[neighborIndex] = arrivalTime;
        nodeQueue.push(neighborIndex);
      }
    }
  }

  const finalTime = distance[totalCells - 1];
  return finalTime === Infinity ? -1 : finalTime;
}
