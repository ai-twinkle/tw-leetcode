# 1912. Design Movie Rental System

You have a movie renting company consisting of `n` shops. 
You want to implement a renting system that supports searching for, booking, and returning movies. 
The system should also support generating a report of the currently rented movies.

Each movie is given as a 2D integer array `entries` where `entries[i] = [shop_i, movie_i, price_i]` indicates that there is a copy of movie `movie_i` at shop `shop_i` with a rental price of `price_i`. 
Each shop carries at most one copy of a movie `movie_i`.

The system should support the following functions:

- Search: Finds the cheapest 5 shops that have an unrented copy of a given movie. 
  The shops should be sorted by price in ascending order, and in case of a tie, the one with the smaller `shop_i` should appear first. 
  - If there are less than 5 matching shops, then all of them should be returned. 
  - If no shop has an unrented copy, then an empty list should be returned.
- Rent: Rents an unrented copy of a given movie from a given shop.
- Drop: Drops off a previously rented copy of a given movie at a given shop.
- Report: Returns the cheapest 5 rented movies (possibly of the same movie ID) as a 2D list `res` where `res[j] = [shop_j, movie_j]` describes 
  that the $j^{th}$ cheapest rented movie `movie_j` was rented from the shop `shop_j`. 
  The movies in `res` should be sorted by price in ascending order, and in case of a tie, the one with the smaller `shop_j` should appear first, 
  and if there is still tie, the one with the smaller `movie_j` should appear first. 
  If there are fewer than 5 rented movies, then all of them should be returned. 
  If no movies are currently being rented, then an empty list should be returned.

Implement the `MovieRentingSystem` class:

- `MovieRentingSystem(int n, int[][] entries)` Initializes the `MovieRentingSystem` object with `n` shops and the movies in `entries`.
- `List<Integer> search(int movie)` Returns a list of shops that have an unrented copy of the given `movie` as described above.
- `void rent(int shop, int movie)` Rents the given `movie` from the given `shop`.
- `void drop(int shop, int movie)` Drops off a previously rented `movie` at the given `shop`.
- `List<List<Integer>> report()` Returns a list of cheapest rented movies as described above.

Note: The test cases will be generated such that `rent` will only be called if the shop has an unrented copy of the movie, 
and `drop` will only be called if the shop had previously rented out the movie.

**Constraints:**

- `1 <= n <= 3 * 10^5`
- `1 <= entries.length <= 10^5`
- `0 <= shop_i < n`
- `1 <= movie_i, price_i <= 10^4`
- Each shop carries at most one copy of a movie `movie_i`.
- At most `10^5` calls in total will be made to `search`, `rent`, `drop` and `report`.

## 基礎思路

本題目標是設計一套電影租借系統，需同時滿足下列四項功能與效能需求：

1. **搜尋可租店家**：給定某部電影，找出最多 5 家仍有副本可供租借的店家，依「價格升序 → 店號升序」排序。
2. **租借與歸還操作**：系統需支援對任意店家與電影的租借與歸還，並正確維護租借狀態。
3. **租借報表輸出**：查詢目前所有已被租出的條目中，最便宜的前 5 筆 `(shop, movie)`，排序依「價格升序 → 店號升序 → 電影編號升序」。
4. **操作效率要求**：在 $10^5$ 次操作內皆需高效完成，需避免每次操作都對全體資料進行掃描或排序。

為了達成上述目標，我們可以採用以下策略：

- **建立電影與店家的關聯結構**：需能針對任一電影，快速查詢其所有擁有副本的店家。
- **維護租借狀態與即時更新**：系統需能即時反映租借或歸還後的狀態變更，並使後續查詢與報表保持正確。
- **快速取得最便宜選項**：無論是查詢可租副本或列出已租項目，皆需能即時找出最便宜的前幾筆結果，並具備穩定的排序規則。
- **使用快取與限制視窗**：為避免重複計算，可在查詢結果中使用適當快取；由於僅需返回最多 5 筆結果，排序處理可限制於小範圍內以降低成本。

透過上述策略設計，系統能在每次操作中達成接近常數或線性時間的處理效能，滿足題目所要求的高頻查詢與即時回應能力。

## 解題步驟

### Step 1：主類別與欄位宣告

宣告常數索引、型別別名與四個核心結構：`(shop,movie) → entry`、`movie → entries[]`、已租集合、以及單片搜尋快取。

