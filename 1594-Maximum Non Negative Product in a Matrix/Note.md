# 1594. Maximum Non Negative Product in a Matrix

You are given a `m x n` matrix `grid`. 
Initially, you are located at the top-left corner `(0, 0)`, and in each step, you can only move right or down in the matrix.

Among all possible paths starting from the top-left corner `(0, 0)` and ending in the bottom-right corner `(m - 1, n - 1)`, 
find the path with the maximum non-negative product. 
The product of a path is the product of all integers in the grid cells visited along the path.

Return the maximum non-negative product modulo `10^9 + 7`. 
If the maximum product is negative, return `-1`.

Notice that the modulo is performed after getting the maximum product.

**Constraints:**

- `m == grid.length`
- `n == grid[i].length`
- `1 <= m, n <= 15`
- `-4 <= grid[i][j] <= 4`

## 基礎思路

本題要求在一個矩陣中，從左上角出發、每步只能向右或向下移動，找到抵達右下角的路徑中乘積最大且非負的結果，並對 `10^9 + 7` 取模後回傳。若所有路徑的乘積皆為負數，則回傳 `-1`。

在思考解法時，可掌握以下核心觀察：

- **路徑乘積的正負性由負數個數決定**：
  若路徑上的負數為奇數個，則乘積為負；偶數個則為正。因此，光追蹤「最大乘積」是不夠的，同時也必須追蹤「最小乘積」。

- **負值當前格會翻轉最大與最小的來源**：
  當前格的值為負數時，以最大前驅乘積乘上負值反而會得到最小結果；以最小前驅乘積乘上負值則會得到最大結果。因此必須同時維護每格的最大與最小可達乘積。

- **取模只能在最終比較完成後進行**：
  若過早對乘積取模，將破壞大小比較的正確性。因此必須先在精確整數空間完成所有計算，最後才對最大值取模。

- **乘積數值可能極大，需使用高精度整數**：
  格子值最大為 4，路徑最長為 `m + n - 1 = 29` 步，最大乘積可達 `4^29`，超出 JavaScript 的安全整數範圍，因此需以 `BigInt` 進行運算。

依據以上特性，可以採用以下策略：

- **預先將整個矩陣轉換為一維 `BigInt` 陣列**，以確保後續運算皆在精確整數空間中進行。
- **同時維護兩張動態規劃表**，分別追蹤每格可達的最大乘積與最小乘積；第一列與第一欄因只有單一方向來源，可直接初始化。
- **一般格子從上方與左方兩個前驅中選擇最大與最小值，再依當前格符號決定如何組合**，以正確更新最大與最小乘積。
- **全部計算完成後，若右下角的最大乘積為負則回傳 `-1`，否則取模後回傳**。

此策略確保在精確整數空間中完成所有大小比較，最後才執行取模，保證結果正確。

## 解題步驟

### Step 1：初始化常數與維度資訊

先定義取模用的常數，並取得矩陣的列數、欄數與展平後的總格數，為後續一維索引存取做準備。

```typescript
const MODULO = 1_000_000_007n;
const rowCount = grid.length;
const columnCount = grid[0].length;
const totalCells = rowCount * columnCount;
```

### Step 2：將二維矩陣展平並轉換為 BigInt 陣列

為了確保後續所有乘積運算皆在精確整數空間中進行，一次性地將所有格子值轉換為 `BigInt` 並存入一維陣列，避免在每次迭代中重複裝箱。

```typescript
// 預先展平並轉換一次，以避免每次迭代時反覆進行 BigInt 裝箱
const flatGrid = new Array<bigint>(totalCells);
for (let row = 0; row < rowCount; row++) {
  for (let column = 0; column < columnCount; column++) {
    flatGrid[row * columnCount + column] = BigInt(grid[row][column]);
  }
}
```

### Step 3：建立平行的最大與最小乘積 DP 表並初始化起點

為每個格子各自建立「可達最大乘積」與「可達最小乘積」兩張表，並將起點格 `(0, 0)` 的兩個值都初始化為其自身的值。

