function minimumCost(
  cost1: number,
  cost2: number,
  costBoth: number,
  need1: number,
  need2: number
): number {
  // The total cost is convex piecewise-linear in the number of shared items,
  // so the optimum must lie at one of its breakpoints
  const smallerNeed = need1 < need2 ? need1 : need2;
  const largerNeed = need1 < need2 ? need2 : need1;

  // Candidate 1: buy no shared items and cover each requirement separately
  const separateCost = cost1 * need1 + cost2 * need2;

  // Candidate 2: cover the overlapping part with shared items and the rest separately
  const remainingCost = need1 > need2
    ? cost1 * (need1 - need2)
    : cost2 * (need2 - need1);
  const overlapCost = costBoth * smallerNeed + remainingCost;

  // Candidate 3: cover every requirement using shared items only
  const allSharedCost = costBoth * largerNeed;

  // Pick the cheapest among the three breakpoint candidates
  let minimumTotal = separateCost;
  if (overlapCost < minimumTotal) {
    minimumTotal = overlapCost;
  }
  if (allSharedCost < minimumTotal) {
    minimumTotal = allSharedCost;
  }

  return minimumTotal;
}
