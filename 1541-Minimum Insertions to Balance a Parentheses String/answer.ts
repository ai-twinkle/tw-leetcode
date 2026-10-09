function minInsertions(s: string): number {
  const length = s.length;
  let insertions = 0;
  let neededClosings = 0;

  for (let index = 0; index < length; index++) {
    // Compare raw char codes (40 is '('), avoiding per-character string allocation
    if (s.charCodeAt(index) === 40) {
      // An odd debt means the previous '(' got only one ')', so complete it first
      if ((neededClosings & 1) === 1) {
        neededClosings--;
        insertions++;
      }

      neededClosings += 2;
    } else {
      neededClosings--;

      // No open '(' left to consume this ')', so insert a '(' that still owes one ')'
      if (neededClosings < 0) {
        neededClosings = 1;
        insertions++;
      }
    }
  }

  // Every remaining debt unit is one ')' that must be appended
  return insertions + neededClosings;
}
