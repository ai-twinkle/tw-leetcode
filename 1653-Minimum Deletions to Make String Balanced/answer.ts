function minimumDeletions(s: string): number {
  const length = s.length;

  let countOfB = 0;
  let minimumDeletionsSoFar = 0;

  for (let index = 0; index < length; index++) {
    const code = s.charCodeAt(index);

    if (code === 98) {
      // Track how many 'b' we have seen (potentially deletable if later 'a' appears)
      countOfB++;
    } else {
      // For an 'a': either delete this 'a' (+1), or delete all previous 'b' (countOfB)
      const deleteThisA = minimumDeletionsSoFar + 1;
      const deletePreviousBs = countOfB;

      minimumDeletionsSoFar = deleteThisA < deletePreviousBs ? deleteThisA : deletePreviousBs;
    }
  }

  return minimumDeletionsSoFar;
}
