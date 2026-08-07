/** Exponent of the prime 2 contributed by each digit (index 0-9). */
const DIGIT_TWO_EXPONENT = new Int8Array([0, 0, 1, 0, 2, 0, 1, 0, 3, 0]);
/** Exponent of the prime 3 contributed by each digit (index 0-9). */
const DIGIT_THREE_EXPONENT = new Int8Array([0, 0, 0, 1, 0, 0, 1, 0, 0, 2]);
/** Exponent of the prime 5 contributed by each digit (index 0-9). */
const DIGIT_FIVE_EXPONENT = new Int8Array([0, 0, 0, 0, 0, 1, 0, 0, 0, 0]);
/** Exponent of the prime 7 contributed by each digit (index 0-9). */
const DIGIT_SEVEN_EXPONENT = new Int8Array([0, 0, 0, 0, 0, 0, 0, 1, 0, 0]);

const ZERO_CHARACTER_CODE = 48;

/**
 * Minimum amount of digits in 1..9 whose product supplies the requested prime exponents.
 * @param twoExponent required exponent of 2
 * @param threeExponent required exponent of 3
 * @param fiveExponent required exponent of 5
 * @param sevenExponent required exponent of 7
 * @returns the minimal digit count
 */
function minimumDigitCount(
  twoExponent: number,
  threeExponent: number,
  fiveExponent: number,
  sevenExponent: number
): number {
  // Digit 9 supplies two 3s, so an odd exponent leaves one slot holding a single 3.
  const threeDigitCount = (threeExponent + 1) >> 1;
  // That single-3 slot can be upgraded to a 6, absorbing one factor of 2 for free.
  let leftoverTwoExponent = twoExponent - (threeExponent & 1);
  if (leftoverTwoExponent < 0) {
    leftoverTwoExponent = 0;
  }
  // Digit 8 supplies three 2s at once.
  const twoDigitCount = ((leftoverTwoExponent + 2) / 3) | 0;
  // The primes 5 and 7 can only come from the digits 5 and 7 themselves.
  return fiveExponent + sevenExponent + threeDigitCount + twoDigitCount;
}

/**
 * Builds the lexicographically smallest digit string of exactly `slotCount` digits whose
 * product supplies the requested exponents. `slotCount` must equal minimumDigitCount(...),
 * i.e. every slot is mandatory and no digit 1 can appear.
 * @param twoExponent required exponent of 2
 * @param threeExponent required exponent of 3
 * @param fiveExponent required exponent of 5
 * @param sevenExponent required exponent of 7
 * @param slotCount exact number of digits to emit
 * @returns the smallest qualifying digit string
 */
function buildTightTail(
  twoExponent: number,
  threeExponent: number,
  fiveExponent: number,
  sevenExponent: number,
  slotCount: number
): string {
  let tail = "";
  let remainingTwo = twoExponent;
  let remainingThree = threeExponent;
  let remainingFive = fiveExponent;
  let remainingSeven = sevenExponent;

  for (let slotsLeft = slotCount; slotsLeft > 0; slotsLeft--) {
    // Greedily take the smallest digit that still leaves a feasible remainder.
    for (let candidate = 2; candidate <= 9; candidate++) {
      let nextTwo = remainingTwo - DIGIT_TWO_EXPONENT[candidate];
      let nextThree = remainingThree - DIGIT_THREE_EXPONENT[candidate];
      let nextFive = remainingFive - DIGIT_FIVE_EXPONENT[candidate];
      let nextSeven = remainingSeven - DIGIT_SEVEN_EXPONENT[candidate];
      if (nextTwo < 0) {
        nextTwo = 0;
      }
      if (nextThree < 0) {
        nextThree = 0;
      }
      if (nextFive < 0) {
        nextFive = 0;
      }
      if (nextSeven < 0) {
        nextSeven = 0;
      }
      if (minimumDigitCount(nextTwo, nextThree, nextFive, nextSeven) < slotsLeft) {
        tail += String.fromCharCode(ZERO_CHARACTER_CODE + candidate);
        remainingTwo = nextTwo;
        remainingThree = nextThree;
        remainingFive = nextFive;
        remainingSeven = nextSeven;
        break;
      }
    }
  }
  return tail;
}

