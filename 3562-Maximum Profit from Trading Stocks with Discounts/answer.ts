function maxProfit(n: number, present: number[], future: number[], hierarchy: number[][], budget: number): number {
  const employeeCount = n;
  const budgetLimit = budget;
  const edgeCount = employeeCount - 1;
  const budgetStride = budgetLimit + 1;

  // A very small value used to mark unreachable states in DP
  const MIN_PROFIT = -1_000_000_000;

  // Store prices in typed arrays for faster indexed access (1-indexed by employee ID)
  const presentPrice = new Int16Array(employeeCount + 1);
  const futurePrice = new Int16Array(employeeCount + 1);
  const discountedPrice = new Int16Array(employeeCount + 1);

  // Initialize price arrays
  for (let employeeId = 1; employeeId <= employeeCount; employeeId++) {
    const presentValue = present[employeeId - 1] | 0;
    const futureValue = future[employeeId - 1] | 0;

    presentPrice[employeeId] = presentValue;
    futurePrice[employeeId] = futureValue;

    // Discounted price is floor(present / 2), bit shift is safe for positive integers
    discountedPrice[employeeId] = presentValue >> 1;
  }

  // Adjacency list head pointer for each boss
  const headEdgeIndex = new Int16Array(employeeCount + 1);
  headEdgeIndex.fill(-1);

  // Edge storage: toEmployee[i] is the child of edge i
  const toEmployee = new Int16Array(edgeCount);

  // nextEdgeIndex forms a linked list of edges for each boss
  const nextEdgeIndex = new Int16Array(edgeCount);

  // Build adjacency list from hierarchy input
  for (let index = 0; index < edgeCount; index++) {
    const bossId = hierarchy[index][0] | 0;

    toEmployee[index] = hierarchy[index][1] | 0;
    nextEdgeIndex[index] = headEdgeIndex[bossId];
    headEdgeIndex[bossId] = index;
  }

  // Stack for iterative DFS traversal to avoid recursion overhead
  const traversalStack = new Int16Array(employeeCount);
  let traversalStackSize = 0;

  // Stores nodes in preorder, later processed in reverse for postorder effect
  const preorderList = new Int16Array(employeeCount);
  let preorderSize = 0;

  // Start traversal from CEO (employee 1)
  traversalStack[traversalStackSize++] = 1;

  // Perform DFS to generate preorder traversal
  while (traversalStackSize > 0) {
    traversalStackSize--;
    const currentNode = traversalStack[traversalStackSize];

    // Record visit order
    preorderList[preorderSize++] = currentNode;

    // Push all direct children into stack
    for (let edge = headEdgeIndex[currentNode]; edge !== -1; edge = nextEdgeIndex[edge]) {
      traversalStack[traversalStackSize++] = toEmployee[edge];
    }
  }

  // The dp stores the best profit for each employee subtree,
  // depending on whether the boss bought stock and how much budget is used
  const dp = new Int32Array((employeeCount + 1) * 2 * budgetStride);
  dp.fill(MIN_PROFIT);


  // Accumulates child contributions when current employee is NOT bought
  const childrenProfitWhenNotBought = new Int32Array(budgetStride);

  // Accumulates child contributions when current employee IS bought
  const childrenProfitWhenBought = new Int32Array(budgetStride);

  // Temporary buffer used during knapsack merging
  const mergeBuffer = new Int32Array(budgetStride);

  // Process nodes bottom-up so children are fully computed first
  for (let postIndex = preorderSize - 1; postIndex >= 0; postIndex--) {
    const employeeId = preorderList[postIndex];

    // Reset child aggregation arrays before merging children
    childrenProfitWhenNotBought.fill(MIN_PROFIT);
    childrenProfitWhenBought.fill(MIN_PROFIT);
    childrenProfitWhenNotBought[0] = 0;
    childrenProfitWhenBought[0] = 0;

    // Iterate through each direct child of the current employee
    for (let edge = headEdgeIndex[employeeId]; edge !== -1; edge = nextEdgeIndex[edge]) {
      const childId = toEmployee[edge];

      // Merge DP assuming current employee is NOT bought
      mergeBuffer.fill(MIN_PROFIT);
      const childBaseNotBought = (childId << 1) * budgetStride;

      // Try all existing budget states from previous children
      for (let spentSoFar = 0; spentSoFar <= budgetLimit; spentSoFar++) {
        const currentProfit = childrenProfitWhenNotBought[spentSoFar];
        if (currentProfit === MIN_PROFIT) {
          continue;
        }

        // Remaining budget that can be allocated to this child
        const remainingBudget = budgetLimit - spentSoFar;

        // Combine child DP states with current aggregation
        for (let childSpent = 0; childSpent <= remainingBudget; childSpent++) {
          const childProfit = dp[childBaseNotBought + childSpent];
          if (childProfit === MIN_PROFIT) {
            continue;
          }

          const totalSpent = spentSoFar + childSpent;
          const totalProfit = currentProfit + childProfit;

          if (totalProfit > mergeBuffer[totalSpent]) {
            mergeBuffer[totalSpent] = totalProfit;
          }
        }
      }

      // Commit merged result for NOT bought case
      childrenProfitWhenNotBought.set(mergeBuffer);

      // Merge DP assuming current employee IS bought
      mergeBuffer.fill(MIN_PROFIT);
      const childBaseBought = childBaseNotBought + budgetStride;

      // Same merge logic but child sees parentBought = true
      for (let spentSoFar = 0; spentSoFar <= budgetLimit; spentSoFar++) {
        const currentProfit = childrenProfitWhenBought[spentSoFar];
        if (currentProfit === MIN_PROFIT) {
          continue;
        }

        const remainingBudget = budgetLimit - spentSoFar;

        for (let childSpent = 0; childSpent <= remainingBudget; childSpent++) {
          const childProfit = dp[childBaseBought + childSpent];
          if (childProfit === MIN_PROFIT) {
            continue;
          }

          const totalSpent = spentSoFar + childSpent;
          const totalProfit = currentProfit + childProfit;

          if (totalProfit > mergeBuffer[totalSpent]) {
            mergeBuffer[totalSpent] = totalProfit;
          }
        }
      }

      // Commit merged result for bought case
      childrenProfitWhenBought.set(mergeBuffer);
    }

    const nodeBaseParentNotBought = (employeeId << 1) * budgetStride;
    const nodeBaseParentBought = nodeBaseParentNotBought + budgetStride;

    // Case: do not buy current employee, profit comes only from children
    for (let spent = 0; spent <= budgetLimit; spent++) {
      const inheritedProfit = childrenProfitWhenNotBought[spent];
      dp[nodeBaseParentNotBought + spent] = inheritedProfit;
      dp[nodeBaseParentBought + spent] = inheritedProfit;
    }

    const normalCost = presentPrice[employeeId];
    const discountedCostValue = discountedPrice[employeeId];

    const normalProfit = (futurePrice[employeeId] - normalCost) | 0;
    const discountedProfit = (futurePrice[employeeId] - discountedCostValue) | 0;

    // Case: parent NOT bought, current employee pays full price
    for (let spent = normalCost; spent <= budgetLimit; spent++) {
      const childrenSpent = spent - normalCost;
      const childrenProfit = childrenProfitWhenBought[childrenSpent];
      if (childrenProfit === MIN_PROFIT) {
        continue;
      }

      const candidateProfit = childrenProfit + normalProfit;
      if (candidateProfit > dp[nodeBaseParentNotBought + spent]) {
        dp[nodeBaseParentNotBought + spent] = candidateProfit;
      }
    }

    // Case: parent bought, current employee uses discounted price
    for (let spent = discountedCostValue; spent <= budgetLimit; spent++) {
      const childrenSpent = spent - discountedCostValue;
      const childrenProfit = childrenProfitWhenBought[childrenSpent];
      if (childrenProfit === MIN_PROFIT) {
        continue;
      }

      const candidateProfit = childrenProfit + discountedProfit;
      if (candidateProfit > dp[nodeBaseParentBought + spent]) {
        dp[nodeBaseParentBought + spent] = candidateProfit;
      }
    }
  }

  // CEO has no parent, so parentBoughtFlag must be 0
  const rootBase = (1 << 1) * budgetStride;
  let bestProfit = 0;

  // Find best achievable profit under budget constraint
  for (let spent = 0; spent <= budgetLimit; spent++) {
    const profitValue = dp[rootBase + spent];
    if (profitValue > bestProfit) {
      bestProfit = profitValue;
    }
  }

  return bestProfit;
}
