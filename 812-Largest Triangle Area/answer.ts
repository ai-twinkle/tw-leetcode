function largestTriangleArea(points: number[][]): number {
  const totalPointCount = points.length;

  // 1. Early exit if fewer than 3 points (no triangle can be formed)
  if (totalPointCount < 3) {
    return 0;
  }

  // 2. Copy coordinates into typed arrays for fast numeric access
  const xCoordinates = new Float64Array(totalPointCount);
  const yCoordinates = new Float64Array(totalPointCount);
  for (let pointIndex = 0; pointIndex < totalPointCount; pointIndex++) {
    const currentPoint = points[pointIndex];
    xCoordinates[pointIndex] = currentPoint[0];
    yCoordinates[pointIndex] = currentPoint[1];
  }

  // 3. Sort point indices by (x, then y) for convex hull construction
  const sortedIndices: number[] = new Array(totalPointCount);
  for (let pointIndex = 0; pointIndex < totalPointCount; pointIndex++) {
    sortedIndices[pointIndex] = pointIndex;
  }
  sortedIndices.sort((firstIndex, secondIndex) => {
    const deltaX = xCoordinates[firstIndex] - xCoordinates[secondIndex];
    if (deltaX !== 0) {
      return deltaX;
    }
    return yCoordinates[firstIndex] - yCoordinates[secondIndex];
  });

  /**
   * Compute cross product (OA × OB) to check orientation.
   *
   * @param {number} originIndex - Index of origin point O.
   * @param {number} aIndex - Index of point A.
   * @param {number} bIndex - Index of point B.
   * @return {number} Positive if O→A→B is counter-clockwise, negative if clockwise, 0 if collinear.
   */
  function computeCrossProduct(originIndex: number, aIndex: number, bIndex: number): number {
    const vectorAX = xCoordinates[aIndex] - xCoordinates[originIndex];
    const vectorAY = yCoordinates[aIndex] - yCoordinates[originIndex];
    const vectorBX = xCoordinates[bIndex] - xCoordinates[originIndex];
    const vectorBY = yCoordinates[bIndex] - yCoordinates[originIndex];
    return vectorAX * vectorBY - vectorAY * vectorBX;
  }

  // 4. Build lower convex hull
  const convexHull: number[] = [];
  for (let index = 0; index < totalPointCount; index++) {
    const currentIndex = sortedIndices[index];
    while (convexHull.length >= 2) {
      const lastIndex = convexHull[convexHull.length - 1];
      const secondLastIndex = convexHull[convexHull.length - 2];
      if (computeCrossProduct(secondLastIndex, lastIndex, currentIndex) <= 0) {
        convexHull.pop();
      } else {
        break;
      }
    }
    convexHull.push(currentIndex);
  }

  // 5. Build upper convex hull
  const lowerHullSize = convexHull.length;
  for (let index = totalPointCount - 2; index >= 0; index--) {
    const currentIndex = sortedIndices[index];
    while (convexHull.length > lowerHullSize) {
      const lastIndex = convexHull[convexHull.length - 1];
      const secondLastIndex = convexHull[convexHull.length - 2];
      if (computeCrossProduct(secondLastIndex, lastIndex, currentIndex) <= 0) {
        convexHull.pop();
      } else {
        break;
      }
    }
    convexHull.push(currentIndex);
  }

  // 6. Remove duplicate starting point if added at the end
  if (convexHull.length > 1) {
    convexHull.pop();
  }

  const hullVertexCount = convexHull.length;

  // 7. If convex hull has fewer than 3 vertices, no triangle is possible
  if (hullVertexCount < 3) {
    return 0;
  }

  // 8. Copy convex hull coordinates into typed arrays (duplicated for wrap-around)
  const hullXCoordinates = new Float64Array(hullVertexCount * 2);
  const hullYCoordinates = new Float64Array(hullVertexCount * 2);
  for (let vertexIndex = 0; vertexIndex < hullVertexCount; vertexIndex++) {
    const originalIndex = convexHull[vertexIndex];
    const x = xCoordinates[originalIndex];
    const y = yCoordinates[originalIndex];
    hullXCoordinates[vertexIndex] = x;
    hullYCoordinates[vertexIndex] = y;
    hullXCoordinates[vertexIndex + hullVertexCount] = x;
    hullYCoordinates[vertexIndex + hullVertexCount] = y;
  }

  /**
   * Compute twice the area of a triangle using convex hull vertex indices.
   *
   * @param {number} i - Index of first vertex.
   * @param {number} j - Index of second vertex.
   * @param {number} k - Index of third vertex.
   * @return {number} Twice the area of the triangle (non-negative because hull is CCW).
   */
  function computeTwiceTriangleArea(i: number, j: number, k: number): number {
    const baseX = hullXCoordinates[i];
    const baseY = hullYCoordinates[i];
    const vectorJX = hullXCoordinates[j] - baseX;
    const vectorJY = hullYCoordinates[j] - baseY;
    const vectorKX = hullXCoordinates[k] - baseX;
    const vectorKY = hullYCoordinates[k] - baseY;
    return vectorJX * vectorKY - vectorJY * vectorKX;
  }

  // 9. Use rotating calipers to find maximum area triangle in O(h^2)
  let maximumTwiceArea = 0;
  for (let i = 0; i < hullVertexCount; i++) {
    let k = i + 2;
    for (let j = i + 1; j < i + hullVertexCount - 1; j++) {
      while (k + 1 < i + hullVertexCount) {
        const currentArea = computeTwiceTriangleArea(i, j, k);
        const nextArea = computeTwiceTriangleArea(i, j, k + 1);
        if (nextArea > currentArea) {
          k++;
        } else {
          break;
        }
      }
      const area = computeTwiceTriangleArea(i, j, k);
      if (area > maximumTwiceArea) {
        maximumTwiceArea = area;
      }
    }
  }

  // 10. Convert from twice-area to actual triangle area
  return maximumTwiceArea * 0.5;
}
