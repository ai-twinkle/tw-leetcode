/**
 * Binary heap for numbers. The comparator must return true if a < b.
 */
class BinaryHeap {
  private data: number[] = [];
  private readonly comparator: (a: number, b: number) => boolean;

  /**
   * @param comparator Function that returns true if a should be before b.
   */
  constructor(comparator: (a: number, b: number) => boolean) {
    this.comparator = comparator;
  }

  /**
   * @returns Number of elements in the heap.
   */
  size(): number {
    return this.data.length;
  }

  /**
   * @returns Top element without removing it.
   */
  peek(): number | undefined {
    return this.data[0];
  }

  /**
   * Insert a value into the heap.
   * @param value Number to push.
   */
  push(value: number): void {
    this.data.push(value);
    this.siftUp(this.data.length - 1);
  }

  /**
   * Remove and return the top element.
   * @returns Top number or undefined if empty.
   */
  pop(): number | undefined {
    const n = this.data.length;
    if (n === 0) {
      return undefined;
    }
    const top = this.data[0];
    const last = this.data.pop()!;
    if (n > 1) {
      this.data[0] = last;
      this.siftDown(0);
    }
    return top;
  }

  private siftUp(index: number): void {
    while (index > 0) {
      const parentIndex = (index - 1) >> 1;
      if (this.comparator(this.data[index], this.data[parentIndex])) {
        const tmp = this.data[index];
        this.data[index] = this.data[parentIndex];
        this.data[parentIndex] = tmp;
        index = parentIndex;
      } else {
        break;
      }
    }
  }

  private siftDown(index: number): void {
    const n = this.data.length;
    while (true) {
      let smallest = index;
      const leftIndex = (index << 1) + 1;
      const rightIndex = leftIndex + 1;

      if (leftIndex < n && this.comparator(this.data[leftIndex], this.data[smallest])) {
        smallest = leftIndex;
      }
      if (rightIndex < n && this.comparator(this.data[rightIndex], this.data[smallest])) {
        smallest = rightIndex;
      }
      if (smallest === index) {
        break;
      }
      const tmp = this.data[index];
      this.data[index] = this.data[smallest];
      this.data[smallest] = tmp;
      index = smallest;
    }
  }
}

class MovieRentingSystem {
  /**
   * Packing factor: encodes (entryId, version) into one number.
   */
  private readonly PACK = 1_000_000;

  private readonly entryCount: number;
  private readonly priceByEntry: Int32Array;
  private readonly shopByEntry: Int32Array;
  private readonly movieByEntry: Int32Array;
  private readonly stateByEntry: Uint8Array;    // 0 = available, 1 = rented
  private readonly versionByEntry: Int32Array;  // Increments at every state change

  private readonly movieToShopToEntry: Map<number, Map<number, number>> = new Map();
  private readonly availableHeaps: Map<number, BinaryHeap> = new Map();
  private readonly rentedHeap: BinaryHeap;

  /**
   * @param shopCount Total number of shops.
   * @param entries Array of [shop, movie, price].
   */
  constructor(shopCount: number, entries: number[][]) {
    this.entryCount = entries.length;
    const totalEntries = this.entryCount;

    this.priceByEntry = new Int32Array(totalEntries);
    this.shopByEntry = new Int32Array(totalEntries);
    this.movieByEntry = new Int32Array(totalEntries);
    this.stateByEntry = new Uint8Array(totalEntries);
    this.versionByEntry = new Int32Array(totalEntries);

    // Comparator for available heap (by price, then shop).
    const lessAvailable = (a: number, b: number): boolean => {
      const entryA = Math.floor(a / this.PACK);
      const entryB = Math.floor(b / this.PACK);
      const priceA = this.priceByEntry[entryA];
      const priceB = this.priceByEntry[entryB];
      if (priceA !== priceB) {
        return priceA < priceB;
      }
      return this.shopByEntry[entryA] < this.shopByEntry[entryB];
    };

    // Comparator for rented heap (by price, then shop, then movie).
    const lessRented = (a: number, b: number): boolean => {
      const entryA = Math.floor(a / this.PACK);
      const entryB = Math.floor(b / this.PACK);
      const priceA = this.priceByEntry[entryA];
      const priceB = this.priceByEntry[entryB];
      if (priceA !== priceB) {
        return priceA < priceB;
      }
      const shopA = this.shopByEntry[entryA];
      const shopB = this.shopByEntry[entryB];
      if (shopA !== shopB) {
        return shopA < shopB;
      }
      return this.movieByEntry[entryA] < this.movieByEntry[entryB];
    };

    this.rentedHeap = new BinaryHeap(lessRented);

    // Load entries into arrays and heaps.
    for (let entryId = 0; entryId < totalEntries; entryId++) {
      const [shop, movie, price] = entries[entryId];

      // Store base attributes
      this.priceByEntry[entryId] = price;
      this.shopByEntry[entryId] = shop;
      this.movieByEntry[entryId] = movie;
      this.stateByEntry[entryId] = 0;      // Mark as available
      this.versionByEntry[entryId] = 0;    // Initial version

      // Build lookup index: movie -> shop -> entryId
      let shopToEntry = this.movieToShopToEntry.get(movie);
      if (!shopToEntry) {
        shopToEntry = new Map();
        this.movieToShopToEntry.set(movie, shopToEntry);
      }
      shopToEntry.set(shop, entryId);

      // Initialize available heap for this movie if needed
      let heap = this.availableHeaps.get(movie);
      if (!heap) {
        heap = new BinaryHeap(lessAvailable);
        this.availableHeaps.set(movie, heap);
      }

      // Push initial entry with version = 0
      const packed = entryId * this.PACK;
      heap.push(packed);
    }
  }

