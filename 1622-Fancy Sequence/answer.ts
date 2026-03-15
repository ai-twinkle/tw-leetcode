const MODULO = 1000000007n;
const MAX_OPERATION_COUNT = 100000;

// Precomputed modular inverses for 1..100.
const MULTIPLICATIVE_INVERSES = new Array<bigint>(101);

for (let value = 1; value <= 100; value += 1) {
  MULTIPLICATIVE_INVERSES[value] = powerModulo(BigInt(value), MODULO - 2n);
}

/**
 * Computes base^exponent modulo MODULO.
 * @param base The base value.
 * @param exponent The exponent value.
 * @return The modular power result.
 */
function powerModulo(base: bigint, exponent: bigint): bigint {
  let result = 1n;
  let currentBase = base;
  let currentExponent = exponent;

  while (currentExponent > 0n) {
    if (currentExponent % 2n === 1n) {
      result = (result * currentBase) % MODULO;
    }

    currentBase = (currentBase * currentBase) % MODULO;
    currentExponent /= 2n;
  }

  return result;
}

class Fancy {
  private readonly normalizedValues = new Int32Array(MAX_OPERATION_COUNT);

  private totalLength = 0;
  private resetLength = 0;
  private activeValueCount = 0;

  private currentMultiplier = 1n;
  private currentIncrement = 0n;
  private currentInverseMultiplier = 1n;

  constructor() {

  }

  /**
   * Appends a value to the end of the sequence.
   * @param val The value to append.
   */
  append(val: number): void {
    // Convert the appended value back to the normalized space.
    let normalizedValue =
      (BigInt(val) - this.currentIncrement + MODULO) % MODULO;

    normalizedValue =
      (normalizedValue * this.currentInverseMultiplier) % MODULO;

    this.normalizedValues[this.activeValueCount] = Number(normalizedValue);
    this.activeValueCount += 1;
    this.totalLength += 1;
  }

  /**
   * Adds a value to all existing elements.
   * @param inc The increment applied to all elements.
   */
  addAll(inc: number): void {
    this.currentIncrement += BigInt(inc);
    this.currentIncrement %= MODULO;
  }

  /**
   * Multiplies all existing elements by a value.
   * @param m The multiplier applied to all elements.
   */
  multAll(m: number): void {
    if (m === 0) {
      // All existing values become 0, so start a new generation.
      this.resetLength = this.totalLength;
      this.activeValueCount = 0;
      this.currentMultiplier = 1n;
      this.currentIncrement = 0n;
      this.currentInverseMultiplier = 1n;
      return;
    }

    const multiplier = BigInt(m);

    this.currentMultiplier = (this.currentMultiplier * multiplier) % MODULO;
    this.currentIncrement = (this.currentIncrement * multiplier) % MODULO;
    this.currentInverseMultiplier =
      (this.currentInverseMultiplier * MULTIPLICATIVE_INVERSES[m]) % MODULO;
  }

  /**
   * Gets the value at the given index.
   * @param idx The target index.
   * @return The current value at the index, or -1 if out of range.
   */
  getIndex(idx: number): number {
    if (idx >= this.totalLength) {
      return -1;
    }

    // Values before the last zero-multiplication all share the same value now.
    if (idx < this.resetLength) {
      return Number(this.currentIncrement);
    }

    const normalizedValue = BigInt(this.normalizedValues[idx - this.resetLength]);
    return Number(
      (normalizedValue * this.currentMultiplier + this.currentIncrement) % MODULO
    );
  }
}

/**
 * Your Fancy object will be instantiated and called as such:
 * var obj = new Fancy()
 * obj.append(val)
 * obj.addAll(inc)
 * obj.append(val)
 * obj.multAll(m)
 * var param_4 = obj.getIndex(idx)
 */
