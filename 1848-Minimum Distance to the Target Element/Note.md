# 1848. Minimum Distance to the Target Element

Given an integer array `nums` (0-indexed) and two integers `target` and `start`, 
find an index `i` such that `nums[i] == target` and `abs(i - start)` is minimized. 
Note that `abs(x)` is the absolute value of `x`.

Return `abs(i - start)`.

It is guaranteed that target exists in `nums`.

**Constraints:**

- `1 <= nums.length <= 1000`
- `1 <= nums[i] <= 10^4`
- `0 <= start < nums.length`
- target is in `nums`.

## 基礎思路

本題要求在陣列中找到與目標值相等的元素，並回傳該元素索引與起點之間的最小絕對距離。
由於目標值一定存在於陣列中，問題的核心在於如何高效地找到距離起點最近的匹配位置。

在思考解法時，可掌握以下核心觀察：

- **距離具有單調性**：
  從起點向外擴展時，距離只會逐漸增大，因此第一個找到的匹配元素必然對應最小距離，可立即回傳。

- **雙向同步擴展優於單向掃描**：
  若僅從頭到尾線性掃描，需遍歷所有匹配位置後才能取最小值；而從起點同時往左右擴展，一旦任一方向命中即可結束，平均效率更高。

- **邊界條件需在存取前驗證**：
  向左或向右擴展時，索引可能超出陣列範圍，必須在嘗試讀取元素前先確認索引合法。

依據以上特性，可以採用以下策略：

- **以距離為外層迴圈變數，從 0 開始逐步向外擴展**，每一輪同時檢查左右兩側的對稱位置。
- **在邊界合法的前提下，若任一側元素與目標值相符，即可直接回傳當前距離**。
- **由於題目保證目標值存在，迴圈必然在某輪終止**，無需在迴圈結束後再行處理。

此策略確保找到的第一個匹配即為最近匹配，無須比較多個候選答案。

## 解題步驟

### Step 1：記錄陣列長度以便後續邊界判斷

先取得陣列的長度，作為左右擴展時的邊界依據。

```typescript
const length = nums.length;
```

### Step 2：從起點向外雙向擴展，找到第一個匹配即回傳

以距離為迴圈變數從 0 開始遞增，每一輪同時計算左側與右側的候選索引；
若任一側索引在合法範圍內且對應元素等於目標值，則當前距離即為最小距離，直接回傳。

```typescript
// 從起點向外擴展；第一個找到的匹配保證為最小距離
for (let distance = 0; distance < length; distance++) {
  const leftIndex = start - distance;
  const rightIndex = start + distance;

  // 檢查左側邊界
  if (leftIndex >= 0 && nums[leftIndex] === target) {
    return distance;
  }

  // 檢查右側邊界
  if (rightIndex < length && nums[rightIndex] === target) {
    return distance;
  }
}
```

### Step 3：處理迴圈結束後的回傳（不可達路徑）

由於題目保證目標值一定存在於陣列中，迴圈必然在某一輪回傳，此處的 `-1` 為不可達的保底回傳值。

```typescript
// 題目保證 target 存在於 nums 中，因此此行不可達
return -1;
```

## 時間複雜度

- 迴圈從起點向外擴展，最壞情況下需掃描整個陣列，共 $n$ 次迭代；
- 每次迭代內所有操作皆為常數時間。
- 總時間複雜度為 $O(n)$。

> $O(n)$

## 空間複雜度

- 僅使用固定數量的整數變數；
- 無任何額外陣列或動態空間配置。
- 總空間複雜度為 $O(1)$。

> $O(1)$
