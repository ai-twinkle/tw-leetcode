function minScoreTriangulation(values: number[]): number {
  // Total number of vertices in the polygon
  const numberOfVertices = values.length;

  // Direct calculation for exactly three vertices
  if (numberOfVertices === 3) {
    return values[0] * values[1] * values[2];
  }

  // Copy vertex values into a compact typed array
  const vertexValues = new Uint16Array(numberOfVertices);
  for (let index = 0; index < numberOfVertices; index++) {
    vertexValues[index] = values[index];
  }

  // Flat table where minimumScoreTable[i * n + j] stores best score for sub-polygon (i, j)
  const minimumScoreTable = new Uint32Array(numberOfVertices * numberOfVertices);

  // Precompute row start indices to avoid repeated multiplications
  const rowStartIndex = new Int32Array(numberOfVertices);
  for (let index = 0; index < numberOfVertices; index++) {
    rowStartIndex[index] = index * numberOfVertices;
  }

  // Large sentinel value used for initialization
  const maximumSentinelValue = 0x3f3f3f3f;

  // Iterate over possible segment lengths
  for (let segmentLength = 2; segmentLength < numberOfVertices; segmentLength++) {
    for (let leftIndex = 0; leftIndex + segmentLength < numberOfVertices; leftIndex++) {
      const rightIndex = leftIndex + segmentLength;

      // Precompute product of the two endpoints
      const endpointProduct = vertexValues[leftIndex] * vertexValues[rightIndex];

      let bestScore = maximumSentinelValue;

      // Try every possible middle vertex to form a triangle
      for (let middleIndex = leftIndex + 1; middleIndex < rightIndex; middleIndex++) {
        const leftSubScore =
          minimumScoreTable[rowStartIndex[leftIndex] + middleIndex];
        const rightSubScore =
          minimumScoreTable[rowStartIndex[middleIndex] + rightIndex];
        const triangleScore =
          endpointProduct * vertexValues[middleIndex];

        const candidateScore = leftSubScore + rightSubScore + triangleScore;
        if (candidateScore < bestScore) {
          bestScore = candidateScore;
        }
      }

      // Save the best score for this sub-polygon
      minimumScoreTable[rowStartIndex[leftIndex] + rightIndex] = bestScore;
    }
  }

  // Return the score for the whole polygon (0, n - 1)
  return minimumScoreTable[rowStartIndex[0] + (numberOfVertices - 1)];
}
