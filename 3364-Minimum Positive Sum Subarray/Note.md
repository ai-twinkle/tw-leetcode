# 3364. Minimum Positive Sum Subarray 

You are given an integer array `nums` and two integers `l` and `r`. 
Your task is to find the minimum sum of a subarray whose size is between `l` and `r` (inclusive) 
and whose sum is greater than 0.

Return the minimum sum of such a subarray. If no such subarray exists, return -1.

A subarray is a contiguous non-empty sequence of elements within an array.

**Constraints:**

- `1 <= nums.length <= 100`
- `1 <= l <= r <= nums.length`
- `-1000 <= nums[i] <= 1000`

## 基礎思路

本題要求在所有長度介於 `l` 與 `r` 之間的連續子陣列中，找出「總和大於 0」者的最小總和；
若不存在任何符合條件的子陣列，則回傳 `-1`。由於陣列長度最多僅 100，可以枚舉所有合法區間，但仍應避免每次重新累加區間元素。

在思考解法時，可掌握以下核心觀察：

- **區間和可由前綴和差值快速取得**：
  預先計算前綴和後，任一連續區間的總和都能以兩個前綴和相減在常數時間內求得，不需逐一累加。

- **合法區間可由終點與長度限制界定**：
  固定區間終點後，起點只能落在使長度介於 `[l, r]` 的範圍內，且起點不可小於陣列開頭，因此每個終點只需檢查有限個起點。

- **答案必須嚴格為正**：
  非正的區間和不納入考慮，只在正數範圍內追蹤最小值。

- **整數總和的最小正值為 1**：
  所有元素皆為整數，因此正的區間和不可能小於 1；一旦找到總和為 1 的區間，即可立即結束搜尋。

依據以上特性，可以採用以下策略：

- **先建立前綴和**，讓任意區間和都能在常數時間內取得。
- **枚舉每個區間終點，並在長度限制內枚舉所有合法起點**，計算對應的區間和。
- **只以正的區間和更新最小值，遇到 1 時提前返回**；若從未找到正的區間和，則回傳 `-1`。

此策略能以簡潔的枚舉配合前綴和，在題目規模內高效求得答案。

## 解題步驟

### Step 1：初始化陣列長度與無解哨兵值

先取得陣列長度，並設定一個極大的哨兵值，代表「尚未找到任何正的區間和」。

```typescript
const length = nums.length;
const noAnswerSentinel = 2147483647;
```

### Step 2：建立前綴和陣列

以型別化陣列建立長度為 `length + 1` 的前綴和，第 `i` 項代表前 `i` 個元素的總和。由於最大絕對值為 100 × 1000，足以放入 32 位元整數。

```typescript
// 以型別化陣列建立前綴和（最大絕對值為 100 * 1000，可容納於 Int32）
const prefixSum = new Int32Array(length + 1);
for (let index = 0; index < length; index++) {
  prefixSum[index + 1] = prefixSum[index] + nums[index];
}
```

### Step 3：初始化最小正區間和

將目前找到的最小正區間和設為哨兵值，之後只在找到更小的正數時更新。

```typescript
let minimumPositiveSum = noAnswerSentinel;
```

### Step 4：枚舉區間終點並計算起點下界

從長度至少為 `l` 的位置開始枚舉每個區間終點，取出該終點的前綴和，並計算起點的最小可能位置：長度不可超過 `r`，起點也不可小於 0。

```typescript
for (let endIndex = l; endIndex <= length; endIndex++) {
  const endPrefix = prefixSum[endIndex];
  const lowestStartIndex = endIndex - r > 0 ? endIndex - r : 0;

  // ...
}
```

### Step 5：枚舉合法起點並計算區間和

在固定終點下，由長度為 `l` 的起點開始往前枚舉，直到起點下界為止，並以前綴和差值取得每個候選區間的總和。

```typescript
for (let endIndex = l; endIndex <= length; endIndex++) {
  // Step 4：取得終點前綴和並計算起點下界

  // 檢查每個能使區間長度維持在 [l, r] 範圍內的起點
  for (let startIndex = endIndex - l; startIndex >= lowestStartIndex; startIndex--) {
    const windowSum = endPrefix - prefixSum[startIndex];

    // ...
  }
}
```

### Step 6：以正的區間和更新最小值，並在遇到 1 時提前返回

只有當區間和大於 0 且小於目前最小值時才進行處理。若該值為 1，已是可能的最小正整數，直接回傳；否則更新最小正區間和。

```typescript
for (let endIndex = l; endIndex <= length; endIndex++) {
  // Step 4：取得終點前綴和並計算起點下界

  for (let startIndex = endIndex - l; startIndex >= lowestStartIndex; startIndex--) {
    // Step 5：計算當前區間和

    if (windowSum > 0 && windowSum < minimumPositiveSum) {
      // 1 是整數總和中最小的正值，因此可立即停止
      if (windowSum === 1) {
        return 1;
      }
      minimumPositiveSum = windowSum;
    }
  }
}
```

### Step 7：依是否找到答案回傳結果

若最小正區間和仍為哨兵值，代表不存在符合條件的子陣列，回傳 `-1`；否則回傳所找到的最小正區間和。

```typescript
return minimumPositiveSum === noAnswerSentinel ? -1 : minimumPositiveSum;
```

## 時間複雜度

- 建立前綴和需一次線性掃描，為 $O(n)$；
- 每個終點最多檢查 $r - l + 1$ 個起點，共 $O(n \cdot (r - l + 1))$；
- 由於 $r - l + 1 \le n$，總時間複雜度為 $O(n^2)$。

> $O(n^2)$

## 空間複雜度

- 需要一個長度為 $n + 1$ 的前綴和陣列；
- 其餘僅使用固定數量的變數。
- 總空間複雜度為 $O(n)$。

> $O(n)$
