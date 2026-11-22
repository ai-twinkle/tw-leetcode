function checkString(s: string): boolean {
  // Any 'a' that follows a 'b' forces the adjacent pair "ba" to exist somewhere
  return !s.includes("ba");
}
