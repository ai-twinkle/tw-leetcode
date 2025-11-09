function countOperations(num1: number, num2: number): number {
  // Early exit when either is already zero
  if (num1 === 0 || num2 === 0) {
    return 0;
  }

  let operationCount = 0;

  // Loop until one number becomes zero
  while (num1 !== 0 && num2 !== 0) {
    if (num1 >= num2) {
      // Add how many subtractions we compress into one step
      operationCount += Math.floor(num1 / num2);

      // Keep only the remainder after those subtractions
      num1 = num1 % num2;
    } else {
      // Add how many subtractions we compress into one step
      operationCount += Math.floor(num2 / num1);

      // Keep only the remainder after those subtractions
      num2 = num2 % num1;
    }
  }

  return operationCount;
}
