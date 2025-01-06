function minOperations(boxes: string): number[] {
  const n = boxes.length;
  const operations: number[] = new Array(n).fill(0);

  let count = 0;
  let steps = 0;

  // Move from left to right
  for (let i = 0; i < n; i++) {
    operations[i] += steps;
    if (boxes[i] === '1') {
      count++;
    }
    steps += count;
  }

  // Reset count and steps
  count = 0;
  steps = 0;

  // Move from right to left
  for (let i = n - 1; i >= 0; i--) {
    operations[i] += steps;
    if (boxes[i] === '1') {
      count++;
    }
    steps += count;
  }

  return operations;
}