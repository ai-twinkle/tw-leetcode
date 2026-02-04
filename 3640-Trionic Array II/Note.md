# 3640. Trionic Array II

You are given an integer array `nums` of length `n`.

A trionic subarray is a contiguous subarray `nums[l...r]` (with `0 <= l < r < n`) 
for which there exist indices `l < p < q < r` such that:

- `nums[l...p]` is strictly increasing,
- `nums[p...q]` is strictly decreasing,
- `nums[q...r]` is strictly increasing.

Return the maximum sum of any trionic subarray in `nums`.

**Constraints:**

- `4 <= n = nums.length <= 10^5`
- `-10^9 <= nums[i] <= 10^9`
- It is guaranteed that at least one trionic subarray exists.

## 基礎思路

本題要找一段連續子陣列，使其能被切成三段「嚴格上升 → 嚴格下降 → 嚴格上升」，並在所有符合條件的子陣列中取**最大總和**。

在思考解法時，需要注意：

* **子陣列必須連續且嚴格**：只要相鄰元素出現「相等」，嚴格性立即被破壞，任何跨過這個邊界的候選都不合法。
* **結構有三個階段**：第一段上升、第二段下降、第三段再上升。每一階段都必須至少包含一個「相鄰嚴格變化」，因此整體至少需要足夠的長度與轉折。
* **最大總和可用狀態遞推**：從左到右掃描時，對於每個位置，我們只需要知道「以此位置結尾」的最佳候選總和，並依照當前相鄰關係（上升 / 下降 / 相等）在階段之間轉移或延伸。
* **當相鄰關係改變時，某些階段會失效**：

    * 若出現上升，代表目前可延伸第一段上升，或開始/延伸第三段上升；但第二段下降在此邊界會被打斷。
    * 若出現下降，代表目前可進入/延伸第二段下降；但上升相關階段會被打斷。
    * 若出現相等，三段嚴格性全被破壞，所有階段都必須重置。

用這種「三階段最佳結尾和」的線性掃描方式，就能在一次遍歷中求出最大 trionic 子陣列總和。

## 解題步驟

### Step 1：初始化狀態與基礎變數

準備陣列長度、負無限作為不可行狀態，並建立三個階段的「最佳結尾總和」狀態，同時準備全域答案與前一個元素的快取。

```typescript
const n = nums.length;
const negativeInfinity = Number.NEGATIVE_INFINITY;

// increasingEnd：以當前位置結尾的嚴格遞增子陣列最佳總和（長度 >= 2）
// decreasingMiddle：以當前位置結尾的「先遞增後遞減」最佳總和（目前在遞減段）
// trionicEnd：以當前位置結尾的完整「遞增後遞減後遞增」最佳總和（目前在最後遞增段）
let increasingEnd = negativeInfinity;
let decreasingMiddle = negativeInfinity;
let trionicEnd = negativeInfinity;

// 紀錄目前看過的最佳 trionic 總和
let result = negativeInfinity;

// 快取前一個值，避免重複讀取陣列
let previousValue = nums[0];
```

### Step 2：主迴圈骨架 — 逐一處理相鄰關係

從索引 1 開始掃描，每次比較 `previousValue` 與 `currentValue`，依相鄰關係（上升 / 下降 / 相等）更新狀態。

```typescript
for (let index = 1; index < n; index += 1) {
  const currentValue = nums[index];

  // ...
}
```

### Step 3：相鄰嚴格上升時的狀態更新

當相鄰關係為嚴格上升時：

* 第一段上升：可以延伸既有上升段，或以當前兩元素開啟新的上升段（長度 2）。
* 第三段上升：可以從「已完成遞減段」開始最後上升，或延伸既有最後上升。
* 遞減段在此邊界被打斷，需失效。
* 若最後上升狀態有效，更新全域答案。

