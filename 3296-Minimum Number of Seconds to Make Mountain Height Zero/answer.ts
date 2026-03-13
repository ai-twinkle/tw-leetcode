function minNumberOfSeconds(mountainHeight: number, workerTimes: number[]): number {
  const workerCount = workerTimes.length;
  const sortedWorkerTimes = new Uint32Array(workerCount);

  for (let index = 0; index < workerCount; index++) {
    sortedWorkerTimes[index] = workerTimes[index];
  }

  sortedWorkerTimes.sort();

  /**
   * Check whether all workers together can reduce at least `mountainHeight`
   * within `timeLimit` seconds.
   *
   * @param timeLimit - Candidate total time.
   * @returns Whether the mountain can be fully reduced within the time limit.
   */
  function canFinishWithin(timeLimit: number): boolean {
    let reducedHeight = 0;

    for (let index = 0; index < workerCount; index++) {
      const currentWorkerTime = sortedWorkerTimes[index];

      // This worker cannot finish even one unit within the current time limit.
      if (currentWorkerTime > timeLimit) {
        break;
      }

      // Solve currentWorkerTime * x * (x + 1) / 2 <= timeLimit.
      const completedHeight = Math.floor(
        (Math.sqrt(1 + (8 * timeLimit) / currentWorkerTime) - 1) * 0.5
      );

      reducedHeight += completedHeight;

      // Stop early once enough height has been reduced.
      if (reducedHeight >= mountainHeight) {
        return true;
      }
    }

    return false;
  }

  let leftTime = 0;
  let rightTime =
    sortedWorkerTimes[0] * mountainHeight * (mountainHeight + 1) * 0.5;

  while (leftTime < rightTime) {
    const middleTime = leftTime + Math.floor((rightTime - leftTime) * 0.5);

    if (canFinishWithin(middleTime)) {
      rightTime = middleTime;
    } else {
      leftTime = middleTime + 1;
    }
  }

  return leftTime;
}
