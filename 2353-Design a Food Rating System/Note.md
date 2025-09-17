# 2353. Design a Food Rating System

Design a food rating system that can do the following:

- Modify the rating of a food item listed in the system.
- Return the highest-rated food item for a type of cuisine in the system.

Implement the FoodRatings class:

- `FoodRatings(String[] foods, String[] cuisines, int[] ratings)` Initializes the system. 
  The food items are described by `foods`, `cuisines` and `ratings`, all of which have a length of `n`.
- `foods[i]` is the name of the $i^{th}$ food,
- `cuisines[i]` is the type of cuisine of the $i^{th}$ food, and
- `ratings[i]` is the initial rating of the $i^{th}$ food.
- `void changeRating(String food, int newRating)` Changes the rating of the food item with the name food.
- `String highestRated(String cuisine)` Returns the name of the food item that has the highest rating for the given type of `cuisine`. 
   If there is a tie, return the item with the lexicographically smaller name.

Note that a string `x` is lexicographically smaller than string `y` if `x` comes before `y` in dictionary order, 
that is, either `x` is a prefix of `y`, or if `i` is the first position such that `x[i] != y[i]`, then `x[i]` comes before `y[i]` in alphabetic order.

**Constraints:**

- `1 <= n <= 2 * 10^4`
- `n == foods.length == cuisines.length == ratings.length`
- `1 <= foods[i].length, cuisines[i].length <= 10`
- `foods[i]`, `cuisines[i]` consist of lowercase English letters.
- `1 <= ratings[i] <= 10^8`
- All the strings in `foods` are distinct.
- `food` will be the name of a food item in the system across all calls to `changeRating`.
- `cuisine` will be a type of cuisine of at least one food item in the system across all calls to `highestRated`.
- At most `2 * 10^4` calls in total will be made to `changeRating` and `highestRated`.

## 基礎思路

本題要求設計一個系統，能夠：

1. 根據指定的食物名稱，**快速更新該食物的評分**。
2. 根據指定的菜系名稱，**快速找出此菜系中評分最高的食物**，若有多個評分相同，則需回傳**字典序最小的食物名稱**。

從這兩項需求出發，可以提煉出幾個核心條件與限制：

- 每個操作都應具備高效率，因為總操作次數最多達 $2 \times 10^4$ 次，若使用線性查找將導致超時。
- **資料的組織方式必須允許按菜系分類，並且在每個分類中有效地維護「評分最高」的資訊**。
- 食物與菜系皆為字串，操作若直接使用字串比較會拖慢效率，因此需預處理。

根據這些觀察，我們可以制定以下的設計策略：

1. **名稱數值化（映射 ID）**
   將每個食物名稱與菜系名稱分別映射為整數 ID。
   如此一來，內部資料可全部使用整數作為索引，透過陣列或 TypedArray 進行儲存與查找，提升效能並減少字串比對成本。

2. **評分與分類資料表（狀態追蹤）**
   以緊湊的數值陣列記錄每個食物的目前評分與對應的菜系 ID。
   這使得在更新食物評分時能以 O(1) 時間直接定位，且能迅速取得該食物所屬的菜系。

3. **每個菜系對應一個最大堆（Max-Heap）**
   為每個菜系維護一個獨立的最大堆，堆中的元素代表該菜系內的所有食物。排序條件為：
    - 首先根據評分由高至低排序；
    - 若評分相同，則依據食物名稱字典序由小至大排序。
      透過這樣的堆結構，能在 $O(\log n)$ 時間內插入與查詢最高評分食物。

4. **惰性刪除機制（Lazy Deletion）**
   當某個食物的評分被更新時，系統不直接從堆中刪除舊的紀錄，這是因為在堆中進行中間位置刪除效率低下。
   取而代之，新的快照會被加入堆中，未來查詢時再比對堆頂紀錄與實際評分是否一致：
    - 若一致，表示該紀錄有效；
    - 若不一致，表示已過期，則彈出並繼續往下查。
      這種設計可確保整體更新與查詢的效率維持在對數時間複雜度之內。

