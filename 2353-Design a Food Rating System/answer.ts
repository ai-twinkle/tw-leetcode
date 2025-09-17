/**
 * Main class implementing the Food Ratings system.
 * Supports updating food ratings and querying the highest rated food for a cuisine.
 */
class FoodRatings {
  private readonly currentRatings: Int32Array;
  private readonly cuisineIdentifierByFood: Int32Array;

  private readonly foodNames: string[];
  private readonly foodNameToIdentifier: Map<string, number>;
  private readonly cuisineNameToIdentifier: Map<string, number>;

  private readonly cuisineHeaps: CuisineHeap[];

  /**
   * Constructor for FoodRatings.
   * Initializes mappings, typed arrays, and heaps.
   *
   * @param foods - list of food names
   * @param cuisines - list of cuisines corresponding to each food
   * @param ratings - list of initial ratings for each food
   */
  constructor(foods: string[], cuisines: string[], ratings: number[]) {
    const totalFoods = foods.length;
    this.foodNames = foods.slice(0);
    this.currentRatings = new Int32Array(totalFoods);
    this.cuisineIdentifierByFood = new Int32Array(totalFoods);

    this.foodNameToIdentifier = new Map<string, number>();
    this.cuisineNameToIdentifier = new Map<string, number>();
    this.cuisineHeaps = [];

    // Build food-to-id map and store initial ratings
    for (let index = 0; index < totalFoods; index++) {
      this.foodNameToIdentifier.set(foods[index], index);
      this.currentRatings[index] = ratings[index] | 0;
    }

    // Assign cuisine identifiers and create heaps
    let cuisineCount = 0;
    for (let index = 0; index < totalFoods; index++) {
      const cuisineName = cuisines[index];
      let cuisineId = this.cuisineNameToIdentifier.get(cuisineName);

      if (cuisineId === undefined) {
        cuisineId = cuisineCount;
        cuisineCount++;
        this.cuisineNameToIdentifier.set(cuisineName, cuisineId);
        this.cuisineHeaps[cuisineId] = new CuisineHeap(this.foodNames);
      }

      this.cuisineIdentifierByFood[index] = cuisineId;
    }

    // Seed each cuisine heap with its foods
    for (let index = 0; index < totalFoods; index++) {
      const cuisineId = this.cuisineIdentifierByFood[index];
      this.cuisineHeaps[cuisineId]!.push(index, this.currentRatings[index]);
    }
  }

  /**
   * Change the rating of a food.
   *
   * @param food - food name
   * @param newRating - updated rating value
   */
  changeRating(food: string, newRating: number): void {
    const foodId = this.foodNameToIdentifier.get(food)!;
    this.currentRatings[foodId] = newRating | 0;

    const cuisineId = this.cuisineIdentifierByFood[foodId];
    this.cuisineHeaps[cuisineId]!.push(foodId, newRating | 0);
  }

  /**
   * Get the highest-rated food for a cuisine.
   * In case of tie, returns the lexicographically smallest name.
   *
   * @param cuisine - the cuisine to query
   * @returns name of the top-rated food
   */
  highestRated(cuisine: string): string {
    const cuisineId = this.cuisineNameToIdentifier.get(cuisine)!;
    const heap = this.cuisineHeaps[cuisineId]!;

    // Lazy deletion of outdated entries
    while (heap.size() > 0) {
      const topFoodId = heap.topFoodId();
      const snapshotRating = heap.topSnapshotRating();

      if (snapshotRating === this.currentRatings[topFoodId]) {
        return this.foodNames[topFoodId];
      } else {
        heap.pop();
      }
    }

    // Should not occur by constraints
    return "";
  }
}

/**
 * Custom max-heap for cuisine foods.
 * Ordered by rating (descending), then name (ascending).
 */
class CuisineHeap {
  private readonly heapFoodIds: number[] = [];
  private readonly heapSnapshotRatings: number[] = [];
  private readonly foodNames: string[] = [];

  constructor(foodNames: string[]) {
    this.foodNames = foodNames;
  }

