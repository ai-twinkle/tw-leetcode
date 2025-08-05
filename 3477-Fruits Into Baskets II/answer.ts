function numOfUnplacedFruits(fruits: number[], baskets: number[]): number {
  // Use TypedArray for baskets for fast memory access
  const numberOfBaskets = baskets.length;
  const basketCapacities = new Uint16Array(baskets);
  let numberOfUnplacedFruits = 0;

  // No need to copy fruits, as we do not mutate
  for (let fruitIndex = 0; fruitIndex < fruits.length; fruitIndex++) {
    const fruitQuantity = fruits[fruitIndex];
    let fruitPlaced = false;
    for (let basketIndex = 0; basketIndex < numberOfBaskets; basketIndex++) {
      if (basketCapacities[basketIndex] >= fruitQuantity) {
        basketCapacities[basketIndex] = 0; // Mark as used
        fruitPlaced = true;
        break;
      }
    }
    if (!fruitPlaced) {
      numberOfUnplacedFruits += 1;
    }
  }
  return numberOfUnplacedFruits;
}
