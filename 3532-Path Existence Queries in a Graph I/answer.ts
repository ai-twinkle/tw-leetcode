function pathExistenceQueries(
  n: number,
  nums: number[],
  maxDiff: number,
  queries: number[][]
): boolean[] {
  // Assign each node a component id; a break occurs when the gap exceeds maxDiff.
  const componentId = new Int32Array(n);

  for (let index = 1; index < n; index++) {
    // Same component as previous unless the gap is too large.
    if (nums[index] - nums[index - 1] > maxDiff) {
      componentId[index] = componentId[index - 1] + 1;
    } else {
      componentId[index] = componentId[index - 1];
    }
  }

  const queryCount = queries.length;
  const pathExistenceResults: boolean[] = new Array(queryCount);

  // Two nodes are connected exactly when they share the same component id.
  for (let index = 0; index < queryCount; index++) {
    const query = queries[index];
    pathExistenceResults[index] = componentId[query[0]] === componentId[query[1]];
  }

  return pathExistenceResults;
}
