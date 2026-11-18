function minChanges(s: string): number {
  const length = s.length;
  let changeCount = 0;

  // Walk aligned pairs only, so the loop runs length / 2 times
  for (let index = 0; index < length; index += 2) {
    // XOR of the two char codes is 1 when they differ and 0 when they match, which avoids a branch
    changeCount += s.charCodeAt(index) ^ s.charCodeAt(index + 1);
  }

  return changeCount;
}
