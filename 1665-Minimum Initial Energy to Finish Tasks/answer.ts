function minimumEffort(tasks: number[][]): number {
  const taskCount = tasks.length;

  // Fast path for a single task: answer is just its minimum requirement.
  if (taskCount === 1) {
    return tasks[0][1];
  }

  // Pack each task into one float: gap * 2^28 + minimum * 2^14 + actual.
  // Sorting ascending then iterating in reverse gives gap-descending order
  // without paying for a JS comparator callback.
  const packed = new Float64Array(taskCount);
  const SHIFT_MIN = 16384;        // 2^14, enough for values up to 10^4
  const SHIFT_GAP = 268435456;    // 2^28

  for (let index = 0; index < taskCount; index++) {
    const currentTask = tasks[index];
    const actual = currentTask[0];
    const minimum = currentTask[1];
    const gap = minimum - actual;
    packed[index] = gap * SHIFT_GAP + minimum * SHIFT_MIN + actual;
  }

  // Native typed-array sort (ascending) — much faster than Array.sort with a comparator.
  packed.sort();

  // Walk in reverse (largest gap first) accumulating actual costs, tracking
  // the maximum (prefix_actual_sum + minimum) which is the minimum initial energy needed.
  let prefixActualSum = 0;
  let minimumInitialEnergy = 0;

  for (let index = taskCount - 1; index >= 0; index--) {
    const value = packed[index];
    // Decode the lower 28 bits which hold (minimum * SHIFT_MIN + actual).
    const lower = value % SHIFT_GAP;
    const minimum = (lower / SHIFT_MIN) | 0;
    const actual = lower - minimum * SHIFT_MIN;

    const requiredEnergy = prefixActualSum + minimum;
    if (requiredEnergy > minimumInitialEnergy) {
      minimumInitialEnergy = requiredEnergy;
    }
    prefixActualSum += actual;
  }

  return minimumInitialEnergy;
}
