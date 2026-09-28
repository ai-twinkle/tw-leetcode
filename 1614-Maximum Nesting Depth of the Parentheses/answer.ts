function maxDepth(s: string): number {
  let currentDepth = 0;
  let maximumDepth = 0;
  let index = s.length;

  // Walking backwards removes the length comparison against a loop bound
  while (index--) {
    const characterCode = s.charCodeAt(index);

    // ')' is 41: scanning in reverse, a closing bracket opens a level
    if (characterCode === 41) {
      currentDepth++;

      if (currentDepth > maximumDepth) {
        maximumDepth = currentDepth;
      }
    } else if (characterCode === 40) {
      // '(' is 40: closes the level that the matching ')' opened
      currentDepth--;
    }
  }

  return maximumDepth;
}