透過上述策略，這套設計讓系統在處理高頻繁查詢與更新操作時，能同時維持效能與正確性，並能依據題目的字典序要求正確回傳結果。

## 解題步驟

### Step 1：主類別與欄位宣告

我們宣告整個系統的核心欄位，包括：

- 每個食物的目前評分 (`currentRatings`)
- 每個食物對應的菜系 (`cuisineIdentifierByFood`)
- 所有食物名稱清單 (`foodNames`)
- 名稱與 ID 的對應映射 (`foodNameToIdentifier`, `cuisineNameToIdentifier`)
- 每種菜系的最大堆 (`cuisineHeaps`)

```typescript
/**
 * 主類別：實作食物評分系統。
 * 支援更新食物評分與查詢某菜系的最高評分食物。
 */
class FoodRatings {
  private readonly currentRatings: Int32Array;
  private readonly cuisineIdentifierByFood: Int32Array;

  private readonly foodNames: string[];
  private readonly foodNameToIdentifier: Map<string, number>;
  private readonly cuisineNameToIdentifier: Map<string, number>;

  private readonly cuisineHeaps: CuisineHeap[];

  // ...
}
```

### Step 2：建構子 — 初始化映射、狀態表與堆結構

在建構子中，我們分為三個階段處理初始化工作：

- 建立食物名稱對應的 ID 與初始評分
- 為每個菜系分配唯一 ID 並建立對應的最大堆
- 將每個食物以當前評分快照推入對應堆中

```typescript
/**
 * 實作食物評分系統的主類別。
 * 支援更新食物評分與查詢某菜系的最高評分食物。
 */
class FoodRatings {
  // Step 1：主類別與欄位宣告

  /**
   * FoodRatings 建構子。
   * 初始化映射、TypedArray，以及各菜系的堆。
   *
   * @param foods - 食物名稱清單
   * @param cuisines - 與各食物對應的菜系名稱清單
   * @param ratings - 與各食物對應的初始評分清單
   */
  constructor(foods: string[], cuisines: string[], ratings: number[]) {
    const totalFoods = foods.length;
    this.foodNames = foods.slice(0);
    this.currentRatings = new Int32Array(totalFoods);
    this.cuisineIdentifierByFood = new Int32Array(totalFoods);

    this.foodNameToIdentifier = new Map<string, number>();
    this.cuisineNameToIdentifier = new Map<string, number>();
    this.cuisineHeaps = [];

    // 建立食物名→ID 映射與初始評分
    for (let index = 0; index < totalFoods; index++) {
      this.foodNameToIdentifier.set(foods[index], index);
      this.currentRatings[index] = ratings[index] | 0;
    }

    // 建立菜系名→ID 映射，並初始化對應堆
    let cuisineCount = 0;
    for (let index = 0; index < totalFoods; index++) {
      const cuisineName = cuisines[index];
      let cuisineId = this.cuisineNameToIdentifier.get(cuisineName);

      if (cuisineId === undefined) {
        cuisineId = cuisineCount++;
        this.cuisineNameToIdentifier.set(cuisineName, cuisineId);
        this.cuisineHeaps[cuisineId] = new CuisineHeap(this.foodNames);
      }

      this.cuisineIdentifierByFood[index] = cuisineId;
    }

    // 將所有食物推入對應菜系堆
    for (let index = 0; index < totalFoods; index++) {
      const cuisineId = this.cuisineIdentifierByFood[index];
      this.cuisineHeaps[cuisineId]!.push(index, this.currentRatings[index]);
    }
  }

  // ...
}
```

### Step 3：更新指定食物的評分（changeRating）

此操作為惰性更新策略，不直接從堆中移除舊快照，而是新增一筆新紀錄，待後續查詢時清理。

