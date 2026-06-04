function earliestFinishTime(
  landStartTime: number[],
  landDuration: number[],
  waterStartTime: number[],
  waterDuration: number[]
): number {
  const landCount = landStartTime.length;
  const waterCount = waterStartTime.length;

  // Pass over land rides: the smallest land finish is the only relevant value for the land-first ordering
  let minimumLandFinish = landStartTime[0] + landDuration[0];
  for (let landIndex = 1; landIndex < landCount; landIndex++) {
    const finishMoment = landStartTime[landIndex] + landDuration[landIndex];
    if (finishMoment < minimumLandFinish) {
      minimumLandFinish = finishMoment;
    }
  }

  // Single pass over water rides: combine "smallest water finish" with "best land-first candidate"
  const firstWaterOpen = waterStartTime[0];
  let minimumWaterFinish = firstWaterOpen + waterDuration[0];
  const firstBoardWater = minimumLandFinish > firstWaterOpen ? minimumLandFinish : firstWaterOpen;
  let bestFinish = firstBoardWater + waterDuration[0];
  for (let waterIndex = 1; waterIndex < waterCount; waterIndex++) {
    const waterOpen = waterStartTime[waterIndex];
    const waterFinish = waterOpen + waterDuration[waterIndex];
    // Cache the minimum water finish for the second land pass
    if (waterFinish < minimumWaterFinish) {
      minimumWaterFinish = waterFinish;
    }
    // Board water after whichever happens later: smallest land finish or this ride's opening
    const boardMoment = minimumLandFinish > waterOpen ? minimumLandFinish : waterOpen;
    const candidate = boardMoment + waterDuration[waterIndex];
    if (candidate < bestFinish) {
      bestFinish = candidate;
    }
  }

  // Second pass over land rides: evaluate water-first candidates against the cached minimum water finish
  for (let landIndex = 0; landIndex < landCount; landIndex++) {
    const landOpen = landStartTime[landIndex];
    const boardMoment = minimumWaterFinish > landOpen ? minimumWaterFinish : landOpen;
    const candidate = boardMoment + landDuration[landIndex];
    if (candidate < bestFinish) {
      bestFinish = candidate;
    }
  }

  return bestFinish;
}
