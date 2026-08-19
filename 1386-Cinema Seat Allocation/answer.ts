/**
 * Builds a lookup table that maps a reserved-seat bitmask of seats 2..9
 * to the number of four-person groups that can still be seated in that row.
 * Bit (seat - 2) is set when the seat is reserved.
 * @returns A 256-entry table indexed by the row bitmask.
 */
function buildGroupsByMaskTable(): Uint8Array {
  const table = new Uint8Array(256);
  for (let mask = 0; mask < 256; mask++) {
    // Left block = seats 2..5, middle block = seats 4..7, right block = seats 6..9.
    const isLeftFree = (mask & 0x0f) === 0;
    const isMiddleFree = (mask & 0x3c) === 0;
    const isRightFree = (mask & 0xf0) === 0;
    if (isLeftFree && isRightFree) {
      table[mask] = 2;
    } else if (isLeftFree || isMiddleFree || isRightFree) {
      table[mask] = 1;
    } else {
      table[mask] = 0;
    }
  }
  return table;
}

/** Precomputed table shared by every call, giving O(1) per-row evaluation. */
const GROUPS_BY_MASK = buildGroupsByMaskTable();

/**
 * Computes the maximum number of four-person groups that can be seated.
 * @param n Number of rows in the cinema.
 * @param reservedSeats Pairs of [row, seat] that are already reserved.
 * @returns The maximum number of four-person groups.
 */
function maxNumberOfFamilies(n: number, reservedSeats: number[][]): number {
  const reservedCount = reservedSeats.length;

  // Open-addressed hash table sized to a power of two, keeping the load factor under 0.5.
  let capacity = 16;
  while (capacity < reservedCount * 2) {
    capacity <<= 1;
  }
  const slotMask = capacity - 1;
  const rowKeys = new Int32Array(capacity);
  const rowSeatMasks = new Uint8Array(capacity);

  // Every untouched row yields 2 groups, so only the loss of touched rows is tracked.
  let unavailableGroups = 0;

  for (let index = 0; index < reservedCount; index++) {
    const reservation = reservedSeats[index];
    const seat = reservation[1];

    // Seats 1 and 10 belong to no block, so they never reduce the answer.
    if (seat === 1 || seat === 10) {
      continue;
    }

    const row = reservation[0];
    const seatBit = 1 << (seat - 2);

    // Fibonacci hashing with an xor-shift to spread the high bits into the slot index.
    const hash = Math.imul(row, 0x9e3779b1);
    let slot = (hash ^ (hash >>> 15)) & slotMask;

    while (true) {
      const key = rowKeys[slot];
      if (key === row) {
        const previousMask = rowSeatMasks[slot];
        const updatedMask = previousMask | seatBit;
        if (updatedMask !== previousMask) {
          rowSeatMasks[slot] = updatedMask;
          // Adjust the running loss by the delta of this row only.
          unavailableGroups += GROUPS_BY_MASK[previousMask] - GROUPS_BY_MASK[updatedMask];
        }
        break;
      }
      if (key === 0) {
        rowKeys[slot] = row;
        rowSeatMasks[slot] = seatBit;
        unavailableGroups += 2 - GROUPS_BY_MASK[seatBit];
        break;
      }
      slot = (slot + 1) & slotMask;
    }
  }

  return 2 * n - unavailableGroups;
}
