function numberOfWays(corridor: string): number {
  const modulo: number = 1000000007;

  let seatCount = 0;
  let plantsBetweenPairs = 0;
  let ways = 1;

  for (let index = 0, length = corridor.length; index < length; index++) {
    const characterCode = corridor.charCodeAt(index);

    if (characterCode === 83) { // 'S'
      seatCount++;

      if (seatCount === 1) {
        continue;
      }

      // When starting a new pair (odd seat index), lock in the divider choices from the plants gap.
      if ((seatCount & 1) === 1) {
        ways = (ways * (plantsBetweenPairs + 1)) % modulo;
        plantsBetweenPairs = 0;
      }
    } else { // 'P'
      if (seatCount > 0 && (seatCount & 1) === 0) {
        plantsBetweenPairs++;
      }
    }
  }

  if (seatCount === 0) {
    return 0;
  }
  if ((seatCount & 1) === 1) {
    return 0;
  }

  return ways;
}
