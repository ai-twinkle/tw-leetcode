function asteroidsDestroyed(mass: number, asteroids: number[]): boolean {
  const totalCount = asteroids.length;
  // Typed-array sort uses native numeric ordering, avoiding the per-compare JS callback cost
  const sortedAsteroids = new Uint32Array(asteroids).sort();
  const largestAsteroid = sortedAsteroids[totalCount - 1];
  let currentMass = mass;
  // Greedy: tackle the smallest asteroid first so the planet's mass grows as fast as possible
  for (let index = 0; index < totalCount; index++) {
    const asteroidMass = sortedAsteroids[index];
    if (currentMass < asteroidMass) {
      return false;
    }
    // Once the planet outweighs the largest asteroid, every remaining one is automatically safe
    if (currentMass >= largestAsteroid) {
      return true;
    }
    currentMass += asteroidMass;
  }
  return true;
}
