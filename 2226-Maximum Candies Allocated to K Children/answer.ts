function maximumCandies(candyPiles: number[], numChildren: number): number {
  const n = candyPiles.length;
  let totalCandies = 0;
  let largestCandyPile = 0;

  // Calculate total candies and find the largest pile
  for (let i = 0; i < n; i++) {
    totalCandies += candyPiles[i];
    if (candyPiles[i] > largestCandyPile) {
      largestCandyPile = candyPiles[i];
    }
  }

  // If there aren't enough candies for all children, return 0
  if (totalCandies < numChildren) {
    return 0;
  }

  // Determine the search range for candies per child:
  // A maximum candidate is limited by the largest pile and the average distribution
  let maxCandidate = Math.min(largestCandyPile, (totalCandies / numChildren) | 0);
  let minCandidate = 1;
  let bestCandiesPerChild = 0;

  // Binary search to find the maximum candies each child can get
  while (minCandidate <= maxCandidate) {
    const midCandies = ((minCandidate + maxCandidate) / 2) | 0;
    let childrenServed = 0;

    // Calculate how many children can be served with midCandies per child
    for (let i = 0; i < n; i++) {
      childrenServed += (candyPiles[i] / midCandies) | 0;
      if (childrenServed >= numChildren) {
        break;
      }
    }

    if (childrenServed >= numChildren) {
      // If midCandies can serve all children, try a larger amount
      bestCandiesPerChild = midCandies;
      minCandidate = midCandies + 1;
    } else {
      // Otherwise, try a smaller amount
      maxCandidate = midCandies - 1;
    }
  }
  return bestCandiesPerChild;
}
