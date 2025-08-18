// Precision tolerance for floating-point comparisons
const FLOAT_COMPARISON_TOLERANCE = 1e-6;
const TARGET_RESULT_VALUE = 24;

// Cache results across repeated top-level calls with identical inputs
const initialCardsResultCache = new Map<string, boolean>();

// Scratch buffer for generating memoization keys without allocations
const scratchKeyBuffer: number[] = [0, 0, 0, 0];

function buildInitialCardsKey(cards: readonly number[]): string {
  // Sort to normalize multiset representation
  const sortedCards = cards.slice().sort((x, y) => x - y);
  return sortedCards.join(",");
}

function buildStateKey(stateNumbers: Float64Array, stateLength: number): string {
  // Quantize each number to reduce floating-point noise
  for (let i = 0; i < stateLength; i++) {
    scratchKeyBuffer[i] = Math.round(stateNumbers[i] / FLOAT_COMPARISON_TOLERANCE);
  }

  // Insertion sort to normalize order
  for (let i = 1; i < stateLength; i++) {
    const currentValue = scratchKeyBuffer[i];
    let j = i - 1;

    while (j >= 0 && scratchKeyBuffer[j] > currentValue) {
      scratchKeyBuffer[j + 1] = scratchKeyBuffer[j];
      j--;
    }

    scratchKeyBuffer[j + 1] = currentValue;
  }

  // Build key string
  let keyString = "" + scratchKeyBuffer[0];

  for (let i = 1; i < stateLength; i++) {
    keyString += "," + scratchKeyBuffer[i];
  }

  return keyString;
}

function judgePoint24(cards: number[]): boolean {
  if (cards.length !== 4) {
    return false;
  }

  // Normalize initial state
  const initialKey = buildInitialCardsKey(cards);
  const cachedResult = initialCardsResultCache.get(initialKey);

  if (cachedResult !== undefined) {
    return cachedResult;
  }

  // Typed array for predictable math performance
  const stateNumbers = new Float64Array(4);
  for (let i = 0; i < 4; i++) {
    stateNumbers[i] = cards[i];
  }

  const visitedStates = new Set<string>();

  function searchPossibleResults(stateLength: number): boolean {
    if (stateLength === 1) {
      return Math.abs(stateNumbers[0] - TARGET_RESULT_VALUE) <= FLOAT_COMPARISON_TOLERANCE;
    }

    const stateKey = buildStateKey(stateNumbers, stateLength);

    if (visitedStates.has(stateKey)) {
      return false;
    } else {
      visitedStates.add(stateKey);
    }

    for (let i = 0; i < stateLength; i++) {
      for (let j = i + 1; j < stateLength; j++) {
        const firstNumber = stateNumbers[i];
        const secondNumber = stateNumbers[j];

        // Compact array: replace j with last element
        stateNumbers[j] = stateNumbers[stateLength - 1];

        // Commutative operations
        stateNumbers[i] = firstNumber + secondNumber;
        if (searchPossibleResults(stateLength - 1)) {
          return true;
        }

        stateNumbers[i] = firstNumber * secondNumber;
        if (searchPossibleResults(stateLength - 1)) {
          return true;
        }

        // Non-commutative operations
        stateNumbers[i] = firstNumber - secondNumber;
        if (searchPossibleResults(stateLength - 1)) {
          return true;
        }

        stateNumbers[i] = secondNumber - firstNumber;
        if (searchPossibleResults(stateLength - 1)) {
          return true;
        }

        if (Math.abs(secondNumber) > FLOAT_COMPARISON_TOLERANCE) {
          stateNumbers[i] = firstNumber / secondNumber;
          if (searchPossibleResults(stateLength - 1)) {
            return true;
          }
        }

        if (Math.abs(firstNumber) > FLOAT_COMPARISON_TOLERANCE) {
          stateNumbers[i] = secondNumber / firstNumber;
          if (searchPossibleResults(stateLength - 1)) {
            return true;
          }
        }

        // Restore state
        stateNumbers[i] = firstNumber;
        stateNumbers[j] = secondNumber;
      }
    }

    return false;
  }

  const finalResult = searchPossibleResults(4);
  initialCardsResultCache.set(initialKey, finalResult);
  return finalResult;
}