  /**
   * Find up to 5 shops with an unrented copy of the given movie.
   * Shops are sorted by price ascending, then shop id ascending.
   * @param movie Movie id.
   * @returns Array of shop ids.
   */
  search(movie: number): number[] {
    const heap = this.availableHeaps.get(movie);
    if (!heap) {
      return [];
    }
    const results: number[] = [];
    const buffer: number[] = [];

    // Pop until 5 valid results or heap is empty
    while (results.length < 5 && heap.size() > 0) {
      const packed = heap.pop()!;
      const entryId = Math.floor(packed / this.PACK);
      const pushedVersion = packed % this.PACK;

      // Validate state and version
      if (this.stateByEntry[entryId] === 0 && pushedVersion === this.versionByEntry[entryId]) {
        results.push(this.shopByEntry[entryId]);
        buffer.push(packed); // Keep heap intact
      }
    }

    // Push back valid entries
    for (const p of buffer) {
      heap.push(p);
    }
    return results;
  }

  /**
   * Rent the given movie from the given shop.
   * @param shop Shop id.
   * @param movie Movie id.
   */
  rent(shop: number, movie: number): void {
    const entryId = this.movieToShopToEntry.get(movie)!.get(shop)!;

    // Increment version and mark as rented
    this.versionByEntry[entryId]++;
    this.stateByEntry[entryId] = 1;

    // Push into rented heap with new version
    const packed = entryId * this.PACK + this.versionByEntry[entryId];
    this.rentedHeap.push(packed);
  }

  /**
   * Drop off a previously rented movie at the given shop.
   * @param shop Shop id.
   * @param movie Movie id.
   */
  drop(shop: number, movie: number): void {
    const entryId = this.movieToShopToEntry.get(movie)!.get(shop)!;

    // Increment version and mark as available
    this.versionByEntry[entryId]++;
    this.stateByEntry[entryId] = 0;

    // Ensure available heap exists for this movie
    let heap = this.availableHeaps.get(movie);
    if (!heap) {
      const lessAvailable = (a: number, b: number): boolean => {
        const entryA = Math.floor(a / this.PACK);
        const entryB = Math.floor(b / this.PACK);
        const priceA = this.priceByEntry[entryA];
        const priceB = this.priceByEntry[entryB];
        if (priceA !== priceB) {
          return priceA < priceB;
        }
        return this.shopByEntry[entryA] < this.shopByEntry[entryB];
      };
      heap = new BinaryHeap(lessAvailable);
      this.availableHeaps.set(movie, heap);
    }

    // Push back into available heap with updated version
    const packed = entryId * this.PACK + this.versionByEntry[entryId];
    heap.push(packed);
  }

  /**
   * Report up to 5 cheapest currently rented movies as [shop, movie].
   * Sorted by price, then shop id, then movie id.
   * @returns Array of [shop, movie] pairs.
   */
  report(): number[][] {
    const results: number[][] = [];
    const buffer: number[] = [];

    // Pop until 5 valid rented entries
    while (results.length < 5 && this.rentedHeap.size() > 0) {
      const packed = this.rentedHeap.pop()!;
      const entryId = Math.floor(packed / this.PACK);
      const pushedVersion = packed % this.PACK;

      // Validate state and version
      if (this.stateByEntry[entryId] === 1 && pushedVersion === this.versionByEntry[entryId]) {
        results.push([this.shopByEntry[entryId], this.movieByEntry[entryId]]);
        buffer.push(packed); // Keep heap intact
      }
    }

    // Push back valid entries
    for (const p of buffer) {
      this.rentedHeap.push(p);
    }
    return results;
  }
}

/**
 * Your MovieRentingSystem object will be instantiated and called as such:
 * var obj = new MovieRentingSystem(n, entries)
 * var param_1 = obj.search(movie)
 * obj.rent(shop,movie)
 * obj.drop(shop,movie)
 * var param_4 = obj.report()
 */
