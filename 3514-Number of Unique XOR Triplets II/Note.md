# 3514. Number of Unique XOR Triplets II

You are given an integer array `nums`.

A XOR triplet is defined as the XOR of three elements `nums[i] XOR nums[j] XOR nums[k]` 
where `i <= j <= k`.

Return the number of unique XOR triplet values from all possible triplets `(i, j, k)`.

**Constraints:**

- `1 <= nums.length <= 1500`
- `1 <= nums[i] <= 1500`

## 基礎思路

本題要求計算所有滿足 `i <= j <= k` 的三元組其互斥或（XOR）結果，並統計其中相異值的總數。由於索引允許重複，實際上等同於「從陣列中可重複挑選三個元素進行 XOR」的所有可能結果集合。

在思考解法時，可掌握以下核心觀察：

- **數值範圍受限於 11 位元**：
  題目限制每個元素不超過 1500，而任意數量的 XOR 結果不會超出參與運算的最高位元範圍，因此所有可能結果必定落在 `[0, 2048)` 之間，最多僅有 2048 種相異值。

- **重複數值不影響結果集合**：
  XOR 只關心參與的數值本身，同一數值出現多次不會產生新的結果，因此可先去除重複，僅保留相異值參與運算。

- **索引重複等價於補上單元素與空集合的情況**：
  當三個索引相同時結果為該元素本身；當其中兩個索引相同時，兩者互相抵銷為 0，等同於只取單一元素。因此在建立成對結果時必須額外納入 0，才能完整涵蓋這些退化情形。

- **三元 XOR 可拆解為兩階段組合**：
  先求出所有相異的「兩元素 XOR 結果」，再與所有相異的單一數值組合一次，即可覆蓋全部三元組的結果，避免三重迴圈的枚舉成本。

- **結果空間有上限可提前終止**：
  由於結果總數不可能超過 2048，一旦累積的相異結果達到上限，即可立即結束後續運算。

依據以上特性，可以採用以下策略：

- **以位元標記陣列記錄出現過的數值**，並壓縮為緊湊的相異值列表以加速內層迴圈。
- **分階段建立成對 XOR 集合，再與單一數值集合結合成三元結果集合**。
- **在達到值域上限時提前回傳，避免不必要的枚舉**。

此策略將原本可能高達三次方的枚舉量，壓縮至受限於值域大小的組合運算，效率穩定且可控。

## 解題步驟

### Step 1：初始化基本參數與值域上限

先取得陣列長度，並定義結果值域的上限為 2048（即 11 位元所能表示的完整範圍）。

```typescript
const length = nums.length;
const LIMIT = 2048;
```

### Step 2：以數學性質處理元素數量過多的特例

當元素數量已達到或超過值域上限時，三元 XOR 的結果必然涵蓋整個 11 位元空間，可直接回傳上限值。

```typescript
// 數學捷徑：當元素數量達到 LIMIT 時，三元組的結果空間必然涵蓋整個 11 位元範圍。
if (length >= LIMIT) {
  return LIMIT;
}
```

### Step 3：標記所有出現過的單一數值

使用位元標記陣列記錄 `[0, 2048)` 範圍內哪些數值曾經出現，藉此自然去除重複。

```typescript
// 在 [0, 2048) 上以位元集合標記哪些單一數值存在。
const singlePresent = new Uint8Array(LIMIT);
for (let index = 0; index < length; index++) {
  singlePresent[nums[index]] = 1;
}
```

### Step 4：壓縮相異單值為緊湊陣列

將標記陣列中為真的數值依序收集成連續列表，使後續的雙層迴圈能以最小的迭代次數進行。

```typescript
// 將相異的單一數值壓縮成緊湊陣列，以利內層迴圈高效迭代。
const singleValues = new Uint16Array(LIMIT);
let singleCount = 0;
for (let value = 0; value < LIMIT; value++) {
  if (singlePresent[value] === 1) {
    singleValues[singleCount++] = value;
  }
}
```

### Step 5：枚舉所有成對 XOR 結果

建立成對結果的標記陣列，並先納入 0 以涵蓋兩索引相同而互相抵銷的情況；接著兩兩組合所有相異單值，標記其 XOR 結果。

```typescript
// 所有成對的 XOR 結果，包含 i == j 而得到 0 的情況。
const pairPresent = new Uint8Array(LIMIT);
pairPresent[0] = 1;
for (let firstIndex = 0; firstIndex < singleCount; firstIndex++) {
  const firstValue = singleValues[firstIndex];
  for (let secondIndex = firstIndex + 1; secondIndex < singleCount; secondIndex++) {
    pairPresent[firstValue ^ singleValues[secondIndex]] = 1;
  }
}
```

### Step 6：壓縮相異成對結果為緊湊陣列

同樣將成對結果的標記陣列壓縮為連續列表，供最後一階段組合使用。

```typescript
// 將相異的成對 XOR 結果壓縮成緊湊陣列。
const pairValues = new Uint16Array(LIMIT);
let pairCount = 0;
for (let value = 0; value < LIMIT; value++) {
  if (pairPresent[value] === 1) {
    pairValues[pairCount++] = value;
  }
}
```

### Step 7：將成對結果與單一數值組合為三元結果

以雙層迴圈遍歷每個相異成對結果與每個相異單值，計算其 XOR 作為三元組的結果值。

```typescript
// 將每個相異的成對 XOR 結果與每個相異的單一數值組合。
const tripletPresent = new Uint8Array(LIMIT);
let tripletCount = 0;
for (let pairIndex = 0; pairIndex < pairCount; pairIndex++) {
  const pairValue = pairValues[pairIndex];
  for (let singleIndex = 0; singleIndex < singleCount; singleIndex++) {
    const result = pairValue ^ singleValues[singleIndex];

    // ...
  }
}
```

### Step 8：記錄新出現的三元結果並在達到上限時提前結束

若該結果為首次出現，則標記並累計數量；一旦累計數量達到值域上限，代表整個空間已被覆蓋，可立即回傳。

```typescript
for (let pairIndex = 0; pairIndex < pairCount; pairIndex++) {
  const pairValue = pairValues[pairIndex];
  for (let singleIndex = 0; singleIndex < singleCount; singleIndex++) {
    // Step 7：計算成對結果與單值的 XOR

    if (tripletPresent[result] === 0) {
      tripletPresent[result] = 1;
      tripletCount++;

      // 一旦完整的 11 位元空間都被覆蓋，即可提前結束。
      if (tripletCount === LIMIT) {
        return LIMIT;
      }
    }
  }
}
```

### Step 9：回傳相異三元結果的總數

當所有組合枚舉完畢後，累計的數量即為相異 XOR 三元組結果的個數。

```typescript
return tripletCount;
```

## 時間複雜度

- 展平與標記所有輸入數值需 $O(n)$；
- 掃描值域以壓縮相異值需 $O(V)$，其中 $V = 2048$ 為值域上限；
- 枚舉所有成對組合需 $O(V^2)$；
- 將成對結果與單值組合亦需 $O(V^2)$。
- 總時間複雜度為 $O(n + V^2)$。

> $O(n + V^2)$

## 空間複雜度

- 單值、成對、三元三組標記陣列與兩組壓縮陣列皆為固定長度 $V$；
- 除此之外僅使用常數個輔助變數。
- 總空間複雜度為 $O(V)$。

> $O(V)$
