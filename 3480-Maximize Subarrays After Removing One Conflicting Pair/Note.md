# 3480. Maximize Subarrays After Removing One Conflicting Pair

You are given an integer `n` which represents an array `nums` containing the numbers from 1 to `n` in order. 
Additionally, you are given a 2D array `conflictingPairs`, where `conflictingPairs[i] = [a, b]` indicates that `a` and `b` form a conflicting pair.

Remove exactly one element from `conflictingPairs`. 
Afterward, count the number of non-empty subarrays of nums which do not contain both `a` and `b` for any remaining conflicting pair `[a, b]`.

Return the maximum number of subarrays possible after removing exactly one conflicting pair.

**Constraints:**

- `2 <= n <= 10^5`
- `1 <= conflictingPairs.length <= 2 * n`
- `conflictingPairs[i].length == 2`
- `1 <= conflictingPairs[i][j] <= n`
- `conflictingPairs[i][0] != conflictingPairs[i][1]`

## 基礎思路

本題的核心目標是從給定的數字陣列 `nums` 中，移除恰好一對衝突組合後，計算「不包含任何剩餘衝突對」的子陣列數量最大值。

我們可以透過以下步驟來達成：

1. 對於所有衝突對 `[a,b]`，我們固定以右端點作為基準來進行掃描（較大者作為右端點）。
2. 使用前綴和技巧，快速取得右端點對應的所有左端點。
3. 在掃描過程中，持續維護當前位置的「最遠的衝突左端點」和「次遠的衝突左端點」，據此快速計算出合法子陣列數。
4. 同時考慮若移除一個衝突對後，對整體結果可能產生的正面效益（即可增加多少額外的合法子陣列數）。
5. 最終答案即為「原始合法子陣列數」加上「移除最有利衝突對後帶來的最大效益」。

## 解題步驟

### Step 1：統計每個右端點的衝突對數量

首先，我們統計每個右端點出現的次數，以方便後續快速訪問：

```typescript
// 1. 計算每個右端點 r 所擁有的衝突對數量
const pairsPerEndpoint = new Uint32Array(n + 1);
const totalPairs = conflictingPairs.length;
for (let i = 0; i < totalPairs; ++i) {
  const [a, b] = conflictingPairs[i];
  const right = a > b ? a : b;
  pairsPerEndpoint[right]++;
}
```

### Step 2：建立前綴和陣列，計算各端點衝突對位置範圍

透過前綴和技巧，我們為每個右端點建立起始索引，使後續能快速存取每個右端點的左端點：

```typescript
// 2. 建立前綴和起始索引，快速存取每個右端點的左端點位置範圍
const startIndices = new Uint32Array(n + 2);
for (let r = 1; r <= n + 1; ++r) {
  startIndices[r] = startIndices[r - 1] + pairsPerEndpoint[r - 1];
}
```

### Step 3：將所有衝突對的左端點展平至一維陣列

將每個衝突對較小的端點（左端點）存入一個一維陣列中，以便於後續一次性掃描：

```typescript
// 3. 將所有左端點展平到一維陣列 flatLefts 中
const flatLefts = new Uint32Array(totalPairs);
const writePos = startIndices.slice();  // 複製起始索引，追蹤當前寫入位置
for (let i = 0; i < totalPairs; ++i) {
  const [a, b] = conflictingPairs[i];
  const right = a > b ? a : b;
  flatLefts[writePos[right]++] = a > b ? b : a;
}
```

### Step 4：進行掃描，計算子陣列數量與最佳增益

最後透過單次掃描每個位置，記錄當前位置最遠及次遠的衝突左端點，以快速計算合法子陣列數量，並同時更新移除衝突對後可能獲得的最大效益：

```typescript
// 4. 掃描每個位置 r，計算合法子陣列數量並找出最佳移除策略
const prefixGains = new Uint32Array(n + 1);
let baseCount = 0;
let bestGain = 0;
let highestConflictLeft = 0;
let secondHighestConflictLeft = 0;

for (let r = 1; r <= n; ++r) {
  // 處理所有以 r 為右端點的衝突對，更新最遠與次遠衝突點
  const sliceStart = startIndices[r];
  const sliceEnd   = startIndices[r + 1];
  for (let idx = sliceStart; idx < sliceEnd; ++idx) {
    const left = flatLefts[idx];
    if (left > highestConflictLeft) {
      secondHighestConflictLeft = highestConflictLeft;
      highestConflictLeft       = left;
    } else if (left > secondHighestConflictLeft) {
      secondHighestConflictLeft = left;
    }
  }

  // 計算以 r 為結尾的合法子陣列數（從最遠衝突點之後到 r）
  baseCount += r - highestConflictLeft;

  // 若移除造成最遠衝突點的衝突對，可額外增加的合法子陣列數
  if (highestConflictLeft !== 0) {
    const gain = highestConflictLeft - secondHighestConflictLeft;
    const updated = prefixGains[highestConflictLeft] + gain;
    prefixGains[highestConflictLeft] = updated;
    if (updated > bestGain) {
      bestGain = updated;
    }
  }
}
```

### Step 5：返回最終結果

```typescript
// 回傳基礎合法子陣列數加上最佳移除效益
return baseCount + bestGain;
```

## 時間複雜度

- 遍歷每個衝突對，時間複雜度為 $O(k)$。
- 建立前綴和，時間複雜度為 $O(n)$。
- 展平所有左端點，時間複雜度為 $O(k)$。
- 掃描所有數字與對應的衝突對，時間複雜度為 $O(n + k)$。
- 總時間複雜度為 $O(n + k)$，由於題目條件下 $k \le 2n$，故可簡化為 $O(n)$。

> $O(n)$

## 空間複雜度

- 使用了數個大小為 $O(n)$ 的輔助陣列（如 `pairsPerEndpoint`, `startIndices`, `prefixGains`）。
- 另有一個大小為 $O(k)$ 的陣列（`flatLefts`）。
- 總空間複雜度為 $O(n + k)$，同樣因為 $k \le 2n$，可簡化為 $O(n)$。

> $O(n)$
