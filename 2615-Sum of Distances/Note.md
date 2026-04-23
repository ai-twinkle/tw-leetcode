# 2615. Sum of Distances

You are given a 0-indexed integer array `nums`. 
There exists an array `arr` of length `nums.length`, 
where `arr[i]` is the sum of `|i - j|` over all `j` such that `nums[j] == nums[i]` and `j != i`. 
If there is no such `j`, set `arr[i]` to be `0`.

Return the array `arr`.

**Constraints:**

- `1 <= nums.length <= 10^5`
- `0 <= nums[i] <= 10^9`

## 基礎思路

本題要求對每個位置，計算所有擁有相同值的其他位置與其下標距離之總和。直觀上可以對每個值的出現位置兩兩配對計算，但若群組規模較大，暴力配對的成本過高，需要更有效率的方式。

在思考解法時，可掌握以下核心觀察：

- **相同值的位置可獨立成群處理**：
  每個值只與擁有相同值的位置互相貢獻距離，不同值之間完全無關，因此可以將所有位置依值分群，逐群計算。

- **距離總和本質為前後兩段的累計貢獻**：
  對群組中某一位置而言，其距離總和可拆分為「前方所有位置的貢獻」與「後方所有位置的貢獻」；前方每個位置貢獻 `當前下標 - 對方下標`，後方每個位置貢獻 `對方下標 - 當前下標`。

- **前綴和可將每個位置的計算降至常數時間**：
  若預先累計群組內的下標前綴和，則前後兩段的貢獻皆可在 $O(1)$ 內算出，整體計算複雜度僅取決於群組的規模。

- **排序使相同值的位置連續排列**：
  將原陣列的下標依照對應值排序後，相同值的所有位置即連續聚集，可以方便地線性掃描識別群組邊界，不需額外的雜湊結構。

依據以上特性，可以採用以下策略：

- **將下標依對應值排序，使相同值聚集為連續群組**，逐一掃描識別每個群組的起止邊界。
- **對每個群組先計算下標總和，再用前綴和逐位推算每個下標的距離總和**，達到線性時間內完成每個群組的計算。
- **最終將結果從型別化陣列轉換為標準數字陣列後回傳**。

此策略確保整體時間複雜度由排序主導，空間上僅需線性額外空間，能高效應對最大規模輸入。

## 解題步驟

### Step 1：初始化下標陣列並依對應值排序

建立一個儲存所有原始下標的陣列，再依每個下標在原陣列中對應的值進行排序，使相同值的下標連續排列，便於後續逐群處理。

```typescript
// 使用型別化陣列以在大量輸入時提升效能
const sortedIndices = new Int32Array(length);
for (let i = 0; i < length; i++) {
  sortedIndices[i] = i;
}

// 依下標對應的值排序，使相同值的下標聚集連續
sortedIndices.sort((a, b) => nums[a] - nums[b]);
```

### Step 2：初始化結果陣列

建立用來儲存每個位置距離總和的結果陣列，預設值為 0；對於群組大小為 1 的位置，其值將保持 0，無需額外處理。

```typescript
const result = new Float64Array(length);
```

### Step 3：掃描識別每個相同值的群組邊界並計算群組下標總和

以雙層掃描找出每個群組的起始與結束位置：外層指標標記當前群組起點，內層指標向後延伸直到值不同為止，確定群組終點；若群組大小大於 1，則累計該群組內所有下標的總和，供後續計算使用。

```typescript
let groupStart = 0;
while (groupStart < length) {
  // 找出當前相同值群組的結束位置
  const groupValue = nums[sortedIndices[groupStart]];
  let groupEnd = groupStart + 1;
  while (groupEnd < length && nums[sortedIndices[groupEnd]] === groupValue) {
    groupEnd++;
  }

  const groupSize = groupEnd - groupStart;

  if (groupSize > 1) {
    // 計算此群組所有下標的總和
    let totalSum = 0;
    for (let i = groupStart; i < groupEnd; i++) {
      totalSum += sortedIndices[i];
    }

    // ...
  }

  groupStart = groupEnd;
}
```

### Step 4：利用前綴和為群組內每個位置計算距離總和

在已知群組下標總和的前提下，維護一個前綴和逐位推進：對於群組中第 `positionInGroup` 個位置，前方共有 `positionInGroup` 個元素，其貢獻為 `positionInGroup * currentIndex - prefixSum`；後方共有 `groupSize - positionInGroup` 個元素，其貢獻為 `(totalSum - prefixSum - currentIndex) - (groupSize - positionInGroup - 1) * currentIndex`，合併化簡後即可在常數時間內完成計算。

```typescript
let groupStart = 0;
while (groupStart < length) {
  // Step 3：識別群組邊界並計算下標總和

  if (groupSize > 1) {
    // Step 3：計算此群組所有下標的總和

    // 使用前綴和方式以 O(1) 計算每個元素的距離總和
    let prefixSum = 0;
    for (let i = groupStart; i < groupEnd; i++) {
      const currentIndex = sortedIndices[i];
      const positionInGroup = i - groupStart;
      // 前方元素貢獻：positionInGroup * currentIndex - prefixSum
      // 後方元素貢獻：(totalSum - prefixSum) - (groupSize - positionInGroup) * currentIndex
      result[currentIndex] = totalSum - prefixSum * 2 + currentIndex * (2 * positionInGroup - groupSize);
      prefixSum += currentIndex;
    }
  }

  groupStart = groupEnd;
}
```

### Step 5：將型別化陣列轉換為標準數字陣列後回傳

將 `Float64Array` 轉換為普通的 JavaScript 數字陣列，符合題目要求的回傳型別。

```typescript
// 將 Float64Array 轉換回一般數字陣列
return Array.from(result);
```

## 時間複雜度

- 建立下標陣列需 $O(n)$；
- 依值排序下標需 $O(n \log n)$；
- 掃描所有群組並計算總和與前綴和，總共處理每個下標恰好一次，共 $O(n)$；
- 最終轉換陣列需 $O(n)$。
- 總時間複雜度為 $O(n \log n)$。

> $O(n \log n)$

## 空間複雜度

- 排序後的下標陣列佔用 $O(n)$；
- 結果陣列佔用 $O(n)$；
- 排序所需的遞迴或輔助空間為 $O(\log n)$。
- 總空間複雜度為 $O(n)$。

> $O(n)$
