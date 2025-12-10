# 3583. Count Special Triplets

You are given an integer array `nums`.

A special triplet is defined as a triplet of indices `(i, j, k)` such that:

- `0 <= i < j < k < n`, where `n = nums.length`
- `nums[i] == nums[j] * 2`
- `nums[k] == nums[j] * 2`

Return the total number of special triplets in the array.

Since the answer may be large, return it modulo `10^9 + 7`.

**Constraints:**

- `3 <= n == nums.length <= 10^5`
- `0 <= nums[i] <= 10^5`

## 基礎思路

本題要求計算所有滿足以下條件的三元組 `(i, j, k)` 數量：

* `i < j < k`
* `nums[i] = 2 * nums[j]`
* `nums[k] = 2 * nums[j]`

等同於：
**固定中間值 `nums[j] = v`，則需要左側出現 `2v`，右側也要出現 `2v`。**

若要有效率地處理整個陣列，我們需觀察以下特性：

* **以 j 作為中心掃描一次即可：**
  將每個位置視為可能的 `j`，同時統計左側與右側 `2 * nums[j]` 的次數，就能得到以該位置為中心的三元組數量。

* **右側出現次數可事先統計：**
  一開始將所有值放於「右側計數器」，隨著 j 往右移動，各值會從右側減少。

* **左側出現次數於掃描過程慢慢累積：**
  當位置進入左側（掃描越過），就加入左側的計數器。

* **三元組數量 = 左側出現次數 × 右側出現次數**
  因為 `(i, j, k)` 的組合彼此獨立，只需做次數相乘。

* 由於 `nums[i]` 最大為 `1e5`，可使用固定大小的 **TypedArray** 作為計數器，效率與記憶體皆受控制。

整體可於 **單趟掃描 O(n)** 完成所有計算。

## 解題步驟

### Step 1：初始化常數、陣列與右側計數

建立最大範圍的計數陣列，並先將所有元素放入 `rightCountArray` 中，表示「全部都在右側」。

```typescript
const MODULO = 1_000_000_007;
const length = nums.length;

// 根據 constraints: 0 <= nums[i] <= 1e5
const MAXIMUM_VALUE = 100_000;

// 左右側的值頻率表（TypedArray 提供快速存取）
const leftCountArray = new Uint32Array(MAXIMUM_VALUE + 1);
const rightCountArray = new Uint32Array(MAXIMUM_VALUE + 1);

// 預先建立右側所有值的頻率
for (let index = 0; index < length; index++) {
  const currentValue = nums[index];
  rightCountArray[currentValue]++;
}

let tripletCount = 0;
```

### Step 2：主迴圈 — 逐一將每個位置視為中間索引 j

對每個 `middleIndex`，先將當前值從右側扣除，再依條件計算對應的三元組數量，最後將其加入左側。

```typescript
for (let middleIndex = 0; middleIndex < length; middleIndex++) {
  const middleValue = nums[middleIndex];

  // 當前位置離開右側，故不能再作為 k
  rightCountArray[middleValue]--;

  // 計算兩側需匹配的值 doubledValue = 2 * middleValue
  const doubledValue = middleValue << 1;

  // ...
}
```

### Step 3：若 doubledValue 合法，計算左右側匹配次數貢獻

必須確保 `nums[i] = nums[k] = doubledValue` 才能形成三元組。

```typescript
for (let middleIndex = 0; middleIndex < length; middleIndex++) {
  // Step 2：主迴圈 — 將 middleValue 從右側扣除

  // 確保 doubledValue 在合法值域中
  if (doubledValue <= MAXIMUM_VALUE) {
    const leftOccurrences = leftCountArray[doubledValue];
    const rightOccurrences = rightCountArray[doubledValue];

    // 左右側皆存在時才有有效三元組
    if (leftOccurrences !== 0 && rightOccurrences !== 0) {
      tripletCount += leftOccurrences * rightOccurrences;
    }
  }

  // ...
}
```

### Step 4：middleValue 現在成為左側候選，供未來位置使用

```typescript
for (let middleIndex = 0; middleIndex < length; middleIndex++) {
  // Step 2：主迴圈 — 將 middleValue 從右側扣除

  // Step 3：左右側匹配次數計算

  // 扫描越過後，該值可作為左側 nums[i] 使用
  leftCountArray[middleValue]++;
}

// 最後只需一次取模
return tripletCount % MODULO;
```

## 時間複雜度

- 建立右側計數器需要一次遍歷：`O(n)`
- 主迴圈針對每個位置做 O(1) 更新：`O(n)`
- 其他操作皆為常數級
- 總時間複雜度為 $O(n)$

> $O(n)$

## 空間複雜度

- 使用兩個大小為 `100001` 的 `Uint32Array`：`O(MAX_VALUE)`，可視為常數
- 其他變數皆為常數級
- 總空間複雜度為 $O(1)$

> $O(1)$
