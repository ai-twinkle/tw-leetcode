function earliestAndLatest(n: number, firstPlayer: number, secondPlayer: number): number[] {
  // dpEarliest[p][l][r] = minimum rounds for p players, firstPlayer at l, secondPlayer at r
  // dpLatest[p][l][r] = maximum rounds for p players, firstPlayer at l, secondPlayer at r
  const dpEarliest: Int8Array[][] = [];
  const dpLatest: Int8Array[][] = [];

  // Pre-allocate memoization tables for all possible states
  for (let playerCount = 0; playerCount <= n; playerCount++) {
    dpEarliest[playerCount] = [];
    dpLatest[playerCount] = [];
    for (let leftPlayerPosition = 0; leftPlayerPosition <= playerCount; leftPlayerPosition++) {
      // Size = playerCount+1 so index matches player numbering
      const size = playerCount + 1;
      dpEarliest[playerCount][leftPlayerPosition] = new Int8Array(size);
      dpEarliest[playerCount][leftPlayerPosition].fill(-1); // -1 means unvisited
      dpLatest[playerCount][leftPlayerPosition] = new Int8Array(size); // default 0
    }
  }

  /**
   * Main DP recursive function.
   * @param currentPlayerCount - number of players in current round
   * @param firstPosition - position of firstPlayer in current round
   * @param secondPosition - position of secondPlayer in current round
   * @returns [earliest, latest] round they can meet
   */
  function computeRounds(
    currentPlayerCount: number,
    firstPosition: number,
    secondPosition: number
  ): [number, number] {
    // If this state has already been calculated, return cached results
    const memoMin = dpEarliest[currentPlayerCount][firstPosition][secondPosition];
    if (memoMin !== -1) {
      return [
        memoMin,
        dpLatest[currentPlayerCount][firstPosition][secondPosition],
      ];
    }

    let earliestRound = Infinity;
    let latestRound = 0;

    // Base case: firstPlayer and secondPlayer are facing each other
    if (firstPosition + secondPosition === currentPlayerCount + 1) {
      // They are paired in this round
      earliestRound = latestRound = 1;

      // Store computed result in memoization table for future reuse
      dpEarliest[currentPlayerCount][firstPosition][secondPosition] = earliestRound;
      dpLatest[currentPlayerCount][firstPosition][secondPosition] = latestRound;
      return [earliestRound, latestRound];
    }

    // Players will proceed to the next round—determine all possible
    // outcomes for other players, as only they can influence round counts.

    // Number of matches in this round
    const halfMatchCount = currentPlayerCount >> 1;
    // Whether the current round has a "bye" (odd number of players)
    const hasBye = (currentPlayerCount & 1) === 1;

    // Count deterministic survivors from each segment (excluding firstPlayer/secondPlayer)
    let leftSegmentSurvivors = 0;    // always advances from the left segment
    let middleSegmentSurvivors = 0;  // from the middle segment (if any)
    let rightSegmentSurvivors = 0;   // from the right segment

    // Count cross-region matches (these can go either way)
    let crossLeftMiddleMatches = 0;   // matches between left/middle
    let crossLeftRightMatches = 0;    // matches between left/right
    let crossMiddleRightMatches = 0;  // matches between middle/right

    // Classify each match and count possible survivor types
    for (let i = 1; i <= halfMatchCount; i++) {
      const j = currentPlayerCount - i + 1;

      // Helper: Determine the segment of player position
      //   0 = strictly left of firstPlayer
      //   1 = firstPlayer's position
      //   2 = strictly between firstPlayer and secondPlayer
      //   3 = secondPlayer's position
      //   4 = strictly right of secondPlayer
      const segmentOf = (playerIndex: number) =>
        playerIndex < firstPosition ? 0
          : playerIndex === firstPosition ? 1
            : playerIndex < secondPosition ? 2
              : playerIndex === secondPosition ? 3
                : 4;

      const segmentA = segmentOf(i);
      const segmentB = segmentOf(j);

      // Skip matches involving either of our targets—they are guaranteed to win!
      if (segmentA === 1 || segmentA === 3 || segmentB === 1 || segmentB === 3) {
        continue;
      }

      // Group pair (i, j) by their segments
      const smallerSegment = segmentA < segmentB ? segmentA : segmentB;
      const largerSegment = segmentA < segmentB ? segmentB : segmentA;

      // Tally "intra-segment" matches (guaranteed survivor)
      if (smallerSegment === 0 && largerSegment === 0) {
        leftSegmentSurvivors++;
      } else if (smallerSegment === 2 && largerSegment === 2) {
        middleSegmentSurvivors++;
      } else if (smallerSegment === 4 && largerSegment === 4) {
        rightSegmentSurvivors++;
      } else if (smallerSegment === 0 && largerSegment === 2) {
        // Tally cross-region matches (choices affect next positions)
        crossLeftMiddleMatches++;
      } else if (smallerSegment === 0 && largerSegment === 4) {
        crossLeftRightMatches++;
      } else if (smallerSegment === 2 && largerSegment === 4) {
        crossMiddleRightMatches++;
      }
    }

    // Handle "bye" (odd number of players): who gets it?
    if (hasBye) {
      const middlePosition = (currentPlayerCount + 1) >> 1;
      const byeSegment = middlePosition < firstPosition ? 0
          : middlePosition === firstPosition ? 1
            : middlePosition < secondPosition ? 2
              : middlePosition === secondPosition ? 3
                : 4;

      // Bye always advances that segment
      if (byeSegment === 0) {
        leftSegmentSurvivors++;
      } else if (byeSegment === 2) {
        middleSegmentSurvivors++;
      } else if (byeSegment === 4) {
        rightSegmentSurvivors++;
      }
      // (Can't be 1 or 3: firstPlayer/secondPlayer always win if in the middle)
    }

    // Now, enumerate all possible ways cross-region matches can resolve.
    // For each, simulate how many from each region advance, update positions,
    // and make a recursive DP call.
    for (let leftMiddleWinners = 0; leftMiddleWinners <= crossLeftMiddleMatches; leftMiddleWinners++) {
      for (let leftRightWinners = 0; leftRightWinners <= crossLeftRightMatches; leftRightWinners++) {
        for (let middleRightWinners = 0; middleRightWinners <= crossMiddleRightMatches; middleRightWinners++) {
          // Survivors for each region
          const survivorsLeft = leftSegmentSurvivors
            + leftMiddleWinners
            + leftRightWinners;

          const survivorsMiddle = middleSegmentSurvivors
            + (crossLeftMiddleMatches - leftMiddleWinners)
            + middleRightWinners;

          const survivorsRight = rightSegmentSurvivors
            + (crossLeftRightMatches - leftRightWinners)
            + (crossMiddleRightMatches - middleRightWinners);

          // Next round: two targets always survive and get relabeled,
          // so survivor counts +2 (for them)
          const nextPlayerCount = survivorsLeft + survivorsMiddle + survivorsRight + 2;
          // Next positions: after sorting, their new positions are as below
          const nextFirstPosition = survivorsLeft + 1;
          const nextSecondPosition = survivorsLeft + survivorsMiddle + 2;

          // Recursive DP call: compute result for this arrangement
          const [subMin, subMax] = computeRounds(
            nextPlayerCount,
            nextFirstPosition,
            nextSecondPosition
          );

          // Aggregate answers over all possible scenarios
          earliestRound = Math.min(earliestRound, subMin + 1);
          latestRound = Math.max(latestRound, subMax + 1);
        }
      }
    }

    // Store computed result in memoization table for future reuse
    dpEarliest[currentPlayerCount][firstPosition][secondPosition] = earliestRound;
    dpLatest[currentPlayerCount][firstPosition][secondPosition] = latestRound;
    return [earliestRound, latestRound];
  }

  // Initial call: start with full n players, both targets at their original positions
  return computeRounds(n, firstPlayer, secondPlayer);
}
