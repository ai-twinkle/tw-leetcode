function matchPlayersAndTrainers(
  players: number[],
  trainers: number[]
): number {
  // Copy into typed arrays for fast, native numeric sort
  const playerAbilities = new Uint32Array(players);
  const trainerCapacities = new Uint32Array(trainers);

  // In‐place, numeric ascending sort (no comparator overhead)
  playerAbilities.sort();
  trainerCapacities.sort();

  let playerIndex = 0;
  let trainerIndex = 0;
  let matchCount = 0;
  const totalPlayers = playerAbilities.length;
  const totalTrainers = trainerCapacities.length;

  // Greedily match the weakest remaining player to the weakest trainer
  while (playerIndex < totalPlayers && trainerIndex < totalTrainers) {
    if (playerAbilities[playerIndex] <= trainerCapacities[trainerIndex]) {
      // Can match
      matchCount++;
      playerIndex++;
      trainerIndex++;
    } else {
      // Trainer too weak for this player, try next trainer
      trainerIndex++;
    }
  }

  return matchCount;
}