```typescript
class FoodRatings {
  // Step 1：主類別與欄位宣告
  
  // Step 2：建構子 — 初始化映射與堆結構

  /**
   * 變更指定食物的評分。
   *
   * @param food - 食物名稱
   * @param newRating - 新評分
   */
  changeRating(food: string, newRating: number): void {
    const foodId = this.foodNameToIdentifier.get(food)!;
    this.currentRatings[foodId] = newRating | 0;

    const cuisineId = this.cuisineIdentifierByFood[foodId];
    this.cuisineHeaps[cuisineId]!.push(foodId, newRating | 0);
  }

  // ...
}
```

### Step 4：查詢菜系中最高評分食物（highestRated）

不斷比對堆頂快照與目前評分：

- 若一致則回傳該食物名稱
- 若不一致則移除並繼續檢查

```typescript
class FoodRatings {
  // Step 1：主類別與欄位宣告
  
  // Step 2：建構子 — 初始化映射與堆結構
  
  // Step 3：changeRating

  /**
   * 查詢菜系中目前評分最高的食物。
   * 若有多個，回傳字典序最小者。
   *
   * @param cuisine - 菜系名稱
   * @returns 該菜系最高評分食物名稱
   */
  highestRated(cuisine: string): string {
    const cuisineId = this.cuisineNameToIdentifier.get(cuisine)!;
    const heap = this.cuisineHeaps[cuisineId]!;

    while (heap.size() > 0) {
      const topFoodId = heap.topFoodId();
      const snapshotRating = heap.topSnapshotRating();

      if (snapshotRating === this.currentRatings[topFoodId]) {
        return this.foodNames[topFoodId];
      } else {
        heap.pop();
      }
    }

    return "";
  }
}
```

### Step 5：定義菜系堆類別（CuisineHeap）

此類別支援插入、查看與移除堆頂，並依據：

- 評分降序
- 名稱字典序升序來維持最大堆結構。

```typescript
/**
 * 自訂最大堆：用於維護每個菜系的食物評分。
 * 優先依評分遞減排序；若評分相同則依名稱字典序遞增。
 */
class CuisineHeap {
  private readonly heapFoodIds: number[] = [];
  private readonly heapSnapshotRatings: number[] = [];
  private readonly foodNames: string[];

  constructor(foodNames: string[]) {
    this.foodNames = foodNames;
  }

  /**
   * @returns 堆中元素數量
   */
  size(): number {
    return this.heapFoodIds.length;
  }

  /**
   * @returns 堆頂元素的 foodId
   */
  topFoodId(): number {
    return this.heapFoodIds[0];
  }

  /**
   * @returns 堆頂元素的評分快照
   */
  topSnapshotRating(): number {
    return this.heapSnapshotRatings[0];
  }

  /**
   * 插入一筆新的 (foodId, snapshotRating) 快照。
   */
  push(foodId: number, snapshotRating: number): void {
    const index = this.heapFoodIds.length;
    this.heapFoodIds.push(foodId);
    this.heapSnapshotRatings.push(snapshotRating);
    this.siftUp(index);
  }

  /**
   * 移除堆頂元素。
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
   * 比較兩節點的優先順序。
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
   * 自底向上恢復堆性質。
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
   * 自頂向下恢復堆性質。
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
   * 交換堆中兩個節點。
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
```

## 時間複雜度

- 建構期初始化：將全部食物推入堆，總計約 $O(n \log n)$。
- `changeRating`：向對應菜系堆插入一筆快照，$O(\log n)$（以該菜系食物數上界估算）。
- `highestRated`：可能彈出若干舊快照，但每筆快照僅會被彈出一次；攤銷後單次查詢 $O(\log n)$。
- 總時間複雜度為 $O(n \log n + Q \log n)$（$Q$ 為操作次數）。

> $O(n \log n + Q \log n)$

## 空間複雜度

- 基礎結構（名稱、映射、評分表、歸屬菜系表）：$O(n)$。
- 堆內快照數量與更新次數同階，最壞追加 $O(Q)$。
- 總空間複雜度為 $O(n + Q)$。

> $O(n + Q)$
