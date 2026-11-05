function findTheDistanceValue(arr1: number[], arr2: number[], d: number): number {
  const arr1Length = arr1.length;
  const arr2Length = arr2.length;
  const windowWidth = d << 1;
  let distanceValue = 0;

  for (let outerIndex = 0; outerIndex < arr1Length; outerIndex++) {
    const lowerBound = arr1[outerIndex] - d;
    let innerIndex = 0;

    // An unsigned shift turns negative offsets into huge values, so one comparison checks both bounds
    for (; innerIndex < arr2Length; innerIndex++) {
      if (((arr2[innerIndex] - lowerBound) >>> 0) <= windowWidth) {
        break;
      }
    }

    // The scan finished without breaking, so no arr2 value is within d
    if (innerIndex === arr2Length) {
      distanceValue++;
    }
  }

  return distanceValue;
}
