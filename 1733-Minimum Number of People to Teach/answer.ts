function minimumTeachings(n: number, languages: number[][], friendships: number[][]): number {
  const userCount = languages.length;

  // Flattened matrix for O(1) lookup: membershipMatrix[userId * stride + languageId] = 1 if user knows language
  const languageStride = n + 1;
  const membershipMatrix = new Uint8Array((userCount + 1) * languageStride);

  // Fill membership matrix based on users' known languages
  for (let userId = 1; userId <= userCount; userId++) {
    const languageList = languages[userId - 1];
    for (
      let languageIndex = 0, languageListLength = languageList.length;
      languageIndex < languageListLength;
      languageIndex++
    ) {
      const languageId = languageList[languageIndex];
      membershipMatrix[userId * languageStride + languageId] = 1;
    }
  }

  // Track users involved in friendships with no shared language
  const needsTeaching = new Uint8Array(userCount + 1);
  let needsTeachingCount = 0;

  const friendshipCount = friendships.length;
  for (let friendshipIndex = 0; friendshipIndex < friendshipCount; friendshipIndex++) {
    const friendshipPair = friendships[friendshipIndex];
    const userA = friendshipPair[0];
    const userB = friendshipPair[1];

    const languagesOfUserA = languages[userA - 1];
    const languagesOfUserB = languages[userB - 1];

    let canCommunicate = false;

    // Check for any common language between the two users
    if (languagesOfUserA.length <= languagesOfUserB.length) {
      const baseOffset = userB * languageStride;
      for (
        let languageIndex = 0, languageListLength = languagesOfUserA.length;
        languageIndex < languageListLength;
        languageIndex++
      ) {
        const languageId = languagesOfUserA[languageIndex];
        if (membershipMatrix[baseOffset + languageId] !== 0) {
          canCommunicate = true;
          break;
        }
      }
    } else {
      const baseOffset = userA * languageStride;
      for (
        let languageIndex = 0, languageListLength = languagesOfUserB.length;
        languageIndex < languageListLength;
        languageIndex++
      ) {
        const languageId = languagesOfUserB[languageIndex];
        if (membershipMatrix[baseOffset + languageId] !== 0) {
          canCommunicate = true;
          break;
        }
      }
    }

    // If they cannot communicate, mark both users for possible teaching
    if (!canCommunicate) {
      if (needsTeaching[userA] === 0) {
        needsTeaching[userA] = 1;
        needsTeachingCount++;
      }
      if (needsTeaching[userB] === 0) {
        needsTeaching[userB] = 1;
        needsTeachingCount++;
      }
    }
  }

  // Early return if all users already communicate with friends
  if (needsTeachingCount === 0) {
    return 0;
  }

  // Count how many of the "needs teaching" users already know each language
  const alreadyKnowCounts = new Uint16Array(n + 1);
  for (let userId = 1; userId <= userCount; userId++) {
    if (needsTeaching[userId] === 0) {
      continue;
    }
    const languageList = languages[userId - 1];
    for (
      let languageIndex = 0, languageListLength = languageList.length;
      languageIndex < languageListLength;
      languageIndex++
    ) {
      const languageId = languageList[languageIndex];
      alreadyKnowCounts[languageId]++;
    }
  }

  // Find the language already known by the most "needs teaching" users
  let maximumAlreadyKnow = 0;
  for (let languageId = 1; languageId <= n; languageId++) {
    const countForLanguage = alreadyKnowCounts[languageId];
    if (countForLanguage > maximumAlreadyKnow) {
      maximumAlreadyKnow = countForLanguage;
    }
  }

  // Teach this most-common language to the rest of the flagged users
  return needsTeachingCount - maximumAlreadyKnow;
}
