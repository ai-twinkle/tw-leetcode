# 1590. Make Sum Divisible by P

Given an array of positive integers `nums`, remove the smallest subarray (possibly empty) such that the sum of the remaining elements is divisible by `p`. 
It is not allowed to remove the whole array.

Return the length of the smallest subarray that you need to remove, or `-1` if it's impossible.

A subarray is defined as a contiguous block of elements in the array.

**Constraints:**

- `1 <= nums.length <= 10^5`
- `1 <= nums[i] <= 10^9`
- `1 <= p <= 10^9`

## 基礎思路

本題要求移除最短的連續子陣列，使得剩餘元素總和可以被 `p` 整除。由於不能移除整個陣列，因此必須找出**長度最小且可修正餘數的子段**。

可掌握以下核心觀察：

* **總和能否被 p 整除，取決於總和對 p 的餘數**
  若總和 `S % p = r`，代表我們需移除某段子陣列，使被移除的這段和的餘數也為 `r`，才能抵銷掉整體餘數。

* **欲移除的子陣列是連續的，因此可用前綴和模 p 來表示其餘數**
  子陣列 `[l, r]` 的和可表示為：
  `(prefix[r] − prefix[l−1]) % p`
  若此值等於 `r`，即代表移除此段能讓總和變為可被 p 整除。

* **前綴和餘數的差值可精準建構所需的子陣列**
  欲使 `(currentPrefix − previousPrefix) % p = targetRemainder`，即可倒推出 `previousPrefix` 需為某特定值。

* **保持某餘數類別的最新索引，有助於縮短可移除的子段長度**
  每次遇到某個前綴餘數，都可以更新其最新出現位置，使後續計算的候選子段更短。

* **單次掃描即可完成整體推導**
  隨著前綴和餘數逐步累積，便能透過查詢 map 快速找到符合條件的移除段落。

透過上述觀察，可利用前綴和模 p、哈希表與線性掃描達成本題要求。

## 解題步驟

### Step 1：處理 p = 1 的快速結論

若 `p = 1`，任何整數都能被 1 整除，因此無需移除任何子陣列。

```typescript
// 任何整數總和都能被 1 整除，因此無須移除
if (p === 1) {
  return 0;
}
```

### Step 2：計算整體總和模 p，並找出需抵銷的目標餘數

以線性方式累計 `nums` 的總和並取模，若結果為 0，代表已可整除，無需移除子陣列。

```typescript
// 使用累加方式計算總和模 p，避免中間值變大
let totalSumModulo = 0;
for (let index = 0; index < length; index++) {
  // 維持總和模 p，以保持數值界線
  totalSumModulo = (totalSumModulo + nums[index]) % p;
}

// 若總和已可整除，則無須移除任何子陣列
if (totalSumModulo === 0) {
  return 0;
}

const targetRemainder = totalSumModulo;
```

### Step 3：建立餘數對應索引的映射，用以尋找可移除區段的起點

使用 Map 記錄「前綴餘數 → 最新出現位置」，並初始化餘數 0 對應到索引 −1，以方便處理從開頭移除的情況。

```typescript
// 儲存前綴餘數對應其最新索引的位置
const remainderIndexMap = new Map<number, number>();
remainderIndexMap.set(0, -1);

let currentPrefixModulo = 0;
let minimumRemovalLength = length;
```

### Step 4：單次掃描陣列，逐步計算前綴和餘數並檢查最短可移除區段

以線性迴圈維持前綴餘數，並利用 Map 查找是否存在可構成符合條件的區段；同時維護最短移除長度。

```typescript
// 單次掃描：持續更新前綴餘數並查找可移除的最短區段
for (let index = 0; index < length; index++) {
  // 維持前綴餘數在範圍內
  currentPrefixModulo = (currentPrefixModulo + nums[index]) % p;

  // 要求前綴餘數滿足 (currentPrefixModulo - previous) % p === targetRemainder
  const requiredRemainder =
    (currentPrefixModulo - targetRemainder + p) % p;

  // 查詢符合條件的先前前綴位置
  const previousIndex = remainderIndexMap.get(requiredRemainder);

  if (previousIndex !== undefined) {
    const candidateLength = index - previousIndex;

    // 不允許移除整個陣列
    if (
      candidateLength < minimumRemovalLength &&
      candidateLength < length
    ) {
      // 更新目前找到的最短移除子陣列
      minimumRemovalLength = candidateLength;
    }
  }

  // 記錄此餘數最新出現的位置，以縮短未來可能的移除段
  remainderIndexMap.set(currentPrefixModulo, index);
}
```

### Step 5：回傳答案，若未找到有效子陣列則回傳 -1

若無任何子段能使結果可整除 `p`，則結果維持初始值，需回傳 −1。

```typescript
// 若未找到任何有效子陣列，則回傳 -1
if (minimumRemovalLength === length) {
  return -1;
}

return minimumRemovalLength;
```

## 時間複雜度

- 計算總和模 p 需要線性掃描。
- 主迴圈再次線性掃描陣列。
- Map 查詢與更新皆為均攤常數時間。
- 總時間複雜度為 $O(n)$。

> $O(n)$

## 空間複雜度

- Map 最多儲存 n 個餘數對應索引。
- 其餘使用固定數量變數。
- 總空間複雜度為 $O(n)$。

> $O(n)$