```typescript
for (let index = 1; index < n; index += 1) {
  // Step 2：主迴圈骨架 — 逐一處理相鄰關係

  const currentValue = nums[index];

  if (previousValue < currentValue) {
    // 嚴格遞增邊界：更新 increasingEnd 與 trionicEnd 狀態
    const pairSum = previousValue + currentValue;

    // 延伸既有遞增段，或建立長度為 2 的新遞增段
    const extendIncreasing = increasingEnd + currentValue;
    increasingEnd = extendIncreasing > pairSum ? extendIncreasing : pairSum;

    // 從有效的遞減段開始最後遞增，或延伸既有最後遞增
    const startFinalFromDecreasing = decreasingMiddle + currentValue;
    const extendFinal = trionicEnd + currentValue;
    trionicEnd = extendFinal > startFinalFromDecreasing ? extendFinal : startFinalFromDecreasing;

    // 嚴格遞增會打斷遞減階段，因此 decreasingMiddle 在此失效
    decreasingMiddle = negativeInfinity;

    // 若 trionicEnd 有效，更新全域答案
    if (trionicEnd > result) {
      result = trionicEnd;
    }
  }

  // ...
}
```

### Step 4：相鄰嚴格下降時的狀態更新

當相鄰關係為嚴格下降時：

* 第二段下降：可以從「第一段上升」轉入下降，或延伸既有下降。
* 一旦進入下降，表示上升被打斷，因此第一段上升與最後上升都必須失效。

```typescript
for (let index = 1; index < n; index += 1) {
  // Step 2：主迴圈骨架 — 逐一處理相鄰關係

  const currentValue = nums[index];

  if (previousValue < currentValue) {
    // Step 3：相鄰嚴格上升時的狀態更新
  } else if (previousValue > currentValue) {
    // 嚴格遞減邊界：更新 decreasingMiddle 狀態
    const startDecreasingFromIncreasing = increasingEnd + currentValue;
    const extendDecreasing = decreasingMiddle + currentValue;
    decreasingMiddle = extendDecreasing > startDecreasingFromIncreasing ? extendDecreasing : startDecreasingFromIncreasing;

    // 嚴格遞減會打斷遞增與最後遞增階段，因此使其失效
    increasingEnd = negativeInfinity;
    trionicEnd = negativeInfinity;
  }

  // ...
}
```

### Step 5：相鄰相等時的狀態重置

相等會破壞「嚴格」條件，因此任何跨越此邊界的候選都不合法，三個狀態都必須失效重置。

```typescript
for (let index = 1; index < n; index += 1) {
  // Step 2：主迴圈骨架 — 逐一處理相鄰關係

  const currentValue = nums[index];

  if (previousValue < currentValue) {
    // Step 3：相鄰嚴格上升時的狀態更新
  } else if (previousValue > currentValue) {
    // Step 4：相鄰嚴格下降時的狀態更新
  } else {
    // 相等會破壞嚴格性：跨越此邊界的所有狀態都必須失效
    increasingEnd = negativeInfinity;
    decreasingMiddle = negativeInfinity;
    trionicEnd = negativeInfinity;
  }

  // ...
}
```

### Step 6：更新 previousValue 並於迴圈結束回傳答案

每輪迭代結束後更新 `previousValue`，讓下一輪比較相鄰關係使用；最後回傳全域最大值。

```typescript
for (let index = 1; index < n; index += 1) {
  // Step 2：主迴圈骨架 — 逐一處理相鄰關係

  const currentValue = nums[index];

  if (previousValue < currentValue) {
    // Step 3：相鄰嚴格上升時的狀態更新
  } else if (previousValue > currentValue) {
    // Step 4：相鄰嚴格下降時的狀態更新
  } else {
    // Step 5：相鄰相等時的狀態重置
  }

  // 更新下一輪的前一個值
  previousValue = currentValue;
}

return result;
```

## 時間複雜度

- 主迴圈從 `index = 1` 跑到 `n - 1`，共執行 **恰好 `n - 1` 次**。
- 每次迭代只做常數次比較、加法、賦值與 `if/else` 分支更新，沒有巢狀迴圈或額外掃描。
- 總時間複雜度為 $O(n)$。

> $O(n)$

## 空間複雜度

- 僅使用固定數量的變數（若干個數值狀態與快取），不隨 `n` 增長。
- 沒有額外配置與 `n` 成比例的陣列或資料結構。
- 總空間複雜度為 $O(1)$。

> $O(1)$
