class Spreadsheet {
  private static readonly CODE_A = 65;    // 'A'
  private static readonly CODE_0 = 48;    // '0'
  private static readonly CODE_9 = 57;    // '9'
  private static readonly CODE_PLUS = 43; // '+'

  private readonly totalColumns = 26;
  private readonly grid: Int32Array;         // Flat row-major grid: [row * 26 + col]
  private readonly rowBaseIndex: Int32Array; // rowBaseIndex[r] = r * 26

  /**
   * Initialize a spreadsheet with 26 columns (A..Z) and the specified number of rows.
   * All cells are zero-initialized.
   *
   * @param rows Total number of rows.
   */
  constructor(rows: number) {
    this.grid = new Int32Array(rows * this.totalColumns); // Zero-filled

    // Precompute row * 26 to avoid repeated multiplication in hot paths
    this.rowBaseIndex = new Int32Array(rows);
    let runningBase = 0;
    for (let row = 0; row < rows; row++) {
      this.rowBaseIndex[row] = runningBase;
      runningBase += this.totalColumns;
    }
  }

  /**
   * Convert a cell reference like "A1" or "Z999" to a flat index in the grid.
   * This avoids substring creation and parseInt.
   *
   * @param cell Cell reference string in the form [A-Z][1..].
   * @returns Flat index into the backing Int32Array.
   */
  private computeIndexFromCell(cell: string): number {
    // Column letter is the first char
    const columnIndex = cell.charCodeAt(0) - Spreadsheet.CODE_A;

    // Parse row digits (1-indexed externally)
    let rowNumber = 0;
    for (let i = 1; i < cell.length; i++) {
      rowNumber = (rowNumber * 10) + (cell.charCodeAt(i) - Spreadsheet.CODE_0);
    }

    // Convert to 0-indexed row, then add column
    return this.rowBaseIndex[rowNumber - 1] + columnIndex;
  }

  /**
   * Set the value of a specific cell.
   *
   * @param cell Cell reference, e.g., "A1".
   * @param value Non-negative integer up to 1e5.
   */
  setCell(cell: string, value: number): void {
    this.grid[this.computeIndexFromCell(cell)] = value | 0; // Ensure int32
  }

  /**
   * Reset a specific cell to 0.
   *
   * @param cell Cell reference, e.g., "C7".
   */
  resetCell(cell: string): void {
    this.grid[this.computeIndexFromCell(cell)] = 0;
  }

  /**
   * Evaluate an operand in-place without allocations.
   * Operand is either a non-negative integer or a cell reference [A-Z][1..].
   *
   * @param source Full formula string.
   * @param start Start index (inclusive).
   * @param end End index (exclusive).
   * @returns Numeric value of the operand.
   */
  private evaluateOperand(source: string, start: number, end: number): number {
    // Check first character: digit => parse number; otherwise treat as cell reference
    const firstCode = source.charCodeAt(start);

    if (firstCode >= Spreadsheet.CODE_0 && firstCode <= Spreadsheet.CODE_9) {
      // Parse integer value without substring/parseInt
      let numericValue = 0;
      for (let i = start; i < end; i++) {
        numericValue = (numericValue * 10) + (source.charCodeAt(i) - Spreadsheet.CODE_0);
      }
      return numericValue | 0;
    } else {
      // Parse cell: [A-Z] + digits
      const columnIndex = firstCode - Spreadsheet.CODE_A;

      let rowNumber = 0;
      for (let i = start + 1; i < end; i++) {
        rowNumber = (rowNumber * 10) + (source.charCodeAt(i) - Spreadsheet.CODE_0);
      }

      const flatIndex = this.rowBaseIndex[rowNumber - 1] + columnIndex;
      return this.grid[flatIndex];
    }
  }

  /**
   * Evaluate a formula of the form "=X+Y" with X and Y as cell refs or non-negative integers.
   * Performs a single pass to find '+', then parses both operands in place.
   *
   * @param formula Formula string, always in the format "=X+Y".
   * @returns The computed sum.
   */
  getValue(formula: string): number {
    // Find '+' once without allocating substrings
    let plusPosition = -1;
    for (let i = 1; i < formula.length; i++) {
      if (formula.charCodeAt(i) === Spreadsheet.CODE_PLUS) {
        plusPosition = i;
        break;
      }
    }

    // Evaluate left operand: [1, plusPosition)
    const leftValue = this.evaluateOperand(formula, 1, plusPosition);

    // Evaluate right operand: (plusPosition + 1, end)
    const rightValue = this.evaluateOperand(formula, plusPosition + 1, formula.length);

    // Single addition on int32s
    return (leftValue + rightValue) | 0;
  }
}

/**
 * Your Spreadsheet object will be instantiated and called as such:
 * var obj = new Spreadsheet(rows)
 * obj.setCell(cell,value)
 * obj.resetCell(cell)
 * var param_3 = obj.getValue(formula)
 */
