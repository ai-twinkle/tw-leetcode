function minMaxDifference(num: number): number {
  const s = num.toString();
  const length = s.length;

  // 1. Find the digit to remap for max and for min
  let maxFrom = -1;
  let minFrom = -1;
  for (let i = 0; i < length; i++) {
    const d = s.charCodeAt(i) - 48;
    if (maxFrom < 0 && d !== 9) {
      maxFrom = d;
    }
    if (minFrom < 0 && d !== 0) {
      minFrom = d;
    }
    if (maxFrom >= 0 && minFrom >= 0) {
      break;
    }
  }

  // 2. Build the two results with one pass each, no string replace
  let maxValue = 0;
  let minValue = 0;
  for (let i = 0; i < length; i++) {
    const d = s.charCodeAt(i) - 48;
    maxValue = maxValue * 10 + (d === maxFrom ? 9 : d);
    minValue = minValue * 10 + (d === minFrom ? 0 : d);
  }

  return maxValue - minValue;
}