```typescript
/* ------------------ 保留相容性的型別與常數定義 ------------------ */
const SHOP = 0;   // 商店索引
const MOVIE = 1;  // 電影索引
const PRICE = 2;  // 價格索引

type Entry = [shop: number, movie: number, price: number];  // 一筆租借條目：[商店編號, 電影編號, 價格]

/* --------------------------- 電影租借系統 --------------------------- */
class MovieRentingSystem {
  private readonly entryByPairKey: Map<number, Entry>;       // 快速查找：(shop,movie) → entry（價格/報表使用）
  private readonly entriesByMovieMap: Map<number, Entry[]>;  // 依電影分組，加速 search()，避免掃描不相關條目
  private readonly rentedPairKeys: Set<number>;              // 當前已租集合，元素為數值鍵 (shop,movie)
  private readonly searchResultCache: Map<number, number[]>; // 每部電影的搜尋快取（店家列表）

  // ...
}
```

### Step 2：建構子 — 初始化索引

建立 `(shop,movie)` 數值鍵索引與 `movie` 分桶；輸入 `entries` 為 `number[][]`，以 `Entry` 斷言讀取。

```typescript
class MovieRentingSystem {
  // Step 1：主類別與欄位宣告

  /**
   * 初始化電影租借系統。
   * @param n 商店數量
   * @param entries 條目清單 [shop, movie, price]
   */
  constructor(n: number, entries: number[][]) {
    this.entryByPairKey = new Map<number, Entry>();
    this.entriesByMovieMap = new Map<number, Entry[]>();
    this.rentedPairKeys = new Set<number>();
    this.searchResultCache = new Map<number, number[]>();

    // 建立數值鍵與每部電影的索引，提昇 search 效率
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

  // ...
}
```

### Step 3：私有工具 `packKey` — 將 `(shop, movie)` 打包成數值鍵

以 `shop * 10001 + movie` 合成唯一鍵，避免建立字串與碰撞。

```typescript
class MovieRentingSystem {
  // Step 1：主類別與欄位宣告
  
  // Step 2：建構子 — 初始化索引

  /**
   * 將 (shop, movie) 組合為穩定的數值鍵。
   * 常數選擇確保唯一性並避免字串建立的開銷。
   *
   * @param shop 商店編號
   * @param movie 電影編號
   * @returns 數值鍵
   */
  private packKey(shop: number, movie: number): number {
    // 合成單一數字鍵；常數 10001 可避免碰撞
    return shop * 10001 + movie;
  }

  // ...
}
```

### Step 4：`search(movie)` — 查詢未租出的最便宜店家（至多 5 家）

先查快取；若未命中，僅掃描該片 `entries`，跳過已租，維護長度 ≤ 5 的視窗（價格升序、同價比店號），最後回傳店號並寫入快取。

```typescript
class MovieRentingSystem {
  // Step 1：主類別與欄位宣告
  
  // Step 2：建構子 — 初始化索引
  
  // Step 3：私有工具 `packKey` — 將 `(shop, movie)` 打包成數值鍵

  /**
   * 查詢至多 5 家未租出、且最便宜的店家（價升序，若同價則店號升序）。
   *
   * @param movie 電影編號
   * @returns 店家編號陣列
   */
  search(movie: number): number[] {
    // 若有快取，直接回傳
    const cachedShops = this.searchResultCache.get(movie);
    if (cachedShops !== undefined) {
      return cachedShops;
    }

    // 僅處理該電影的條目，避免全域掃描
    const entriesOfMovie = this.entriesByMovieMap.get(movie);
    if (entriesOfMovie === undefined || entriesOfMovie.length === 0) {
      this.searchResultCache.set(movie, []);
      return [];
    }

    // 維護長度 ≤ 5 的排序視窗（價格升序、同價店號升序）
    const topCandidates: Entry[] = [];

    // 以插入法建立前 5 名
    outerLoop: for (let index = 0; index < entriesOfMovie.length; index++) {
      const entry = entriesOfMovie[index];
      const shopIdentifier = entry[SHOP];

      // 已租則跳過
      const pairKey = this.packKey(shopIdentifier, movie);
      if (this.rentedPairKeys.has(pairKey)) {
        continue;
      }

      // 插入到有序視窗中
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

    // 取出店家編號，並寫入快取
    const resultShops: number[] = topCandidates.map((entry) => entry[SHOP]);
    this.searchResultCache.set(movie, resultShops);
    return resultShops;
  }

  // ...
}
```

