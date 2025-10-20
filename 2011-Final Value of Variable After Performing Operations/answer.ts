const PLUS_CHAR_CODE = 43; // ASCII code for '+'

function finalValueAfterOperations(operations: string[]): number {
  let result = 0;
  const length = operations.length;

  for (let index = 0; index < length; index++) {
    // Check the middle character to determine increment or decrement
    if (operations[index].charCodeAt(1) === PLUS_CHAR_CODE) {
      result++;
    } else {
      result--;
    }
  }

  return result;
}
