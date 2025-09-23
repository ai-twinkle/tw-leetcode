function compareVersion(version1: string, version2: string): number {
  // Split version strings into arrays of revision numbers
  const revisionsOfVersion1 = version1.split('.').map(Number);
  const revisionsOfVersion2 = version2.split('.').map(Number);

  // Determine the maximum number of revisions we need to compare
  const maximumLength = Math.max(revisionsOfVersion1.length, revisionsOfVersion2.length);

  // Compare each revision one by one
  for (let index = 0; index < maximumLength; index++) {
    const revisionValue1 = index < revisionsOfVersion1.length ? revisionsOfVersion1[index] : 0;
    const revisionValue2 = index < revisionsOfVersion2.length ? revisionsOfVersion2[index] : 0;

    if (revisionValue1 > revisionValue2) {
      return 1;
    }

    if (revisionValue1 < revisionValue2) {
      return -1;
    }
  }

  // All revision values are equal
  return 0;
}
