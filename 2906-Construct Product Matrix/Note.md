# 2906. Construct Product Matrix

Given a 0-indexed 2D integer matrix `grid` of size `n * m`, 
we define a 0-indexed 2D matrix `p` of size `n * m` as the product matrix of `grid` if the following condition is met:

Each element `p[i][j]` is calculated as the product of all elements in `grid` except for the element `grid[i][j]`. 
This product is then taken modulo `12345`.

Return the product matrix of `grid`.

**Constraints:**

- `1 <= n == grid.length <= 10^5`
- `1 <= m == grid[i].length <= 10^5`
- `2 <= n * m <= 10^5`
- `1 <= grid[i][j] <= 10^9`

## 基礎思路

本題要求對一個二維整數矩陣中的每個位置，計算「排除自身後所有元素的乘積對 12345 取模」的結果。直觀的暴力做法是對每個位置重新遍歷全矩陣，但這在資料量龐大時效率極低。

在思考解法時，可掌握以下核心觀察：

- **排除自身的乘積可拆解為前綴與後綴的組合**：
  若將二維矩陣以列優先（row-major）順序展開為一維序列，則每個位置的「排除自身乘積」等於其左側所有元素的乘積乘以其右側所有元素的乘積。

- **前綴積與後綴積可各自一次掃描建立**：
  後綴積從序列末尾往前累積，前綴積從序列開頭往後累積，兩者都能在線性時間內完成，不需要額外儲存全部前後綴結果。

- **兩次掃描可在同一個結果矩陣上完成**：
  第一次（反向）掃描時，先將每個位置的後綴積寫入結果矩陣；第二次（正向）掃描時，再將前綴積乘入已存放後綴積的位置，最終結果即為所求。

- **取模必須在每次乘法後立即執行**：
  由於元素值最大達 $10^9$，乘積會迅速溢出，因此每次累積乘積後需立即對 12345 取模，以確保數值始終在安全範圍內。

依據以上特性，可以採用以下策略：

- **以列優先順序對二維矩陣進行兩次線性掃描**，將前綴積與後綴積的概念直接套用於二維結構，無需真正展開為一維陣列。
- **第一次反向掃描**：累積後綴積，並將每個位置的後綴積寫入結果矩陣。
- **第二次正向掃描**：累積前綴積，並與已寫入的後綴積相乘後取模，得到最終答案。

此策略以兩次線性掃描完成計算，時間複雜度最優，且僅需常數額外空間。

## 解題步驟

### Step 1：初始化維度資訊並預配置結果矩陣

讀取矩陣的列數與欄數，並預先配置與輸入相同尺寸的結果矩陣。
結果矩陣的每個 row 在兩次掃描中都會被完整寫入，因此不需要事先填充初始值。

```typescript
const rowCount = grid.length;
const columnCount = grid[0].length;

// 預先配置結果矩陣的每一列；由於每個格子都會在讀取前被寫入，不需要 .fill()
const productMatrix: number[][] = new Array(rowCount);
for (let rowIndex = 0; rowIndex < rowCount; rowIndex++) {
  productMatrix[rowIndex] = new Array(columnCount);
}
```

### Step 2：反向掃描，將後綴積寫入結果矩陣

以列優先的反向順序遍歷整個矩陣：
在每個位置，先將當前累積的後綴積寫入結果矩陣，再將該位置的原始值乘入後綴積並取模。
此步驟結束後，結果矩陣的每個位置儲存的是「排在自身之後的所有元素乘積（對 12345 取模）」。

```typescript
// 反向掃描：將每個格子的後綴積（列優先順序中位於其後的所有元素乘積）填入結果矩陣
let suffixProduct = 1;
for (let rowIndex = rowCount - 1; rowIndex >= 0; rowIndex--) {
  const gridRow = grid[rowIndex];
  const resultRow = productMatrix[rowIndex];
  for (let columnIndex = columnCount - 1; columnIndex >= 0; columnIndex--) {
    resultRow[columnIndex] = suffixProduct;
    suffixProduct = (suffixProduct * gridRow[columnIndex]) % MODULO;
  }
}
```

### Step 3：正向掃描，將前綴積乘入後綴積並取模得到最終結果

以列優先的正向順序遍歷整個矩陣：
在每個位置，將當前累積的前綴積乘入結果矩陣中已存放的後綴積，再對 12345 取模；
隨後將該位置的原始值乘入前綴積並取模，以供後續位置使用。
此步驟結束後，每個位置即為排除自身的全域乘積取模結果。

```typescript
// 正向掃描：將每個後綴積格子乘上當前前綴積，得到最終的乘積矩陣
let prefixProduct = 1;
for (let rowIndex = 0; rowIndex < rowCount; rowIndex++) {
  const gridRow = grid[rowIndex];
  const resultRow = productMatrix[rowIndex];
  for (let columnIndex = 0; columnIndex < columnCount; columnIndex++) {
    resultRow[columnIndex] = (resultRow[columnIndex] * prefixProduct) % MODULO;
    prefixProduct = (prefixProduct * gridRow[columnIndex]) % MODULO;
  }
}
```

### Step 4：回傳完成的乘積矩陣

兩次掃描完成後，結果矩陣中每個位置即為所求，直接回傳。

```typescript
return productMatrix;
```

## 時間複雜度

- 預配置結果矩陣需遍歷所有列，共 $O(n)$ 次；
- 反向掃描與正向掃描各遍歷矩陣全部 $n \times m$ 個元素一次，每次操作為常數時間；
- 總時間複雜度為 $O(n \times m)$。

> $O(n \times m)$

## 空間複雜度

- 僅使用兩個純量變數分別追蹤前綴積與後綴積，不需額外線性空間儲存前後綴陣列；
- 輸出的結果矩陣本身佔用 $O(n \times m)$ 空間，但屬於題目要求的輸出，通常不計入額外空間；
- 總空間複雜度為 $O(1)$。

> $O(1)$
