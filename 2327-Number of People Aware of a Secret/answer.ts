function peopleAwareOfSecret(n: number, delay: number, forget: number): number {
  const MOD = 1_000_000_007;

  // 1. Initialize typed array to record new learners on each day
  const newLearners = new Int32Array(n + 1);
  newLearners[1] = 1;

  // 2. Tracking variables
  let numberShareable = 0;   // People eligible to share today
  let numberRemembering = 1; // People who still remember at the end of day 1

  // 3. Process from day 2 to n
  for (let day = 2; day <= n; day++) {
    const indexToStartSharing = day - delay;
    const indexToForget = day - forget;

    // People who forget today
    if (indexToForget >= 1) {
      numberRemembering -= newLearners[indexToForget];
      if (numberRemembering < 0) {
        numberRemembering += MOD;
      }
    }

    // Add new sharers (delay days ago)
    if (indexToStartSharing >= 1) {
      numberShareable += newLearners[indexToStartSharing];
      if (numberShareable >= MOD) {
        numberShareable -= MOD;
      }
    }

    // Remove people who just forgot from sharers
    if (indexToForget >= 1) {
      numberShareable -= newLearners[indexToForget];
      if (numberShareable < 0) {
        numberShareable += MOD;
      }
    }

    // Assign today's new learners
    const todaysNewLearners = numberShareable;
    newLearners[day] = todaysNewLearners;

    // Update remembering pool
    numberRemembering += todaysNewLearners;
    if (numberRemembering >= MOD) {
      numberRemembering -= MOD;
    }
  }

  // 4. Final result is people still remembering on day n
  return numberRemembering;
}