```typescript
// 平行 DP 表：紀錄每個格子（一維索引）的最大與最小可達乘積
const dpMax = new Array<bigint>(totalCells);
const dpMin = new Array<bigint>(totalCells);

dpMax[0] = dpMin[0] = flatGrid[0];
```

### Step 4：初始化第一列——每格只能從左方到達

第一列中的每個格子只能由其左邊的格子抵達，因此最大與最小乘積相同，直接以左格乘積乘上當前格值即可。

```typescript
// 第一列：每個格子只能從左邊到達
for (let column = 1; column < columnCount; column++) {
  const product = dpMax[column - 1] * flatGrid[column];
  dpMax[column] = product;
  dpMin[column] = product;
}
```

### Step 5：初始化第一欄——每格只能從上方到達

第一欄中的每個格子只能由其上方的格子抵達，同樣地，最大與最小乘積相同，直接以上格乘積乘上當前格值即可。

```typescript
// 第一欄：每個格子只能從上方到達
for (let row = 1; row < rowCount; row++) {
  const currentIndex = row * columnCount;
  const product = dpMax[currentIndex - columnCount] * flatGrid[currentIndex];
  dpMax[currentIndex] = product;
  dpMin[currentIndex] = product;
}
```

### Step 6：填充其餘格子——從上方與左方兩個前驅中選取最大與最小

對於一般格子，其前驅可能來自上方或左方，先從兩個前驅中分別取得全局最大與最小的乘積，再進行後續的符號判斷。

```typescript
// 填充其餘格子：可從上方或左方到達
for (let row = 1; row < rowCount; row++) {
  for (let column = 1; column < columnCount; column++) {
    const currentIndex = row * columnCount + column;
    const aboveIndex = currentIndex - columnCount;
    const leftIndex = currentIndex - 1;
    const currentValue = flatGrid[currentIndex];

    // 從兩個前驅格子中取得整體最大與最小乘積
    const predecessorMax = dpMax[aboveIndex] > dpMax[leftIndex]
      ? dpMax[aboveIndex]
      : dpMax[leftIndex];
    const predecessorMin = dpMin[aboveIndex] < dpMin[leftIndex]
      ? dpMin[aboveIndex]
      : dpMin[leftIndex];

    // ...
  }
}
```

### Step 7：依當前格的符號決定如何組合前驅最大與最小乘積

當前格為非負值時，最大前驅乘以當前值得到最大結果；當前格為負值時，最小前驅（絕對值最大的負數）乘以負值反而能得到最大結果，因此需交換兩者。

```typescript
for (let row = 1; row < rowCount; row++) {
  for (let column = 1; column < columnCount; column++) {
    // Step 6：取得前驅最大與最小乘積

    // 若當前格為負值，乘數的大小關係會翻轉，最大與最小的來源互換
    if (currentValue >= 0n) {
      dpMax[currentIndex] = predecessorMax * currentValue;
      dpMin[currentIndex] = predecessorMin * currentValue;
    } else {
      dpMax[currentIndex] = predecessorMin * currentValue;
      dpMin[currentIndex] = predecessorMax * currentValue;
    }
  }
}
```

### Step 8：檢查最終結果並在取模後回傳

取得右下角的最大乘積，若為負數則不存在非負路徑，回傳 `-1`；否則在此處才執行取模，確保所有比較都已在精確整數空間中完成。

```typescript
const maximumProduct = dpMax[totalCells - 1];

// 不存在任何非負乘積的路徑
if (maximumProduct < 0n) {
  return -1;
}

// 取模僅在此處執行，確保所有精確整數比較皆已完成
return Number(maximumProduct % MODULO);
```

## 時間複雜度

- 展平並轉換矩陣需遍歷所有 $m \times n$ 個格子，耗時 $O(m \times n)$；
- 動態規劃填表同樣遍歷所有格子，每格執行常數次比較與乘法，耗時 $O(m \times n)$；
- 總時間複雜度為 $O(m \times n)$。

> $O(m \times n)$

## 空間複雜度

- 展平後的 `BigInt` 一維陣列佔用 $O(m \times n)$ 空間；
- 兩張 DP 表各佔用 $O(m \times n)$ 空間；
- 總空間複雜度為 $O(m \times n)$。

> $O(m \times n)$
