function minimumDeleteSum(s1: string, s2: string): number {
  // Keep the DP width as small as possible (we only store the shorter string's columns).
  let firstString = s1;
  let secondString = s2;

  if (secondString.length > firstString.length) {
    const temporaryString = firstString;
    firstString = secondString;
    secondString = temporaryString;
  }

  const firstLength = firstString.length;
  const secondLength = secondString.length;

  // ASCII codes are guaranteed to be 97..122 (lowercase English letters), so Uint8Array is sufficient.
  const secondAsciiCodes = new Uint8Array(secondLength);
  let totalAsciiSumSecond = 0;

  for (let index = 0; index < secondLength; index++) {
    const asciiCode = secondString.charCodeAt(index);
    secondAsciiCodes[index] = asciiCode;
    totalAsciiSumSecond += asciiCode;
  }

  // bestCommonAsciiSumByColumn[column] = best (maximum) ASCII sum of a common subsequence
  // between firstString[0...row) and secondString[0..column).
  const bestCommonAsciiSumByColumn = new Int32Array(secondLength + 1);

  let totalAsciiSumFirst = 0;

  for (let rowIndex = 0; rowIndex < firstLength; rowIndex++) {
    const firstCharCode = firstString.charCodeAt(rowIndex);
    totalAsciiSumFirst += firstCharCode;

    let previousDiagonal = 0;

    // Important step: update the DP in-place using previousDiagonal from the prior row.
    for (let columnIndex = 0; columnIndex < secondLength; columnIndex++) {
      const savedFromPreviousRow = bestCommonAsciiSumByColumn[columnIndex + 1];

      if (firstCharCode === secondAsciiCodes[columnIndex]) {
        bestCommonAsciiSumByColumn[columnIndex + 1] = previousDiagonal + firstCharCode;
      } else {
        const keepFromFirstPrefix = savedFromPreviousRow;
        const keepFromSecondPrefix = bestCommonAsciiSumByColumn[columnIndex];
        bestCommonAsciiSumByColumn[columnIndex + 1] =
          keepFromFirstPrefix > keepFromSecondPrefix ? keepFromFirstPrefix : keepFromSecondPrefix;
      }

      previousDiagonal = savedFromPreviousRow;
    }
  }

  const commonAsciiSum = bestCommonAsciiSumByColumn[secondLength];
  return totalAsciiSumFirst + totalAsciiSumSecond - (commonAsciiSum + commonAsciiSum);
}
