function earliestFinishTime(
  landStartTime: number[],
  landDuration: number[],
  waterStartTime: number[],
  waterDuration: number[]
): number {
  const landCount = landStartTime.length;
  const waterCount = waterStartTime.length;

  // Earliest possible finish among all land rides — the optimal first ride
  // when going land-then-water, since a later first ride can only delay
  // (never advance) the second ride's boarding moment.
  let earliestLandFinish = landStartTime[0] + landDuration[0];
  for (let i = 1; i < landCount; i++) {
    const finish = landStartTime[i] + landDuration[i];
    if (finish < earliestLandFinish) {
      earliestLandFinish = finish;
    }
  }

  // Earliest possible finish among all water rides — symmetric reasoning.
  let earliestWaterFinish = waterStartTime[0] + waterDuration[0];
  for (let j = 1; j < waterCount; j++) {
    const finish = waterStartTime[j] + waterDuration[j];
    if (finish < earliestWaterFinish) {
      earliestWaterFinish = finish;
    }
  }

  // Option A: land first, then scan water rides for the best follow-up.
  let bestLandThenWater = Infinity;
  for (let j = 0; j < waterCount; j++) {
    const waterOpen = waterStartTime[j];
    // Inline max — avoids Math.max call overhead in the hot loop.
    const board = earliestLandFinish > waterOpen ? earliestLandFinish : waterOpen;
    const finish = board + waterDuration[j];
    if (finish < bestLandThenWater) {
      bestLandThenWater = finish;
    }
  }

  // Option B: water first, then scan land rides for the best follow-up.
  let bestWaterThenLand = Infinity;
  for (let i = 0; i < landCount; i++) {
    const landOpen = landStartTime[i];
    const board = earliestWaterFinish > landOpen ? earliestWaterFinish : landOpen;
    const finish = board + landDuration[i];
    if (finish < bestWaterThenLand) {
      bestWaterThenLand = finish;
    }
  }

  // The global optimum is the better of the two orderings.
  return bestLandThenWater < bestWaterThenLand ? bestLandThenWater : bestWaterThenLand;
}
