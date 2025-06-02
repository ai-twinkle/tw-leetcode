function candy(ratings: number[]): number {
  // 1. Cache the number of children and bail out if empty
  const numberOfChildren = ratings.length;
  if (numberOfChildren === 0) {
    return 0;
  }

  // 2. Allocate a Uint16Array (0…65 535) to hold each child's candy count, all initialized to 1
  //    (every child must receive ≥1 candy).
  const candyCounts = new Uint16Array(numberOfChildren);
  candyCounts.fill(1);

  // 3. Cache references for faster lookup inside loops
  const ratingList = ratings;
  const counts = candyCounts;
  const lastIndex = numberOfChildren - 1;

  // 4. Left-to-right pass: if current rating > previous rating, give one more candy than prev.
  for (let i = 1; i < numberOfChildren; ++i) {
    if (ratingList[i] > ratingList[i - 1]) {
      counts[i] = counts[i - 1] + 1;
    }
  }

  // 5. Right-to-left pass and accumulate total:
  //    If current rating > next rating, ensure counts[idx] > counts[idx + 1].
  let totalCandies = counts[lastIndex];
  for (let i = lastIndex - 1; i >= 0; --i) {
    if (ratingList[i] > ratingList[i + 1]) {
      const required = counts[i + 1] + 1;
      if (required > counts[i]) {
        counts[i] = required;
      }
    }
    totalCandies += counts[i];
  }

  return totalCandies;
}
