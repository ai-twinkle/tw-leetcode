/* Upper bound of the input given by the constraints (1 <= n <= 1e5). */
const MAXIMUM_STONES = 100000;

/**
 * Precomputed outcome for every pile size in [0, MAXIMUM_STONES].
 * A value of 1 marks a winning position for the player to move, 0 marks a losing one.
 * @returns The lookup table used to answer every query in O(1).
 */
const winningPosition = (function (): Uint8Array {
  const table = new Uint8Array(MAXIMUM_STONES + 1);
  /* Scanning upward, a position still unmarked is unreachable from any losing
     position, which means every move from it leads to a winning position. */
  for (let position = 0; position <= MAXIMUM_STONES; position++) {
    if (table[position] !== 0) {
      continue;
    }
    /* Adding any square number to a losing position produces a winning position. */
    let square = 1;
    let oddStep = 3;
    let target = position + square;
    while (target <= MAXIMUM_STONES) {
      table[target] = 1;
      /* Advance to the next perfect square without any multiplication. */
      square += oddStep;
      oddStep += 2;
      target = position + square;
    }
  }
  return table;
})();

/**
 * Determines whether Alice, who moves first, wins the stone game.
 * @param n The initial number of stones in the pile.
 * @returns True when Alice wins with optimal play, false otherwise.
 */
function winnerSquareGame(n: number): boolean {
  return winningPosition[n] === 1;
}
