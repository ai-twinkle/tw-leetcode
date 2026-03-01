function minPartitions(n: string): number {
  // The answer equals the largest digit present in n, so check from '9' down to '1'.
  for (let digit = 9; digit > 0; digit--) {
    if (n.includes(`${digit}`)) {
      return digit;
    }
  }

  return 0;
}
