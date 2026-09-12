function maximumWeight(intervals: number[][]): number[] {
  const intervalCount = intervals.length;
  const stateCount = intervalCount + 1;
  const maximumPicks = 4;

  // Pack (rightEndpoint, originalIndex) into one exact double so the sort runs
  // as a native numeric typed-array sort instead of a comparator callback.
  const INDEX_SCALE = 1048576;
  const sortedKeys = new Float64Array(intervalCount);
  for (let i = 0; i < intervalCount; i++) {
    sortedKeys[i] = intervals[i][1] * INDEX_SCALE + i;
  }
  sortedKeys.sort();

  // Unpack into flat typed arrays; all later work touches these only.
  const leftBound = new Int32Array(intervalCount);
  const rightBound = new Int32Array(intervalCount);
  const intervalWeight = new Float64Array(intervalCount);
  const originalIndex = new Int32Array(intervalCount);
  for (let i = 0; i < intervalCount; i++) {
    const source = (sortedKeys[i] % INDEX_SCALE) | 0;
    const interval = intervals[source];
    originalIndex[i] = source;
    leftBound[i] = interval[0];
    rightBound[i] = interval[1];
    intervalWeight[i] = interval[2];
  }

  // previousCompatible[i] = how many sorted intervals end strictly before
  // leftBound[i], i.e. the prefix length that can be combined with interval i.
  const previousCompatible = new Int32Array(intervalCount);
  for (let i = 0; i < intervalCount; i++) {
    const target = leftBound[i];
    let low = 0;
    let high = i;
    while (low < high) {
      const middle = (low + high) >> 1;
      if (rightBound[middle] < target) {
        low = middle + 1;
      } else {
        high = middle;
      }
    }
    previousCompatible[i] = low;
  }

  // Flat DP tables: state (picks, prefixLength) -> best weight, list length,
  // and up to four ascending original indices.
  const bestWeight = new Float64Array((maximumPicks + 1) * stateCount);
  const bestLength = new Int8Array((maximumPicks + 1) * stateCount);
  const bestIndices = new Int32Array((maximumPicks + 1) * stateCount * 4);
  const candidateIndices = new Int32Array(4);

  for (let picks = 1; picks <= maximumPicks; picks++) {
    const layerBase = picks * stateCount;
    const lowerBase = layerBase - stateCount;
    for (let i = 0; i < intervalCount; i++) {
      const skipState = layerBase + i;
      const targetState = skipState + 1;
      const sourceState = lowerBase + previousCompatible[i];
      const skipWeight = bestWeight[skipState];
      const takeWeight = bestWeight[sourceState] + intervalWeight[i];
      let useTake = false;
      let candidateLength = 0;

      if (takeWeight >= skipWeight) {
        // Merge the new index into the ascending list of the source state.
        const newIndex = originalIndex[i];
        const sourceLength = bestLength[sourceState];
        const sourceOffset = sourceState << 2;
        let inserted = false;
        for (let k = 0; k < sourceLength; k++) {
          const value = bestIndices[sourceOffset + k];
          if (!inserted && newIndex < value) {
            candidateIndices[candidateLength] = newIndex;
            candidateLength++;
            inserted = true;
          }
          candidateIndices[candidateLength] = value;
          candidateLength++;
        }
        if (!inserted) {
          candidateIndices[candidateLength] = newIndex;
          candidateLength++;
        }

        if (takeWeight > skipWeight) {
          useTake = true;
        } else {
          // Equal weight: keep the lexicographically smaller index list.
          const skipLength = bestLength[skipState];
          const skipOffset = skipState << 2;
          const compareLength = candidateLength < skipLength ? candidateLength : skipLength;
          let decided = false;
          for (let k = 0; k < compareLength; k++) {
            const candidateValue = candidateIndices[k];
            const skipValue = bestIndices[skipOffset + k];
            if (candidateValue !== skipValue) {
              useTake = candidateValue < skipValue;
              decided = true;
              break;
            }
          }
          if (decided === false) {
            useTake = candidateLength < skipLength;
          }
        }
      }

      const targetOffset = targetState << 2;
      if (useTake === true) {
        bestWeight[targetState] = takeWeight;
        bestLength[targetState] = candidateLength;
        for (let k = 0; k < candidateLength; k++) {
          bestIndices[targetOffset + k] = candidateIndices[k];
        }
      } else {
        // Carry the previous state forward unchanged.
        const skipLength = bestLength[skipState];
        const skipOffset = skipState << 2;
        bestWeight[targetState] = skipWeight;
        bestLength[targetState] = skipLength;
        for (let k = 0; k < skipLength; k++) {
          bestIndices[targetOffset + k] = bestIndices[skipOffset + k];
        }
      }
    }
  }

  // The final state already holds the answer in ascending order.
  const finalState = maximumPicks * stateCount + intervalCount;
  const finalLength = bestLength[finalState];
  const finalOffset = finalState << 2;
  const result: number[] = new Array(finalLength);
  for (let k = 0; k < finalLength; k++) {
    result[k] = bestIndices[finalOffset + k];
  }
  return result;
}
