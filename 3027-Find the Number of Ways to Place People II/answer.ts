function numberOfPairs(points: number[][]): number {
  const totalPoints = points.length;
  if (totalPoints < 2) {
    return 0;
  }

  // Sort by x ascending, then y descending
  points.sort((pointA, pointB) => {
    const deltaX = pointA[0] - pointB[0];
    if (deltaX !== 0) {
      return deltaX;
    }
    return pointB[1] - pointA[1];
  });

  const yCoordinates = new Int32Array(totalPoints);
  for (let index = 0; index < totalPoints; index++) {
    yCoordinates[index] = points[index][1];
  }

  let pairCount = 0;
  const intMinimum = -2147483648;

  for (let indexAlice = 0; indexAlice < totalPoints - 1; indexAlice++) {
    const yAlice = yCoordinates[indexAlice];
    let maximumYAtMostAlice = intMinimum;

    for (let indexBob = indexAlice + 1; indexBob < totalPoints; indexBob++) {
      const yBob = yCoordinates[indexBob];

      if (yBob <= yAlice) {
        if (yBob > maximumYAtMostAlice) {
          pairCount++;
          maximumYAtMostAlice = yBob;

          if (maximumYAtMostAlice === yAlice) {
            break;
          }
        }
      }
    }
  }

  return pairCount;
}
