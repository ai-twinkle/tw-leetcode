function minScore(n: number, roads: number[][]): number {
  const roadCount = roads.length;

  // Build a compressed adjacency list using typed arrays (CSR format).
  const degree = new Int32Array(n + 1);
  for (let index = 0; index < roadCount; index++) {
    const road = roads[index];
    degree[road[0]]++;
    degree[road[1]]++;
  }

  // Compute the starting offset for each city's neighbor block.
  const offset = new Int32Array(n + 2);
  for (let city = 1; city <= n; city++) {
    offset[city + 1] = offset[city] + degree[city];
  }

  // Fill neighbor and weight arrays at their proper positions.
  const totalEndpoints = roadCount * 2;
  const neighbor = new Int32Array(totalEndpoints);
  const weight = new Int32Array(totalEndpoints);
  const cursor = offset.slice(0, n + 1);
  for (let index = 0; index < roadCount; index++) {
    const road = roads[index];
    const cityA = road[0];
    const cityB = road[1];
    const distance = road[2];
    const positionA = cursor[cityA]++;
    neighbor[positionA] = cityB;
    weight[positionA] = distance;
    const positionB = cursor[cityB]++;
    neighbor[positionB] = cityA;
    weight[positionB] = distance;
  }

  // Traverse city 1's component with an explicit stack, tracking the minimum edge weight.
  const visited = new Uint8Array(n + 1);
  const stack = new Int32Array(n);
  let stackSize = 0;
  stack[stackSize++] = 1;
  visited[1] = 1;
  let minimumScore = 0x7fffffff;

  while (stackSize > 0) {
    const city = stack[--stackSize];
    const start = offset[city];
    const end = offset[city + 1];
    for (let position = start; position < end; position++) {
      const edgeWeight = weight[position];

      // Every edge in this component is reachable, so it can contribute to the answer.
      if (edgeWeight < minimumScore) {
        minimumScore = edgeWeight;
      }
      const next = neighbor[position];
      if (visited[next] === 0) {
        visited[next] = 1;
        stack[stackSize++] = next;
      }
    }
  }

  return minimumScore;
}
