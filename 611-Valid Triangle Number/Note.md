# 611. Valid Triangle Number

Given an integer array `nums`, return the number of triplets chosen from the array that can make triangles if we take them as side lengths of a triangle.

**Constraints:**

- `1 <= nums.length <= 1000`
- `0 <= nums[i] <= 1000`

## 基礎思路

本題要求計數：從整數陣列 `nums` 中選取三邊，使其能構成**三角形**的三元組數量。

三角形成立的**充分必要條件**為：對任意三邊 $a \le b \le c$，必須滿足 **$a + b > c$**。
因此，若我們能將邊長**排序**，就可以固定最大邊 $c$，再於其左側用雙指針在線性時間內計數符合 $a + b > c$ 的組合。

在思考解法時需要注意：

- **零值與非正數**：任一邊為 0（或非正）都不可能形成三角形，可直接忽略以縮小問題規模。
- **排序成本**：一般排序為 $O(n \log n)$。但本題邊長上限僅為 1000，可用**計數排序**在 $O(n + U)$（$U = 1000$）時間內將正值排序，同時移除零。
- **雙指針計數**：排序後，對每個最大邊 $c$，用兩個指針在區間 $[0, k-1]$ 上線性掃描，當發現 $a + b > c$ 時，因為陣列已排序，與較大的 $b$ 搭配的更小 $a$ 都成立，能一次性累加多組。

為了解決這個問題，我們可以採用以下策略：

- **使用計數排序處理正值**：利用邊長範圍有限，對陣列進行線性排序，並將正值壓縮至前綴區間。
- **在正值區間上雙指針遍歷**：固定最大邊，透過左、右指針快速計算所有滿足條件的 `(a, b, c)` 組合。
- **避免重複記憶體配置造成垃圾回收開銷**：使用可重用的型別化陣列（TypedArray）作為緩衝區，以減少記憶體配置次數，降低 JavaScript 垃圾回收（Garbage Collection）成本。
- **提前過濾無效條件**：對小於 3 項的輸入與有效邊不足的情況做早期返回，節省計算資源。

## 解題步驟

### Step 1：常數與可重用緩衝宣告

宣告邊長上限常數與**可重用**計數排序緩衝，避免重複配置造成 JavaScript 垃圾回收壓力。

```typescript
// 於多次呼叫間重複使用的型別化緩衝，降低 Garbage Collection 壓力
const MAX_VALUE_TRIANGLE = 1000;
const frequencyBufferTriangle = new Int32Array(MAX_VALUE_TRIANGLE + 1);
```

### Step 2：`countingSortPositiveInPlace` — 正值計數排序（就地寫回）

以邊長上限 1000 做**計數排序**：忽略所有非正數（尤其是 0），將**正值**升序就地寫回原陣列前綴，並回傳正值的**邏輯長度** `m`。

```typescript
/**
 * 使用可重用的計數緩衝，對輸入就地做計數排序（升序）。
 * 會跳過 0，因為包含 0 的三元組不可能形成三角形。
 *
 * @param nums 輸入陣列（會被就地修改）
 * @returns number 回傳移除 0 後的正值個數（新邏輯長度）
 */
function countingSortPositiveInPlace(nums: number[]): number {
  // 清空計數緩衝（U 很小：1001）
  frequencyBufferTriangle.fill(0);

  // 建立每個值的出現次數；快速略過 <= 0 的數值
  const n = nums.length;
  for (let i = 0; i < n; i++) {
    const value = nums[i] | 0; // 強制 32 位元
    // 依據題目約束做防護：非正數直接忽略
    if (value <= 0) {
      continue;
    }
    // 依約束，value ∈ [1...1000]
    frequencyBufferTriangle[value]++;
  }

  // 依值域由小到大，將正值寫回原陣列前綴
  let writeIndex = 0;
  for (let value = 1; value <= MAX_VALUE_TRIANGLE; value++) {
    let count = frequencyBufferTriangle[value];
    while (count > 0) {
      nums[writeIndex] = value;
      writeIndex++;
      count--;
    }
  }

  // 回傳正值元素個數
  return writeIndex;
}
```

