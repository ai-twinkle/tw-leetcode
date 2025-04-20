function numRabbits(responses: number[]): number {
  // Map from “answer” → how many more rabbits can fill the current group
  const remainingSlots = new Map<number, number>();
  let totalRabbitsCount = 0;

  const n = responses.length;
  for (let i = 0; i < n; i++) {
    const response = responses[i];
    // How many more rabbits can we still place in this color‑group?
    const slotsAvailable = remainingSlots.get(response) ?? 0;

    if (slotsAvailable > 0) {
      // Fill one slot
      remainingSlots.set(response, slotsAvailable - 1);
    } else {
      // No open group: start a new one of size (response + 1)
      const groupSize = response + 1;
      totalRabbitsCount += groupSize;
      // Now we have (groupSize - 1) open slots left
      remainingSlots.set(response, response);
    }
  }

  return totalRabbitsCount;
}
