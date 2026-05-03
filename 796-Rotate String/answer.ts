function rotateString(s: string, goal: string): boolean {
  // Length mismatch means rotation is impossible - O(1) early rejection
  if (s.length !== goal.length) {
    return false;
  }

  // Empty strings are trivially equal under rotation
  if (s.length === 0) {
    return true;
  }

  // Any rotation of s appears as a substring within s concatenated with itself
  // Using native includes leverages V8's optimized string search (typically Boyer-Moore-Horspool variant)
  return (s + s).includes(goal);
}
