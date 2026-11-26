/** Highest pile size allowed by the constraints */
const MAXIMUM_PILE_SIZE = 50;

/** Pre-computed outcome table: 1 when Alice wins with that pile size, 0 otherwise */
const aliceWinTable = new Uint8Array(MAXIMUM_PILE_SIZE + 1);

/**
 * Simulate the fixed sequence of moves once and mark every pile size Alice wins.
 * @param maximumPileSize - Largest pile size to fill in the table
 */
function buildAliceWinTable(maximumPileSize: number): void {
  let stonesRemovedSoFar = 0;
  let stonesThisTurn = 10;
  let isAliceTurn = true;

  while (stonesThisTurn > 0 && stonesRemovedSoFar <= maximumPileSize) {
    const totalAfterThisTurn = stonesRemovedSoFar + stonesThisTurn;
    const totalAfterNextTurn = totalAfterThisTurn + stonesThisTurn - 1;

    // After an Alice move, every pile that is too small for Bob's next move is a win for Alice
    if (isAliceTurn) {
      const upperBound = Math.min(totalAfterNextTurn - 1, maximumPileSize);
      for (let pileSize = totalAfterThisTurn; pileSize <= upperBound; pileSize++) {
        aliceWinTable[pileSize] = 1;
      }
    }

    stonesRemovedSoFar = totalAfterThisTurn;
    stonesThisTurn--;
    isAliceTurn = !isAliceTurn;
  }
}

buildAliceWinTable(MAXIMUM_PILE_SIZE);

/**
 * Determine whether Alice wins the stone-removal game.
 * @param n - Initial number of stones in the pile
 * @returns True if Alice wins, false otherwise
 */
function canAliceWin(n: number): boolean {
  // O(1) lookup into the pre-computed outcome table
  return aliceWinTable[n] === 1;
}
