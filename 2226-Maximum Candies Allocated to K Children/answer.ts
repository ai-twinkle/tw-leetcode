function maximumCandies(candies: number[], k: number): number {
  const n = candies.length;
  let totalCandies = 0;
  let largestCandyPile = 0;

  // Calculate total candies and find the largest pile
  for (let i = 0; i < n; i++) {
    totalCandies += candies[i];
    if (candies[i] > largestCandyPile) {
      largestCandyPile = candies[i];
    }
  }

  // If there aren't enough candies for all children, return 0
  if (totalCandies < k) {
    return 0;
  }

  // Determine the search range for candies per child:
  // A maximum candidate is limited by the largest pile and the average distribution
  let maxCandidate = Math.min(largestCandyPile, (totalCandies / k) | 0);
  let minCandidate = 1;
  let bestCandiesPerChild = 0;

  // Binary search to find the maximum candies each child can get
  while (minCandidate <= maxCandidate) {
    const midCandies = ((minCandidate + maxCandidate) / 2) | 0;
    let childrenServed = 0;

    // Calculate how many children can be served with midCandies per child
    for (let i = 0; i < n; i++) {
      childrenServed += (candies[i] / midCandies) | 0;
      if (childrenServed >= k) {
        break;
      }
    }

    if (childrenServed >= k) {
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
