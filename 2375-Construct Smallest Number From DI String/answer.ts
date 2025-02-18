function smallestNumber(pattern: string): string {
  const resultDigits: number[] = []; // Array to accumulate result digits
  const stack: number[] = [];        // Stack to handle decreasing sequences

  // Loop through each index, processing an extra iteration to flush the stack at the end.
  for (let i = 0; i <= pattern.length; i++) {
    // Push the next digit (i + 1) onto the stack.
    stack.push(i + 1);

    // If we reached the end of the pattern or encounter an 'I', flush the stack.
    if (i === pattern.length || pattern[i] === "I") {
      while (stack.length) {
        // Pop digits from the stack (reversing their order) and add to the result array.
        resultDigits.push(stack.pop()!);
      }
    }
  }

  // Convert the array of numbers to a string.
  return resultDigits.join("");
}
