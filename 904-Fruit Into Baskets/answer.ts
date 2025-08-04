function totalFruit(fruits: number[]): number {
  const n = fruits.length;
  let firstBasketFruit = -1;
  let secondBasketFruit = -1;
  let lastFruitType = -1;
  let lastFruitStreakCount = 0;
  let currentWindowFruitCount = 0;
  let maxFruitCount = 0;

  for (let index = 0; index < n; index++) {
    const currentFruitType = fruits[index];

    // If this fruit fits in one of our two baskets, extend window;
    // otherwise start a new window of size = (run of lastFruit) + 1
    if (currentFruitType === firstBasketFruit || currentFruitType === secondBasketFruit) {
      currentWindowFruitCount++;
    } else {
      currentWindowFruitCount = lastFruitStreakCount + 1;
    }

    // Update the "run" of identical fruits at the end of the window
    if (currentFruitType === lastFruitType) {
      lastFruitStreakCount++;
    } else {
      lastFruitStreakCount = 1;
      lastFruitType = currentFruitType;
      // Shift baskets: the previous "second" becomes "first", current becomes "second"
      firstBasketFruit = secondBasketFruit;
      secondBasketFruit = currentFruitType;
    }

    // Track the best window seen so far
    if (currentWindowFruitCount > maxFruitCount) {
      maxFruitCount = currentWindowFruitCount;
    }
  }

  return maxFruitCount;
}
