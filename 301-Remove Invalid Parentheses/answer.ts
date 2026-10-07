const OPEN_PARENTHESIS_CODE = 40;
const CLOSE_PARENTHESIS_CODE = 41;

/** Maximum number of parentheses allowed by the constraints. */
const MAX_PARENTHESES = 20;

/**
 * Builds the lookup table of repeated parenthesis strings.
 *
 * @param character - The parenthesis character to repeat.
 * @returns A table where entry `k` holds the character repeated `k` times.
 */
function buildRunTable(character: string): string[] {
  const table: string[] = new Array(MAX_PARENTHESES + 1);
  let accumulated = '';

  for (let count = 0; count <= MAX_PARENTHESES; count += 1) {
    table[count] = accumulated;
    accumulated += character;
  }

  return table;
}

/**
 * Pre-computed parenthesis runs, so a kept block of `k` identical parentheses
 * is appended in O(1) instead of being rebuilt character by character.
 */
const OPEN_PARENTHESIS_RUNS: string[] = buildRunTable('(');
const CLOSE_PARENTHESIS_RUNS: string[] = buildRunTable(')');

/**
 * Removes the minimum number of invalid parentheses to make the input valid.
 *
 * The string is first compressed into maximal runs: letter blocks (never
 * removable) and blocks of identical parentheses. Because only the *count* of
 * removals inside a run matters, the search branches on "how many" instead of
 * "which ones", which collapses the classic per-character 2^n search into a
 * tiny tree and eliminates nearly all duplicate work.
 *
 * @param s - String containing lowercase letters and parentheses.
 * @returns Every unique valid string obtainable with the minimum removals.
 */
function removeInvalidParentheses(s: string): string[] {
  const length = s.length;

  // Single scan: `balance` ends up as the count of unmatched '(' characters.
  let balance = 0;
  let closeRemovals = 0;

  for (let index = 0; index < length; index += 1) {
    const code = s.charCodeAt(index);

    if (code === OPEN_PARENTHESIS_CODE) {
      balance += 1;
    } else if (code === CLOSE_PARENTHESIS_CODE) {
      if (balance > 0) {
        balance -= 1;
      } else {
        closeRemovals += 1;
      }
    }
  }

  const openRemovals = balance;

  // Already valid: nothing to remove, so the input itself is the only answer.
  if (openRemovals === 0 && closeRemovals === 0) {
    return [s];
  }

  // Run tables: kind 0 = letters, 1 = '(' block, 2 = ')' block.
  const runKinds = new Uint8Array(length);
  const runLengths = new Int32Array(length);
  const runTexts: string[] = new Array(length);
  let runCount = 0;
  let scanIndex = 0;

  while (scanIndex < length) {
    const code = s.charCodeAt(scanIndex);
    let end = scanIndex + 1;

    if (code === OPEN_PARENTHESIS_CODE || code === CLOSE_PARENTHESIS_CODE) {
      // Extend over the identical parentheses that follow.
      while (end < length && s.charCodeAt(end) === code) {
        end += 1;
      }

      runKinds[runCount] = code === OPEN_PARENTHESIS_CODE ? 1 : 2;
    } else {
      // Extend over the letter block, which is always kept intact.
      while (end < length) {
        const nextCode = s.charCodeAt(end);

        if (nextCode === OPEN_PARENTHESIS_CODE || nextCode === CLOSE_PARENTHESIS_CODE) {
          break;
        }

        end += 1;
      }

      runKinds[runCount] = 0;
      runTexts[runCount] = s.substring(scanIndex, end);
    }

    runLengths[runCount] = end - scanIndex;
    runCount += 1;
    scanIndex = end;
  }

  // Suffix totals drive the feasibility pruning of the remaining budgets.
  const suffixOpens = new Int32Array(runCount + 1);
  const suffixCloses = new Int32Array(runCount + 1);

  for (let runIndex = runCount - 1; runIndex >= 0; runIndex -= 1) {
    const kind = runKinds[runIndex];

    suffixOpens[runIndex] = suffixOpens[runIndex + 1] + (kind === 1 ? runLengths[runIndex] : 0);
    suffixCloses[runIndex] = suffixCloses[runIndex + 1] + (kind === 2 ? runLengths[runIndex] : 0);
  }

  const uniqueResults = new Set<string>();

  /**
   * Depth-first search over runs, choosing how many parentheses each run keeps.
   *
   * @param runIndex - Index of the run being decided.
   * @param prefix - Valid-so-far text built from the earlier runs.
   * @param openBalance - Number of kept '(' characters still unmatched.
   * @param openBudget - Remaining '(' characters that must still be removed.
   * @param closeBudget - Remaining ')' characters that must still be removed.
   */
  const search = (
    runIndex: number,
    prefix: string,
    openBalance: number,
    openBudget: number,
    closeBudget: number,
  ): void => {
    if (runIndex === runCount) {
      // Budgets are spent and every kept '(' is matched: a minimal answer.
      if (openBalance === 0 && openBudget === 0 && closeBudget === 0) {
        uniqueResults.add(prefix);
      }

      return;
    }

    const kind = runKinds[runIndex];
    const runLength = runLengths[runIndex];
    const nextIndex = runIndex + 1;

    if (kind === 0) {
      search(nextIndex, prefix + runTexts[runIndex], openBalance, openBudget, closeBudget);

      return;
    }

    if (kind === 1) {
      // Removing fewer than this would leave more '(' removals than '(' left.
      const shortage = openBudget - suffixOpens[nextIndex];
      const minimumRemoved = shortage > 0 ? shortage : 0;
      const maximumRemoved = openBudget < runLength ? openBudget : runLength;

      for (let removed = minimumRemoved; removed <= maximumRemoved; removed += 1) {
        const kept = runLength - removed;

        search(
          nextIndex,
          prefix + OPEN_PARENTHESIS_RUNS[kept],
          openBalance + kept,
          openBudget - removed,
          closeBudget,
        );
      }

      return;
    }

    // A ')' block may keep at most `openBalance` characters, and must leave
    // enough ')' in the suffix to cover the outstanding close removals.
    const balanceShortage = runLength - openBalance;
    const suffixShortage = closeBudget - suffixCloses[nextIndex];
    let minimumRemoved = balanceShortage > 0 ? balanceShortage : 0;

    if (suffixShortage > minimumRemoved) {
      minimumRemoved = suffixShortage;
    }

    const maximumRemoved = closeBudget < runLength ? closeBudget : runLength;

    for (let removed = minimumRemoved; removed <= maximumRemoved; removed += 1) {
      const kept = runLength - removed;

      search(
        nextIndex,
        prefix + CLOSE_PARENTHESIS_RUNS[kept],
        openBalance - kept,
        openBudget,
        closeBudget - removed,
      );
    }
  };

  search(0, '', 0, openRemovals, closeRemovals);

  return Array.from(uniqueResults);
}
