function clearDigits(s: string): string {
  const stack: string[] = [];
  for (const char of s) {
    if (isNaN(parseInt(char))) {
      // If the character is not a digit, push it to the stack
      stack.push(char);
    } else {
      // If the character is a digit, pop the stack
      // This approach will remove the closest non-digit character to the left of the digit
      stack.pop();
    }
  }

  // Join the stack to form the resulting string
  return stack.join('');
}
