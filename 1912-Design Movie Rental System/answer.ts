/* ------------------ Types & constants kept for compatibility ------------------ */
const SHOP = 0;
const MOVIE = 1;
const PRICE = 2;

type Entry = [shop: number, movie: number, price: number];

/* --------------------------- Movie Renting System --------------------------- */
class MovieRentingSystem {
  private readonly entryByPairKey: Map<number, Entry>;       // Fast lookup: (shop,movie) → entry for price retrieval and reporting
  private readonly entriesByMovieMap: Map<number, Entry[]>;  // Per-movie grouping to avoid scanning unrelated entries in search()
  private readonly rentedPairKeys: Set<number>;              // Set of currently rented pairs, keyed by numeric (shop,movie)
  private readonly searchResultCache: Map<number, number[]>; // Simple per-movie search cache of shop lists

  /**
   * Initialize the movie renting system.
   * @param n Number of shops
   * @param entries List of [shop, movie, price]
   */
  constructor(n: number, entries: number[][]) {
    this.entryByPairKey = new Map<number, Entry>();
    this.entriesByMovieMap = new Map<number, Entry[]>();
    this.rentedPairKeys = new Set<number>();
    this.searchResultCache = new Map<number, number[]>();

    // Build maps: numeric keys and per-movie index for faster search.
    for (let index = 0; index < entries.length; index++) {
      const entry = entries[index] as Entry;
      const shopIdentifier = entry[SHOP];
      const movieIdentifier = entry[MOVIE];

      const pairKey = this.packKey(shopIdentifier, movieIdentifier);
      this.entryByPairKey.set(pairKey, entry);

      let listForMovie = this.entriesByMovieMap.get(movieIdentifier);
      if (listForMovie === undefined) {
        listForMovie = [];
        this.entriesByMovieMap.set(movieIdentifier, listForMovie);
      }
      listForMovie.push(entry);
    }
  }

  /**
   * Compose a stable numeric key for the pair (shop, movie).
   * The constant used keeps keys unique and avoids string creation overhead.
   *
   * @param shop Shop identifier
   * @param movie Movie identifier
   * @returns Numeric key representing the pair
   */
  private packKey(shop: number, movie: number): number {
    // Combine shop and movie into a single number; the constant prevents collisions.
    return shop * 10001 + movie;
  }

  /**
   * Search for up to 5 cheapest shops that have an unrented copy of a given movie.
   * Shops are sorted by price ascending, then shop ascending.
   *
   * @param movie Movie identifier
   * @returns Array of shop identifiers
   */
  search(movie: number): number[] {
    // Return cached result when available.
    const cachedShops = this.searchResultCache.get(movie);
    if (cachedShops !== undefined) {
      return cachedShops;
    }

    // Work only on entries of this movie (no full scan across all entries).
    const entriesOfMovie = this.entriesByMovieMap.get(movie);
    if (entriesOfMovie === undefined || entriesOfMovie.length === 0) {
      this.searchResultCache.set(movie, []);
      return [];
    }

    // Maintain a tiny sorted array (size ≤ 5) by (price asc, shop asc).
    const topCandidates: Entry[] = [];

    // Build the top-5 list by simple insertion (original approach).
    outerLoop: for (let index = 0; index < entriesOfMovie.length; index++) {
      const entry = entriesOfMovie[index];
      const shopIdentifier = entry[SHOP];

      // Skip if this copy is currently rented.
      const pairKey = this.packKey(shopIdentifier, movie);
      if (this.rentedPairKeys.has(pairKey)) {
        continue;
      }

      // Insert into the sorted window of up to 5 items.
      for (let position = 0; position < topCandidates.length; position++) {
        const current = topCandidates[position];

        const isCheaper =
          entry[PRICE] < current[PRICE] ||
          (entry[PRICE] === current[PRICE] && shopIdentifier < current[SHOP]);

        if (isCheaper) {
          topCandidates.splice(position, 0, entry);

          if (topCandidates.length > 5) {
            topCandidates.pop();
          }
          continue outerLoop;
        }
      }

      if (topCandidates.length < 5) {
        topCandidates.push(entry);
      }
    }

    // Extract just the shop identifiers in the correct order.
    const resultShops: number[] = topCandidates.map((entry) => entry[SHOP]);
    this.searchResultCache.set(movie, resultShops);
    return resultShops;
  }

  /**
   * Rent an unrented copy of a given movie from a given shop.
   *
   * @param shop Shop identifier
   * @param movie Movie identifier
   */
  rent(shop: number, movie: number): void {
    // Mark as rented.
    const pairKey = this.packKey(shop, movie);
    this.rentedPairKeys.add(pairKey);

    // Invalidate only this movie’s cached search result.
    this.searchResultCache.delete(movie);
  }

  /**
   * Drop off a previously rented movie at a given shop.
   *
   * @param shop Shop identifier
   * @param movie Movie identifier
   */
  drop(shop: number, movie: number): void {
    // Mark as available again.
    const pairKey = this.packKey(shop, movie);
    this.rentedPairKeys.delete(pairKey);

    // Invalidate only this movie’s cached search result.
    this.searchResultCache.delete(movie);
  }

  /**
   * Report up to 5 cheapest rented movies, sorted by price ascending,
   * then shop ascending, then movie ascending.
   *
   * @returns Array of [shop, movie] pairs
   */
  report(): number[][] {
    // Maintain a tiny sorted array (size ≤ 5) for rented entries.
    const topRented: Entry[] = [];

    // Iterate only the currently rented pairs and keep the best 5.
    for (const pairKey of this.rentedPairKeys) {
      const entry = this.entryByPairKey.get(pairKey) as Entry;

      let inserted = false;
      for (let position = 0; position < topRented.length; position++) {
        const current = topRented[position];

        const isBetter =
          entry[PRICE] < current[PRICE] ||
          (entry[PRICE] === current[PRICE] &&
            (entry[SHOP] < current[SHOP] ||
              (entry[SHOP] === current[SHOP] && entry[MOVIE] < current[MOVIE])));

        if (isBetter) {
          topRented.splice(position, 0, entry);

          if (topRented.length > 5) {
            topRented.pop();
          }
          inserted = true;
          break;
        }
      }

      if (!inserted && topRented.length < 5) {
        topRented.push(entry);
      }
    }

    // Shape the result to [shop, movie] per requirement.
    const result: number[][] = new Array(topRented.length);
    for (let index = 0; index < topRented.length; index++) {
      const entry = topRented[index];
      result[index] = [entry[SHOP], entry[MOVIE]];
    }
    return result;
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
