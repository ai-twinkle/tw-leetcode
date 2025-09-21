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

本題需設計一個電影租借系統，支援：

1. `search(movie)`：查詢該電影目前**可租**的店家，依「價格升冪 → 店編升冪」取前 5 家。
2. `rent(shop, movie)`：將該店的此電影標記為**已租**。
3. `drop(shop, movie)`：歸還已租拷貝，恢復為**可租**。
4. `report()`：回報目前**已租**清單中，依「價格升冪 → 店編升冪 → 電影編升冪」取前 5 筆 `[shop, movie]`。

設計策略：

* **緊湊狀態表**：對每筆拷貝賦予 `entryId`，用定長陣列（TypedArray）存放 `price / shop / movie / state / version`，O(1) 讀寫。
* **直接索引**：建 `movie → (shop → entryId)` 映射，使 `rent/drop` 能 O(1) 取得對應拷貝。
* **雙堆 + 惰性刪除**：

    * 每部電影一個「可租堆」：按（價格、店編）排序。
    * 全域一個「已租堆」：按（價格、店編、電影）排序。
    * **不做中間刪除**：每次狀態改變就讓該 `entryId` 的 **版本號 +1**，把 `(entryId, version)` 打包入堆；取堆頂時若版本不符或狀態不符就丟棄，直到遇到有效元素。
* **可重用二元堆**：以通用 `BinaryHeap`（由比較器決定排序）承載上述兩類優先順序。

## 解題步驟

### Step 1：通用二元堆 `BinaryHeap`（比較器決定順序）

先實作與本題配合的最小堆（以比較器定義 a 是否在 b 前），供「可租堆」與「已租堆」共用。

```typescript
/**
 * 數值型二元堆。比較器需回傳 true 表示 a 應位於 b 前（a < b）。
 */
class BinaryHeap {
  private data: number[] = [];
  private readonly comparator: (a: number, b: number) => boolean;

  /**
   * @param comparator 若 a 應在 b 前則回傳 true 的函式。
   */
  constructor(comparator: (a: number, b: number) => boolean) {
    this.comparator = comparator;
  }

  /**
   * @returns 堆中元素個數。
   */
  size(): number {
    return this.data.length;
  }

  /**
   * @returns 不移除的堆頂元素。
   */
  peek(): number | undefined {
    return this.data[0];
  }

  /**
   * 插入一個數值。
   * @param value 要推入的數字。
   */
  push(value: number): void {
    this.data.push(value);
    this.siftUp(this.data.length - 1);
  }

  /**
   * 移除並回傳堆頂元素。
   * @returns 堆頂數字；若為空回傳 undefined。
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
```

### Step 2：主類別與欄位宣告（`MovieRentingSystem`）

宣告打包常數、拷貝屬性表、狀態/版本、查找索引，以及兩種堆。

```typescript
class MovieRentingSystem {
  /**
   * 打包因子：把 (entryId, version) 編碼成單一數字。
   */
  private readonly PACK = 1_000_000;

  private readonly entryCount: number;
  private readonly priceByEntry: Int32Array;
  private readonly shopByEntry: Int32Array;
  private readonly movieByEntry: Int32Array;
  private readonly stateByEntry: Uint8Array;    // 0 = 可租, 1 = 已租
  private readonly versionByEntry: Int32Array;  // 每次狀態改變都 +1

  private readonly movieToShopToEntry: Map<number, Map<number, number>> = new Map();
  private readonly availableHeaps: Map<number, BinaryHeap> = new Map();
  private readonly rentedHeap: BinaryHeap;

  // ...
}
```

### Step 3：建構子 — 載入拷貝、初始化索引與堆

初始化各欄位、建立比較器，為每部電影建立可租堆，並將所有初始可租拷貝（version=0）推入。

```typescript
class MovieRentingSystem {
  // Step 2：主類別與欄位宣告（MovieRentingSystem）

  /**
   * @param shopCount 店家總數。
   * @param entries [shop, movie, price] 陣列。
   */
  constructor(shopCount: number, entries: number[][]) {
    this.entryCount = entries.length;
    const totalEntries = this.entryCount;

    this.priceByEntry = new Int32Array(totalEntries);
    this.shopByEntry = new Int32Array(totalEntries);
    this.movieByEntry = new Int32Array(totalEntries);
    this.stateByEntry = new Uint8Array(totalEntries);
    this.versionByEntry = new Int32Array(totalEntries);

    // 可租堆比較器（價格升冪 → 店編升冪）
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

    // 已租堆比較器（價格升冪 → 店編升冪 → 電影升冪）
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

    // 載入 entries 並初始化
    for (let entryId = 0; entryId < totalEntries; entryId++) {
      const [shop, movie, price] = entries[entryId];

      // 基本屬性與初始狀態
      this.priceByEntry[entryId] = price;
      this.shopByEntry[entryId] = shop;
      this.movieByEntry[entryId] = movie;
      this.stateByEntry[entryId] = 0;      // 可租
      this.versionByEntry[entryId] = 0;    // 初始版本

      // 查找索引：movie -> shop -> entryId
      let shopToEntry = this.movieToShopToEntry.get(movie);
      if (!shopToEntry) {
        shopToEntry = new Map();
        this.movieToShopToEntry.set(movie, shopToEntry);
      }
      shopToEntry.set(shop, entryId);

      // 為此 movie 準備可租堆
      let heap = this.availableHeaps.get(movie);
      if (!heap) {
        heap = new BinaryHeap(lessAvailable);
        this.availableHeaps.set(movie, heap);
      }

      // 推入可租堆（version = 0）
      const packed = entryId * this.PACK;
      heap.push(packed);
    }
  }

  // ...
}
```