  /**
   * @returns number of items currently in the heap
   */
  size(): number {
    return this.heapFoodIds.length;
  }

  /**
   * @returns foodId of the top element
   */
  topFoodId(): number {
    return this.heapFoodIds[0];
  }

  /**
   * @returns snapshot rating of the top element
   */
  topSnapshotRating(): number {
    return this.heapSnapshotRatings[0];
  }

  /**
   * Push a new snapshot (foodId, rating) into the heap.
   *
   * @param foodId - identifier of the food
   * @param snapshotRating - rating at the time of insertion
   */
  push(foodId: number, snapshotRating: number): void {
    const index = this.heapFoodIds.length;
    this.heapFoodIds.push(foodId);
    this.heapSnapshotRatings.push(snapshotRating);
    this.siftUp(index);
  }

  /**
   * Remove the top element from the heap.
   */
  pop(): void {
    const size = this.heapFoodIds.length;
    if (size === 0) {
      return;
    }

    const lastIndex = size - 1;
    this.heapFoodIds[0] = this.heapFoodIds[lastIndex];
    this.heapSnapshotRatings[0] = this.heapSnapshotRatings[lastIndex];

    this.heapFoodIds.pop();
    this.heapSnapshotRatings.pop();

    if (this.heapFoodIds.length > 0) {
      this.siftDown(0);
    }
  }

  /**
   * Compare two nodes and decide priority.
   *
   * @param indexI - first node index
   * @param indexJ - second node index
   * @returns true if node I should be higher priority than node J
   */
  private isHigherPriority(indexI: number, indexJ: number): boolean {
    const ratingI = this.heapSnapshotRatings[indexI];
    const ratingJ = this.heapSnapshotRatings[indexJ];

    if (ratingI !== ratingJ) {
      return ratingI > ratingJ;
    }

    const nameI = this.foodNames[this.heapFoodIds[indexI]];
    const nameJ = this.foodNames[this.heapFoodIds[indexJ]];

    return nameI < nameJ;
  }

  /**
   * Restore heap property upwards.
   *
   * @param index - starting child index
   */
  private siftUp(index: number): void {
    let childIndex = index;
    while (childIndex > 0) {
      const parentIndex = (childIndex - 1) >> 1;

      if (this.isHigherPriority(childIndex, parentIndex)) {
        this.swap(childIndex, parentIndex);
        childIndex = parentIndex;
      } else {
        break;
      }
    }
  }

  /**
   * Restore heap property downwards.
   *
   * @param index - starting parent index
   */
  private siftDown(index: number): void {
    const totalSize = this.heapFoodIds.length;
    let parentIndex = index;

    while (true) {
      const leftChildIndex = (parentIndex << 1) + 1;
      const rightChildIndex = leftChildIndex + 1;
      let bestIndex = parentIndex;

      if (leftChildIndex < totalSize && this.isHigherPriority(leftChildIndex, bestIndex)) {
        bestIndex = leftChildIndex;
      }
      if (rightChildIndex < totalSize && this.isHigherPriority(rightChildIndex, bestIndex)) {
        bestIndex = rightChildIndex;
      }

      if (bestIndex === parentIndex) {
        break;
      }

      this.swap(parentIndex, bestIndex);
      parentIndex = bestIndex;
    }
  }

  /**
   * Swap two nodes in the heap.
   *
   * @param indexA - first index
   * @param indexB - second index
   */
  private swap(indexA: number, indexB: number): void {
    const foodA = this.heapFoodIds[indexA];
    this.heapFoodIds[indexA] = this.heapFoodIds[indexB];
    this.heapFoodIds[indexB] = foodA;

    const ratingA = this.heapSnapshotRatings[indexA];
    this.heapSnapshotRatings[indexA] = this.heapSnapshotRatings[indexB];
    this.heapSnapshotRatings[indexB] = ratingA;
  }
}

/**
 * Your FoodRatings object will be instantiated and called as such:
 * var obj = new FoodRatings(foods, cuisines, ratings)
 * obj.changeRating(food,newRating)
 * var param_2 = obj.highestRated(cuisine)
 */
