/**
 * Single Int32Array partitioned into two 128-slot halves via bit shift.
 * Lower half (0–127) tracks even-index character net frequencies,
 * upper half (128–255) tracks odd-index character net frequencies.
 * Allocated once at module level to avoid per-call GC pressure.
 */
const charFrequency = new Int32Array(256);


function checkStrings(s1: string, s2: string): boolean {
  const stringLength = s1.length;

  // Bit-shift parity into the upper half to partition even/odd with no branch
  for (let index = 0; index < stringLength; index++) {
    const slotBase = (index & 1) << 7;
    charFrequency[slotBase + s1.charCodeAt(index)]++;
    charFrequency[slotBase + s2.charCodeAt(index)]--;
  }

  // Verify balance and reset in a single pass to avoid a second O(256) sweep
  for (let slotIndex = 0; slotIndex < 256; slotIndex++) {
    if (charFrequency[slotIndex] !== 0) {
      charFrequency.fill(0);
      return false;
    }
  }

  charFrequency.fill(0);
  return true;
}