### Step 4：`search(movie)` — 查詢可租店家（取前 5 家）

從該電影的可租堆彈出檢查有效快照（狀態為可租且版本符合），收集到 5 筆為止，並把有效元素推回以維持堆完整。

```typescript
class MovieRentingSystem {
  // Step 2：主類別與欄位宣告（MovieRentingSystem）
  
  // Step 3：建構子 — 載入拷貝、初始化索引與堆

  /**
   * 找到最多 5 間擁有可租拷貝的店，依「價格、店編」排序。
   * @param movie 電影編號。
   * @returns 店家編號陣列。
   */
  search(movie: number): number[] {
    const heap = this.availableHeaps.get(movie);
    if (!heap) {
      return [];
    }
    const results: number[] = [];
    const buffer: number[] = [];

    // 彈出直到集滿 5 筆有效紀錄或堆空
    while (results.length < 5 && heap.size() > 0) {
      const packed = heap.pop()!;
      const entryId = Math.floor(packed / this.PACK);
      const pushedVersion = packed % this.PACK;

      // 驗證狀態與版本
      if (this.stateByEntry[entryId] === 0 && pushedVersion === this.versionByEntry[entryId]) {
        results.push(this.shopByEntry[entryId]);
        buffer.push(packed); // 保持堆完整
      }
    }

    // 推回有效元素
    for (const p of buffer) {
      heap.push(p);
    }
    return results;
  }

  // ...
}
```

### Step 5：`rent(shop, movie)` — 出租拷貝（版本 +1，進入已租堆）

透過索引定位拷貝，版本 +1、標為已租，並把新版本快照推入「已租堆」。

```typescript
class MovieRentingSystem {
  // Step 2：主類別與欄位宣告（MovieRentingSystem）
  
  // Step 3：建構子 — 載入拷貝、初始化索引與堆
  
  // Step 4：search(movie) — 查詢可租店家

  /**
   * 從指定店家租出該電影。
   * @param shop 店家編號。
   * @param movie 電影編號。
   */
  rent(shop: number, movie: number): void {
    const entryId = this.movieToShopToEntry.get(movie)!.get(shop)!;

    // 版本 +1 並標記為已租
    this.versionByEntry[entryId]++;
    this.stateByEntry[entryId] = 1;

    // 推入已租堆（帶新版本）
    const packed = entryId * this.PACK + this.versionByEntry[entryId];
    this.rentedHeap.push(packed);
  }

  // ...
}
```

### Step 6：`drop(shop, movie)` — 歸還拷貝（版本 +1，回到可租堆）

版本 +1、狀態改為可租，確保該電影的可租堆存在後，推入新版本快照。

```typescript
class MovieRentingSystem {
  // Step 2：主類別與欄位宣告（MovieRentingSystem）
  
  // Step 3：建構子 — 載入拷貝、初始化索引與堆
  
  // Step 4：search(movie) — 查詢可租店家
  
  // Step 5：rent(shop, movie) — 出租拷貝

  /**
   * 歸還在指定店家租借的電影。
   * @param shop 店家編號。
   * @param movie 電影編號。
   */
  drop(shop: number, movie: number): void {
    const entryId = this.movieToShopToEntry.get(movie)!.get(shop)!;

    // 版本 +1 並標記為可租
    this.versionByEntry[entryId]++;
    this.stateByEntry[entryId] = 0;

    // 確保存在此 movie 的可租堆
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

    // 推回可租堆（帶新版本）
    const packed = entryId * this.PACK + this.versionByEntry[entryId];
    heap.push(packed);
  }

  // ...
}
```

### Step 7：`report()` — 回報已租前 5 名（價格、店編、電影）

與 `search` 類似，從全域「已租堆」彈出檢查有效快照並收集到 5 筆，最後推回有效元素。

```typescript
class MovieRentingSystem {
  // Step 2：主類別與欄位宣告（MovieRentingSystem）
  
  // Step 3：建構子 — 載入拷貝、初始化索引與堆
  
  // Step 4：search(movie) — 查詢可租店家
  
  // Step 5：rent(shop, movie) — 出租拷貝
  
  // Step 6：drop(shop, movie) — 歸還拷貝

  /**
   * 回報最多 5 筆目前已出租的拷貝（[shop, movie]），
   * 按「價格、店編、電影」排序。
   */
  report(): number[][] {
    const results: number[][] = [];
    const buffer: number[] = [];

    // 取出最多 5 筆有效拷貝
    while (results.length < 5 && this.rentedHeap.size() > 0) {
      const packed = this.rentedHeap.pop()!;
      const entryId = Math.floor(packed / this.PACK);
      const pushedVersion = packed % this.PACK;

      // 驗證狀態與版本
      if (this.stateByEntry[entryId] === 1 && pushedVersion === this.versionByEntry[entryId]) {
        results.push([this.shopByEntry[entryId], this.movieByEntry[entryId]]);
        buffer.push(packed); // 保持堆完整
      }
    }

    // 推回有效元素
    for (const p of buffer) {
      this.rentedHeap.push(p);
    }
    return results;
  }
}
```

## 時間複雜度

- 建構子：載入 `n` 筆拷貝並推入對應堆，約為 $O(n \log n)$。
- `search(movie)` / `report()`：各自最多處理 5 筆堆操作，$O(\log n)$。
- `rent` / `drop`：索引查找 O(1)；推入堆一次 $O(\log n)$。
- 總時間複雜度為 $O(n \log n + Q \log n)$。

> $O(n \log n + Q \log n)$

## 空間複雜度

- 狀態表與索引對每筆拷貝各一，為 $O(n)$；兩類堆總元素量同階。
- 總空間複雜度為 $O(n)$。

> $O(n)$