function smallestNumber(num: string, t: number): string {
  // Strip the only primes a digit product can ever contain.
  let residualTarget = t;
  let targetTwo = 0;
  let targetThree = 0;
  let targetFive = 0;
  let targetSeven = 0;
  while (residualTarget % 2 === 0) {
    residualTarget /= 2;
    targetTwo++;
  }
  while (residualTarget % 3 === 0) {
    residualTarget /= 3;
    targetThree++;
  }
  while (residualTarget % 5 === 0) {
    residualTarget /= 5;
    targetFive++;
  }
  while (residualTarget % 7 === 0) {
    residualTarget /= 7;
    targetSeven++;
  }
  // Any other prime factor can never be produced by digits 1..9.
  if (residualTarget !== 1) {
    return "-1";
  }

  const length = num.length;

  // Single pass: locate the first 0 and accumulate the exponents of the zero-free prefix.
  let firstZeroIndex = length;
  let runningTwo = 0;
  let runningThree = 0;
  let runningFive = 0;
  let runningSeven = 0;
  for (let index = 0; index < length; index++) {
    const digit = num.charCodeAt(index) - ZERO_CHARACTER_CODE;
    if (digit === 0) {
      firstZeroIndex = index;
      break;
    }
    runningTwo += DIGIT_TWO_EXPONENT[digit];
    runningThree += DIGIT_THREE_EXPONENT[digit];
    runningFive += DIGIT_FIVE_EXPONENT[digit];
    runningSeven += DIGIT_SEVEN_EXPONENT[digit];
  }

  // Case 1: num already qualifies as is.
  if (
    firstZeroIndex === length &&
    runningTwo >= targetTwo &&
    runningThree >= targetThree &&
    runningFive >= targetFive &&
    runningSeven >= targetSeven
  ) {
    return num;
  }

  // Case 2: keep a zero-free prefix, bump one digit up, then refill the suffix freely.
  let candidateStart: number;
  if (firstZeroIndex < length) {
    // The 0 itself is the last position whose prefix is still zero-free.
    candidateStart = firstZeroIndex;
  } else {
    candidateStart = length - 1;
    const lastDigit = num.charCodeAt(candidateStart) - ZERO_CHARACTER_CODE;
    runningTwo -= DIGIT_TWO_EXPONENT[lastDigit];
    runningThree -= DIGIT_THREE_EXPONENT[lastDigit];
    runningFive -= DIGIT_FIVE_EXPONENT[lastDigit];
    runningSeven -= DIGIT_SEVEN_EXPONENT[lastDigit];
  }

  // Scanning right to left keeps the longest possible prefix, which yields the smallest result.
  for (let index = candidateStart; index >= 0; index--) {
    const digit = num.charCodeAt(index) - ZERO_CHARACTER_CODE;
    if (digit < 9) {
      const freeSlots = length - 1 - index;
      let neededTwo = targetTwo - runningTwo;
      let neededThree = targetThree - runningThree;
      let neededFive = targetFive - runningFive;
      let neededSeven = targetSeven - runningSeven;
      if (neededTwo < 0) {
        neededTwo = 0;
      }
      if (neededThree < 0) {
        neededThree = 0;
      }
      if (neededFive < 0) {
        neededFive = 0;
      }
      if (neededSeven < 0) {
        neededSeven = 0;
      }
      // With t <= 1e14 at most 20 digits are ever required, so far-left positions
      // succeed on their very first candidate and this inner loop stays O(1) overall.
      for (let candidate = digit + 1; candidate <= 9; candidate++) {
        let restTwo = neededTwo - DIGIT_TWO_EXPONENT[candidate];
        let restThree = neededThree - DIGIT_THREE_EXPONENT[candidate];
        let restFive = neededFive - DIGIT_FIVE_EXPONENT[candidate];
        let restSeven = neededSeven - DIGIT_SEVEN_EXPONENT[candidate];
        if (restTwo < 0) {
          restTwo = 0;
        }
        if (restThree < 0) {
          restThree = 0;
        }
        if (restFive < 0) {
          restFive = 0;
        }
        if (restSeven < 0) {
          restSeven = 0;
        }
        const requiredDigits = minimumDigitCount(restTwo, restThree, restFive, restSeven);
        if (requiredDigits <= freeSlots) {
          // Pad with 1s first, push the mandatory heavy digits to the very end.
          return (
            num.slice(0, index) +
            String.fromCharCode(ZERO_CHARACTER_CODE + candidate) +
            "1".repeat(freeSlots - requiredDigits) +
            buildTightTail(restTwo, restThree, restFive, restSeven, requiredDigits)
          );
        }
      }
    }
    // Roll the running prefix sums one position to the left.
    if (index > 0) {
      const previousDigit = num.charCodeAt(index - 1) - ZERO_CHARACTER_CODE;
      runningTwo -= DIGIT_TWO_EXPONENT[previousDigit];
      runningThree -= DIGIT_THREE_EXPONENT[previousDigit];
      runningFive -= DIGIT_FIVE_EXPONENT[previousDigit];
      runningSeven -= DIGIT_SEVEN_EXPONENT[previousDigit];
    }
  }

  // Case 3: no number of the same length works, so grow by at least one digit.
  const totalRequired = minimumDigitCount(targetTwo, targetThree, targetFive, targetSeven);
  let answerLength = length + 1;
  if (totalRequired > answerLength) {
    answerLength = totalRequired;
  }
  return (
    "1".repeat(answerLength - totalRequired) +
    buildTightTail(targetTwo, targetThree, targetFive, targetSeven, totalRequired)
  );
}