### Step 5：`rent(shop, movie)` — 租出電影

將 `(shop,movie)` 標記為已租，並移除該電影的搜尋快取。

```typescript
class MovieRentingSystem {
  // Step 1：主類別與欄位宣告

  // Step 2：建構子 — 初始化索引

  // Step 3：私有工具 `packKey` — 將 `(shop, movie)` 打包成數值鍵
  
  // Step 4：`search(movie)` — 查詢未租出的最便宜店家（至多 5 家）

  /**
   * 將指定電影自指定商店租出。
   *
   * @param shop 商店編號
   * @param movie 電影編號
   */
  rent(shop: number, movie: number): void {
    // 標記為已租
    const pairKey = this.packKey(shop, movie);
    this.rentedPairKeys.add(pairKey);

    // 僅使該電影的搜尋快取失效
    this.searchResultCache.delete(movie);
  }

  // ...
}
```

### Step 6：`drop(shop, movie)` — 歸還電影

移除 `(shop,movie)` 的已租標記，並使該電影的搜尋快取失效。

```typescript
class MovieRentingSystem {
  // Step 1：主類別與欄位宣告

  // Step 2：建構子 — 初始化索引

  // Step 3：私有工具 `packKey` — 將 `(shop, movie)` 打包成數值鍵

  // Step 4：`search(movie)` — 查詢未租出的最便宜店家（至多 5 家）
  
  // Step 5：`rent(shop, movie)` — 租出電影

  /**
   * 歸還指定商店的指定電影。
   *
   * @param shop 商店編號
   * @param movie 電影編號
   */
  drop(shop: number, movie: number): void {
    // 解除已租狀態
    const pairKey = this.packKey(shop, movie);
    this.rentedPairKeys.delete(pairKey);

    // 僅使該電影的搜尋快取失效
    this.searchResultCache.delete(movie);
  }

  // ...
}
```

### Step 7：`report()` — 列出最多 5 部最便宜的已租電影

遍歷已租集合，透過主索引取回 `entry`，用小視窗插入維護「價格 → 店號 → 電影編號」排序，最後轉成 `[shop, movie]` 陣列回傳。

```typescript
class MovieRentingSystem {
  // Step 1：主類別與欄位宣告

  // Step 2：建構子 — 初始化索引

  // Step 3：私有工具 `packKey` — 將 `(shop, movie)` 打包成數值鍵

  // Step 4：`search(movie)` — 查詢未租出的最便宜店家（至多 5 家）

  // Step 5：`rent(shop, movie)` — 租出電影
  
  // Step 6：`drop(shop, movie)` — 歸還電影

  /**
   * 回傳至多 5 筆已租電影，排序：價格升序 → 店號升序 → 電影編號升序。
   *
   * @returns 二維陣列，每筆為 [shop, movie]
   */
  report(): number[][] {
    // 維護長度 ≤ 5 的已租小視窗
    const topRented: Entry[] = [];

    // 僅遍歷當前已租集合
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

    // 轉為 [shop, movie] 的輸出格式
    const result: number[][] = new Array(topRented.length);
    for (let index = 0; index < topRented.length; index++) {
      const entry = topRented[index];
      result[index] = [entry[SHOP], entry[MOVIE]];
    }
    return result;
  }
}
```

## 時間複雜度

- `search(movie)`：最壞掃描該片出現次數 $k$，維持前 5 名為常數開銷，故為 $O(k)$；若快取命中則為 $O(1)$。
- `rent/drop`：集合增刪與單片快取失效皆為 $O(1)$。
- `report`：遍歷已租集合大小 $r$，每筆只做前 5 名插入維護（常數），故為 $O(r)$。
- 總時間複雜度為 $O(k + r)$；在快取生效場景中，多數查詢可近似 $O(1)$。

> $O(k + r)$

## 空間複雜度

- 輸入條目與索引：`movie → entries[]` 與 `(shop,movie) → entry` 僅存參考，總量級為 $O(E)$。
- 已租集合：最壞可達 $O(E)$。
- 搜尋快取：每部電影最多 5 家店，合計 $O(M)$ 且 $M \le E$。
- 總空間複雜度為 $O(E)$。

> $O(E)$
