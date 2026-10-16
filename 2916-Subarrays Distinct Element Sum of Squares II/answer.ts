/**
 * Walks the live last-occurrence positions directly through a doubly linked list.
 * Fits arrays whose repeats are close together or rare, where each walk is short.
 *
 * @param previousIndex - For every index, the previous index holding the same value, or -1.
 * @param length - Number of elements.
 * @returns The sum of squared distinct counts modulo 10^9 + 7.
 */
function sumByLiveWalk(previousIndex: Int32Array, length: number): number {
  const modulo = 1000000007;
  // Squared sums stay exact below 2^53, so reduce only when nearing this bound
  const reduceLimit = 4000000000000000;
  const previousLive = new Int32Array(length + 2);
  const nextLive = new Int32Array(length + 2);
  let highestLive = -1;
  let squareSum = 0;
  let liveSum = 0;
  let pending = 0;
  let answer = 0;

  for (let index = 0; index < length; index++) {
    const previous = previousIndex[index];

    if (previous < 0) {
      // A brand new value lifts every left endpoint, so the running totals suffice
      squareSum += 2 * liveSum + (index + 1);
      liveSum += index + 1;
    } else {
      // Only left endpoints after the previous copy gain one distinct value
      let widthSum = 0;
      for (let live = highestLive; live > previous; live = previousLive[live + 1] - 1) {
        widthSum += live - previous;
      }
      squareSum += 2 * widthSum + (index - previous);
      liveSum += index - previous;

      // The previous copy stops being a last occurrence
      const linkBefore = previousLive[previous + 1];
      const linkAfter = nextLive[previous + 1];
      if (linkAfter > 0) {
        previousLive[linkAfter] = linkBefore;
      }
      if (linkBefore > 0) {
        nextLive[linkBefore] = linkAfter;
      }
      if (highestLive === previous) {
        highestLive = linkBefore - 1;
      }
    }

    // The current index becomes the newest last occurrence
    previousLive[index + 1] = highestLive + 1;
    nextLive[index + 1] = 0;
    if (highestLive >= 0) {
      nextLive[highestLive + 1] = index + 1;
    }
    highestLive = index;

    pending += squareSum;
    if (pending > reduceLimit) {
      answer = (answer + pending % modulo) % modulo;
      pending = 0;
    }
  }

  return (answer + pending % modulo) % modulo;
}

/**
 * Answers the same per-step aggregate with one Fenwick tree over reversed positions,
 * each live position contributing (position + 1) * 2^17 + 1 so sum and count ride together.
 * Fits arrays with many widely spaced repeats, where a walk would be long.
 *
 * @param previousIndex - For every index, the previous index holding the same value, or -1.
 * @param length - Number of elements.
 * @returns The sum of squared distinct counts modulo 10^9 + 7.
 */
function sumByFenwick(previousIndex: Int32Array, length: number): number {
  const modulo = 1000000007;
  // Packs a position and a unit counter into one exact float64 (positions < 2^17)
  const countScale = 131072;
  const reduceLimit = 4000000000000000;
  const tree = new Float64Array(length + 1);
  let squareSum = 0;
  let liveSum = 0;
  let pending = 0;
  let answer = 0;

  for (let index = 0; index < length; index++) {
    const previous = previousIndex[index];

    if (previous < 0) {
      // First occurrence: the maintained total already covers every left endpoint
      squareSum += 2 * liveSum + (index + 1);
      liveSum += index + 1;
      const insertion = (index + 1) * countScale + 1;
      for (let node = length - index; node <= length; node += node & -node) {
        tree[node] += insertion;
      }
    } else {
      if (previous === index - 1) {
        // An immediate repeat leaves nothing live beyond it, so only [index, index] is new
        squareSum += 1;
      } else {
        // Aggregate live positions above previous: one pass yields sum and count
        let packed = 0;
        for (let node = length - previous - 1; node > 0; node -= node & -node) {
          packed += tree[node];
        }
        const liveCount = packed % countScale;
        const positionSum = (packed - liveCount) / countScale;
        // Each affected distinct count d becomes d + 1, so d^2 grows by 2d + 1
        squareSum += 2 * (positionSum - (previous + 1) * liveCount) + (index - previous);
      }
      liveSum += index - previous;

      // Retire previous and enter index; above the point where both climbing paths
      // meet the counts cancel and only the position difference travels on
      let risingNode = length - index;
      let fallingNode = length - previous;
      const insertion = (index + 1) * countScale + 1;
      const removal = -((previous + 1) * countScale + 1);
      while (risingNode !== fallingNode) {
        if (risingNode < fallingNode) {
          tree[risingNode] += insertion;
          risingNode += risingNode & -risingNode;
        } else {
          tree[fallingNode] += removal;
          fallingNode += fallingNode & -fallingNode;
          if (fallingNode > length) {
            fallingNode = risingNode;
            break;
          }
        }
      }
      const mergedDelta = (index - previous) * countScale;
      for (let node = risingNode; node <= length; node += node & -node) {
        tree[node] += mergedDelta;
      }
    }

    pending += squareSum;
    if (pending > reduceLimit) {
      answer = (answer + pending % modulo) % modulo;
      pending = 0;
    }
  }

  return (answer + pending % modulo) % modulo;
}

/**
 * Sums the squares of the distinct counts of every subarray.
 *
 * @param nums - Values in the range [1, 10^5], at most 10^5 of them.
 * @returns The sum of squared distinct counts modulo 10^9 + 7.
 */
function sumCounts(nums: number[]): number {
  const length = nums.length;

  // Size the occurrence table to the real value range so small inputs stay cheap
  let maximumValue = 0;
  for (let index = 0; index < length; index++) {
    if (nums[index] > maximumValue) {
      maximumValue = nums[index];
    }
  }

  // One prescan turns value lookups into a sequential previous-index array and
  // measures how much work the walking engine would need
  const lastSeen = new Int32Array(maximumValue + 1);
  const previousIndex = new Int32Array(length);
  let distinctTotal = 0;
  let duplicateTotal = 0;
  let gapTotal = 0;
  for (let index = 0; index < length; index++) {
    const value = nums[index];
    const previous = lastSeen[value] - 1;
    lastSeen[value] = index + 1;
    previousIndex[index] = previous;
    if (previous < 0) {
      distinctTotal++;
    } else {
      duplicateTotal++;
      gapTotal += index - previous;
    }
  }

  // Each walk visits at most min(gap, distinct values) nodes, so both products bound its
  // cost; 40n is the measured crossover against the Fenwick engine
  const walkBudget = 40 * length;
  if (gapTotal <= walkBudget || duplicateTotal * distinctTotal <= walkBudget) {
    return sumByLiveWalk(previousIndex, length);
  }

  return sumByFenwick(previousIndex, length);
}