### Step 3：`countTrianglesTwoPointer` — 排序後的雙指針計數

在已排序的正值前綴上，固定最大邊 `k`，用左右指針在 `[0, k-1]` 計數所有滿足 `a + b > c` 的組合；若成立，左側到 `right-1` 都成立，可一次加上 `(right - left)`。

```typescript
/**
 * 在「已排序且僅含正值」的陣列前綴上，以雙指針計數可形成三角形的三元組數。
 *
 * @param nums 已排序、僅含正值的陣列；使用範圍為 [0...m-1]
 * @param m 正值的邏輯長度
 * @returns 可形成三角形的三元組數
 */
function countTrianglesTwoPointer(nums: number[], m: number): number {
  let tripletCount = 0;

  // 固定最大邊索引 k，左右指針在 [0, k-1] 內移動
  for (let k = m - 1; k > 1; k--) {
    const thirdSide = nums[k] | 0;

    let left = 0;
    let right = k - 1;

    while (left < right) {
      // 讀入區域變數，利於 JIT 區域性與少量微優化
      const firstSide = nums[left] | 0;
      const secondSide = nums[right] | 0;

      // 三角形條件：a + b > c
      if ((firstSide + secondSide) > thirdSide) {
        // 若 first + second > third，則對當前 right，
        // 從 left 到 right-1 的所有 first 都成立，直接累加
        tripletCount += (right - left);
        right--;
      } else {
        // 否則需要更大的 a，移動 left
        left++;
      }
    }
  }

  return tripletCount;
}
```

### Step 4：`triangleNumber` — 主流程（計數排序 + 雙指針）

先處理小陣列特例，接著以計數排序產生**正值升序前綴**與其長度 `m`；若 `m < 3` 直接回傳 0；否則在該前綴上進行雙指針計數並回傳結果。

```typescript
/**
 * 回傳可形成三角形的三元組數量。
 *
 * 先以計數排序（O(n + U), U=1000）處理正值與排序，
 * 再在正值前綴上做 O(m^2) 的雙指針計數；整體記憶體配置最小化，熱路徑使用型別化陣列。
 *
 * @param nums 輸入的整數邊長（排序會就地修改）
 * @return 三元組總數
 */
function triangleNumber(nums: number[]): number {
  // 極小輸入的快速返回
  if (nums.length < 3) {
    return 0;
  }

  // 就地計數排序正值並移除 0，回傳正值長度
  const positiveLength = countingSortPositiveInPlace(nums);

  // 正值不足三個，必定無法構成三角形
  if (positiveLength < 3) {
    return 0;
  }

  // 在正值、已排序的前綴上做雙指針計數
  const total = countTrianglesTwoPointer(nums, positiveLength);

  return total | 0; // 保持 32 位帶符號整數
}
```

## 時間複雜度

- 計數排序：$O(n + U)$，其中 $n$ 為輸入長度、$U=1000$ 為值域上限（常數級）。
- 雙指針計數：在正值前綴長度為 $m$ 的範圍上，外層固定最大邊、內層左右指針線性掃描，總計 $O(m^2)$。
- 總時間複雜度為 $O(n + m^2)$，最壞情況（全部為正且可用）有 $m \approx n$，即 **$O(n^2)$**。

> $O(n + m^2)$

## 空間複雜度

- 額外使用一個大小為 $U+1$ 的計數緩衝，$U=1000$ 為常數級。
- 除此之外皆為 $O(1)$ 額外空間，排序就地進行。
- 總空間複雜度為 $O(U)$，以 $U=1000$ 視為常數，等價於 **$O(1)$**（相對於 $n$）。

> $O(1)$
