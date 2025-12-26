function bestClosingTime(customers: string): number {
  const hourCount = customers.length;
  const customerYesCode = 89; // 'Y'

  let runningScore = 0;
  let bestScore = 0;
  let bestClosingHour = 0;

  for (let hour = 0; hour < hourCount; hour++) {
    // Update prefix score: +1 for 'Y', -1 for 'N'
    if (customers.charCodeAt(hour) === customerYesCode) {
      runningScore++;
    } else {
      runningScore--;
    }

    // Record the earliest hour where the prefix score is maximal
    if (runningScore > bestScore) {
      bestScore = runningScore;
      bestClosingHour = hour + 1;
    }
  }

  return bestClosingHour;
}
