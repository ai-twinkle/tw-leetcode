# 135. Candy

There are `n` children standing in a line. 
Each child is assigned a rating value given in the integer array ratings.

You are giving candies to these children subjected to the following requirements:

- Each child must have at least one candy.
- Children with a higher rating get more candies than their neighbors.

Return the minimum number of candies you need to have to distribute the candies to the children.

**Constraints:**

- `n == ratings.length`
- `1 <= n <= 2 * 10^4`
- `0 <= ratings[i] <= 2 * 10^4`

## 基礎思路

本題需要最小化糖果的分配數量，並滿足兩個條件：

- 每個孩子至少要分到一顆糖。
- 評分較高的孩子必須比鄰近的孩子分到更多糖果。

觀察題目可知，每個孩子的糖果數量同時受到左右兩側鄰居的評分影響，因此可以透過兩次獨立的掃描分別處理左鄰與右鄰的關係，最終再合併兩側條件：

- 第一次從左到右掃描，只處理「左側鄰居」的糖果條件。
- 第二次從右到左掃描，處理「右側鄰居」的糖果條件，同時累加每個位置的糖果數量。

透過上述兩次掃描，即可保證最終分配的糖果同時滿足左右兩邊的要求，並且為最少總數。

## 解題步驟

### Step 1: 初始化糖果陣列

- 若陣列為空則不需分配糖果，直接回傳 `0`。
- 配置並初始化每個孩子的糖果數量至少為 `1`，滿足題目最基本的糖果需求。

```typescript
// 1. 快取孩子數量並在為空時返回
const numberOfChildren = ratings.length;
if (numberOfChildren === 0) {
  return 0;
}

// 2. 配置一個 Uint16Array (0…65 535) 來保存每個孩子的糖果數量，並全部初始化為 1
//    （每個孩子必須至少分配到 1 顆糖）
const candyCounts = new Uint16Array(numberOfChildren);
candyCounts.fill(1);

// 3. 快取引用以加快迴圈內的查找
const ratingList = ratings;
const counts = candyCounts;
const lastIndex = numberOfChildren - 1;
```

### Step 2: 從左到右掃描（左鄰關係）

- 若當前孩子的評分比左邊孩子高，則糖果數目必須多一顆。
- 若不符合條件，保持初始值 `1`。

```typescript
// 4. 左到右掃描：如果當前評分大於前一個評分，給予比前一個多一顆糖
for (let i = 1; i < numberOfChildren; ++i) {
  if (ratingList[i] > ratingList[i - 1]) {
    counts[i] = counts[i - 1] + 1;
  }
}
```

### Step 3: 從右到左掃描（右鄰關係）並累加總糖果數

- 從右往左掃描，檢查當前孩子評分是否高於右鄰，若高於則須調整糖果數量。
- 累計每個孩子的糖果數量至 `totalCandies`，並回傳此值。

```typescript
// 5. 右到左掃描並累加總數：
//    如果當前評分大於下一個評分，確保 counts[i] > counts[i + 1]
let totalCandies = counts[lastIndex];
for (let i = lastIndex - 1; i >= 0; --i) {
  if (ratingList[i] > ratingList[i + 1]) {
    const required = counts[i + 1] + 1;
    if (required > counts[i]) {
      counts[i] = required;
    }
  }
  totalCandies += counts[i];
}

return totalCandies;
```

## 時間複雜度

- 進行兩次單向掃描，每次皆為線性掃描，複雜度為 $O(n)$。
- 總時間複雜度為 $O(n)$。

> $O(n)$

## 空間複雜度

- 使用一個大小為 $n$ 的額外陣列儲存糖果數量。
- 總空間複雜度為 $O(n)$。

> $O(n)$
