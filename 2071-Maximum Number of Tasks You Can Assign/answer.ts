function maxTaskAssign(tasks: number[], workers: number[], pills: number, strength: number): number {
  // 1. Cache lengths
  const taskCount = tasks.length;
  const workerCount = workers.length;

  // 2. Sort into typed arrays (numeric sort)
  const sortedTasks = new Uint32Array(tasks);
  sortedTasks.sort();
  const sortedWorkers = new Uint32Array(workers);
  sortedWorkers.sort();

  // 3. Special case: no effective pills → simple two-pointer greedy
  if (pills === 0 || strength === 0) {
    let taskPtr = taskCount - 1;
    let workerPtr = workerCount - 1;
    let completed = 0;
    while (taskPtr >= 0 && workerPtr >= 0) {
      if (sortedWorkers[workerPtr] >= sortedTasks[taskPtr]) {
        completed++;
        workerPtr--;
        taskPtr--;
      } else {
        taskPtr--;
      }
    }
    return completed;
  }

  // 4. Precompute boosted strengths (still sorted ascending)
  const boostedWorkers = new Uint32Array(workerCount);
  for (let i = 0; i < workerCount; i++) {
    boostedWorkers[i] = sortedWorkers[i] + strength;
  }

  // 5. Special case: enough pills to boost every worker → greedy on boosted only
  if (pills >= workerCount) {
    let taskPtr = taskCount - 1;
    let boostPtr = workerCount - 1;
    let completed = 0;
    while (taskPtr >= 0 && boostPtr >= 0) {
      if (boostedWorkers[boostPtr] >= sortedTasks[taskPtr]) {
        completed++;
        boostPtr--;
        taskPtr--;
      } else {
        taskPtr--;
      }
    }
    return completed;
  }

  // 6. Prepare for binary-search + greedy check
  const candidateBuffer = new Uint32Array(workerCount);
  const requirements = sortedTasks;
  const originals    = sortedWorkers;
  const boosted      = boostedWorkers;

  let low = 0;
  let high = Math.min(taskCount, workerCount);
  let best = 0;

  // 7. Binary search for maximum assignable count
  while (low <= high) {
    const trialCount = (low + high) >>> 1;
    if (trialCount === 0) {
      best = 0;
      low = 1;
      continue;
    }

    // Greedy feasibility test for 'trialCount' easiest tasks
    const windowStart = workerCount - trialCount;
    let workerPtr = workerCount - 1;
    let head = 0;
    let tail = 0;
    let remainingPills = pills;
    let feasible = true;

    // Assign tasks from hardest (of the easiest 'trialCount') down
    for (let taskIdx = trialCount - 1; taskIdx >= 0; taskIdx--) {
      const need = requirements[taskIdx];

      // Enqueue all workers in the window whose boosted strength ≥ need
      while (workerPtr >= windowStart && boosted[workerPtr] >= need) {
        candidateBuffer[tail++] = originals[workerPtr--];
      }

      // No candidates → fail
      if (head === tail) {
        feasible = false;
        break;
      }

      // If the strongest unboosted candidate suffices, use them
      if (candidateBuffer[head] >= need) {
        head++;
      } else {
        // Otherwise boost the weakest
        tail--;
        if (--remainingPills < 0) {
          feasible = false;
          break;
        }
      }
    }

    if (feasible) {
      best = trialCount;
      low = trialCount + 1;
    } else {
      high = trialCount - 1;
    }
  }

  return best;
}
