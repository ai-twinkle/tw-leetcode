function closestMeetingNode(edges: number[], node1: number, node2: number): number {
  const totalNodes = edges.length;
  const outgoingEdges = edges; // Local alias for faster indexed access

  // 1. Compute and record distance from node1 to every reachable node
  const distanceFromNodeOne = new Int32Array(totalNodes).fill(-1);
  let currentNode = node1;
  let currentDistance = 0;
  while (currentNode !== -1 && distanceFromNodeOne[currentNode] === -1) {
    distanceFromNodeOne[currentNode] = currentDistance;
    currentNode = outgoingEdges[currentNode];
    currentDistance++;
  }

  // 2. Walk from node2, marking visited to avoid cycles—but don't store all distances
  const visitedFromNodeTwo = new Uint8Array(totalNodes);
  let closestMeetingNodeIndex = -1;
  let minimalMaxDistance = totalNodes; // Any real maxDist ≤ totalNodes-1

  currentNode = node2;
  currentDistance = 0;
  while (currentNode !== -1 && visitedFromNodeTwo[currentNode] === 0) {
    visitedFromNodeTwo[currentNode] = 1;

    const distOne = distanceFromNodeOne[currentNode];
    if (distOne >= 0) {
      // Node is reachable from both starts
      const maxDist = distOne > currentDistance ? distOne : currentDistance;
      if (
        maxDist < minimalMaxDistance ||
        (maxDist === minimalMaxDistance && currentNode < closestMeetingNodeIndex)
      ) {
        minimalMaxDistance = maxDist;
        closestMeetingNodeIndex = currentNode;
      }
    }

    currentNode = outgoingEdges[currentNode];
    currentDistance++;
  }

  return closestMeetingNodeIndex;
}
