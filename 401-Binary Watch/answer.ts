// Bit counts for 0...63 (covers hours 0...11 and minutes 0...59)
const BIT_COUNT_0_TO_63 = (() => {
  const table = new Uint8Array(64);
  for (let value = 1; value < 64; value++) {
    table[value] = (table[value >> 1] + (value & 1)) as number;
  }
  return table;
})();

// "00"..."59"
const MINUTE_TEXT_0_TO_59 = (() => {
  const table = new Array<string>(60);
  for (let minute = 0; minute < 60; minute++) {
    table[minute] = minute < 10 ? "0" + minute : "" + minute;
  }
  return table;
})();

// Precomputed results for turnedOn = 0...10
const TIMES_BY_LED_COUNT = (() => {
  const buckets = Array.from({ length: 11 }, () => [] as string[]);

  for (let hour = 0; hour < 12; hour++) {
    const hourBits = BIT_COUNT_0_TO_63[hour];
    for (let minute = 0; minute < 60; minute++) {
      buckets[hourBits + BIT_COUNT_0_TO_63[minute]].push(
        hour + ":" + MINUTE_TEXT_0_TO_59[minute]
      );
    }
  }

  return buckets;
})();

/**
 * Return all possible times on a binary watch with exactly `turnedOn` LEDs on.
 * @param turnedOn - Number of LEDs that are currently on.
 * @returns All valid times the watch could represent.
 */
function readBinaryWatch(turnedOn: number): string[] {
  // O(1) query from precomputed buckets
  return TIMES_BY_LED_COUNT[turnedOn];
}
