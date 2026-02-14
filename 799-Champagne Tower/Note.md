# 799. Champagne Tower

We stack glasses in a pyramid, where the first row has `1` glass, 
the second row has 2 glasses, and so on until the 100th row.  
Each glass holds one cup of champagne.

Then, some champagne is poured into the first glass at the top.  
When the topmost glass is full, any excess liquid poured will fall equally to the glass immediately to the left and right of it.  
When those glasses become full, any excess champagne will fall equally to the left and right of those glasses, and so on.  
(A glass at the bottom row has its excess champagne fall on the floor.)

For example, after one cup of champagne is poured, the top most glass is full. 
After two cups of champagne are poured, the two glasses on the second row are half full. 
After three cups of champagne are poured, those two cups become full - there are 3 full glasses total now. 
After four cups of champagne are poured, the third row has the middle glass half full, 
and the two outside glasses are a quarter full, as pictured below.

**Constraints:**

- `0 <= poured <= 10^9`
- `0 <= queryGlass <= queryRow < 100`

## 基礎思路

本題描述香檳由塔頂往下流動的過程：每個杯子最多容納 1 杯，超出的部分會平均分到下一列相鄰的兩個杯子。要求的是指定列與指定位置的杯子最後的裝滿比例。

在思考解法時，可掌握以下核心觀察：

* **流動只與「溢出量」有關**：杯子內最多保留 1 杯，只有超過 1 的部分才會往下分流。
* **每一列只依賴上一列狀態**：某一列的每個杯子，僅會接收上一列相鄰杯子的溢出分配，因此可逐列推進。
* **不需要模擬到第 100 列**：題目查詢只到 `queryRow`，只需推進到目標列即可得到答案。
* **最後答案需裁切到合法範圍**：杯子不可能小於 0，也不可能超過 1，因此輸出必須落在 `[0, 1]`。

依據以上特性，可以採用以下策略：

* 逐列維護每個杯子的液量，並將每個杯子的正溢出平均分配到下一列兩個相鄰位置。
* 由於每次只會用到上一列與下一列，可用兩個固定大小的容器反覆交換，避免額外記憶體開銷。
* 推進到目標列後，直接取出目標杯子的液量並裁切成比例回傳。

## 解題步驟

### Step 1：初始化兩列緩衝區並放入初始倒入量

先準備「目前列」與「下一列」兩個固定大小的緩衝區，以支援逐列推進；並將所有倒入量放到塔頂，作為流動起點。

```typescript
// 重用兩個固定大小的 TypedArray，避免每列重新配置並降低 GC 開銷。
const maxRowIndexInclusive = queryRow;
const rowBufferSize = maxRowIndexInclusive + 2;

let currentRow = new Float64Array(rowBufferSize);
let nextRow = new Float64Array(rowBufferSize);

currentRow[0] = poured;
```

### Step 2：逐列推進並在每次迭代前清空將被寫入的範圍

每次處理一列時，下一列只會寫到固定的索引範圍，因此僅清空本輪會用到的部分，避免不必要的全陣列重設成本。

```typescript
for (let rowIndex = 0; rowIndex < maxRowIndexInclusive; rowIndex++) {
  // 只清空本輪會被寫入的部分（索引 0...rowIndex+1）。
  for (let clearIndex = 0; clearIndex <= rowIndex + 1; clearIndex++) {
    nextRow[clearIndex] = 0;
  }

  // ...
}
```

### Step 3：計算每個杯子的正溢出並平均分配到下一列相鄰杯子

對目前列的每個杯子，若其液量超過 1，則取出超出的部分並平均分給下一列的左右相鄰位置；若未滿則不會往下流動。

```typescript
for (let rowIndex = 0; rowIndex < maxRowIndexInclusive; rowIndex++) {
  // Step 2：清空下一列將被寫入的範圍

  // 只傳遞正溢出量；每個杯子最多容納 1 杯。
  for (let glassIndex = 0; glassIndex <= rowIndex; glassIndex++) {
    const amountInGlass = currentRow[glassIndex];
    if (amountInGlass > 1) {
      const overflowShare = (amountInGlass - 1) * 0.5;
      nextRow[glassIndex] += overflowShare;
      nextRow[glassIndex + 1] += overflowShare;
    }
  }

  // ...
}
```

### Step 4：交換兩列緩衝區以進入下一輪推進

完成本列對下一列的累積後，直接交換「目前列」與「下一列」的引用，讓下一次迭代以新的一列作為來源，持續往下推進到目標列。

```typescript
for (let rowIndex = 0; rowIndex < maxRowIndexInclusive; rowIndex++) {
  // Step 2：清空下一列將被寫入的範圍

  // Step 3：傳遞正溢出量到下一列

  // 交換緩衝區以進入下一輪。
  const temp = currentRow;
  currentRow = nextRow;
  nextRow = temp;
}
```

### Step 5：取得目標杯子的液量並裁切成合法比例回傳

推進完成後，目標列已在目前緩衝區中；取出指定位置的液量，並依照杯子容量將結果裁切到 `[0, 1]` 範圍後回傳。

```typescript
const result = currentRow[queryGlass];
if (result >= 1) {
  return 1;
}
if (result <= 0) {
  return 0;
}
return result;
```

## 時間複雜度

- 只需推進到 `queryRow`，共進行 `queryRow` 次列迭代。
- 第 `r` 列需要處理 `r + 1` 個杯子，總處理量為前 `queryRow` 列的三角形總和。
- 總時間複雜度為 $O(n^2)$。

> $O(n^2)$

## 空間複雜度

- 只使用兩個長度約為 `queryRow` 的固定緩衝區來存放相鄰兩列狀態。
- 其餘僅為常數額外變數。
- 總空間複雜度為 $O(n)$。

> $O(n)$
