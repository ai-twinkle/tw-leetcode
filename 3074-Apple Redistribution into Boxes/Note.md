# 3074. Apple Redistribution into Boxes

You are given an array apple of size `n` and an array capacity of size `m`.

There are `n` packs where the $i^{th}$ pack contains `apple[i]` apples. 
There are `m` boxes as well, and the ith box has a capacity of `capacity[i]` apples.

Return the minimum number of boxes you need to select to redistribute these `n` packs of apples into boxes.

Note that, apples from the same pack can be distributed into different boxes.

**Constraints:**

- `1 <= n == apple.length <= 50`
- `1 <= m == capacity.length <= 50`
- `1 <= apple[i], capacity[i] <= 50`
- The input is generated such that it's possible to redistribute packs of apples into boxes.

## 基礎思路

本題要把所有蘋果分配進一些箱子裡，而且**同一包蘋果可以拆到不同箱子**，因此問題本質會簡化成：

* 我們只需要知道 **總蘋果數量** `totalApples`。
* 接著要選一些箱子，使得「被選箱子的容量總和」**至少**是 `totalApples`，並且**箱子數量最少**。

要讓箱子數最少，直覺上應該**優先選容量大的箱子**，因為每選一個大箱子能更快降低剩餘需求，所需箱子數也會更少。

另外，題目限制 `capacity[i]` 落在 `1..50`，範圍很小，因此可以用「容量次數統計」來取代排序：
先統計每種容量有幾個箱子，再從容量 50 由大到小依序取用，直到容量總和覆蓋所有蘋果。

## 解題步驟

### Step 1：計算總蘋果數量

把所有 `apple[i]` 加總，得到需要被箱子容量覆蓋的總需求。

```typescript
let totalApples = 0;
for (let appleIndex = 0; appleIndex < apple.length; appleIndex++) {
  totalApples += apple[appleIndex];
}
```

### Step 2：統計每種容量的箱子數量

容量只在 `1..50`，用計數表記錄每個容量出現次數，避免排序的額外成本。

```typescript
// 統計容量次數（1..50）以避免 sort() 的額外負擔
const capacityCount = new Int8Array(51);
for (let boxIndex = 0; boxIndex < capacity.length; boxIndex++) {
  capacityCount[capacity[boxIndex]]++;
}
```

### Step 3：由大到小貪心選箱子直到覆蓋所有蘋果

從最大容量開始取箱子，持續扣掉剩餘需求；一旦剩餘需求 `<= 0`，代表容量已足夠，直接回傳使用箱子數。

```typescript
let remainingApples = totalApples;
let usedBoxes = 0;

// 以貪心方式從最大容量到最小容量挑選箱子，直到所有蘋果都能放下
for (let currentCapacity = 50; currentCapacity >= 1; currentCapacity--) {
  let currentCount = capacityCount[currentCapacity];
  while (currentCount > 0) {
    remainingApples -= currentCapacity;
    usedBoxes++;

    if (remainingApples <= 0) {
      return usedBoxes;
    }

    currentCount--;
  }
}


// 依題目限制必定可行，但保留安全回傳
return capacity.length;
```

## 時間複雜度

- 加總 `apple`：完整掃描一次，為 $O(n)$。
- 統計 `capacity` 次數：完整掃描一次，為 $O(m)$。
- 貪心選箱子：外層容量迴圈固定 50 次（常數），內層 `while` 合計最多消耗每個箱子一次，總次數不超過 `m`，因此為 $O(m)$。
- 總時間複雜度為 $O(n + m)$。

> $O(n + m)$

## 空間複雜度

- `capacityCount` 為長度 51 的計數表，為常數空間。
- 其餘變數皆為常數個數。
- 總空間複雜度為 $O(1)$。

> $O(1)$
