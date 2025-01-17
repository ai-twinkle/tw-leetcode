function doesValidArrayExist(derived: number[]): boolean {
  let count = 0;
  for (const x of derived) {
    if (x === 1) {
      count++;
    }
  }
  return count % 2 === 0;
}
