# 3212. Count Submatrices With Equal Frequency of X and Y

Given a 2D character matrix grid, where `grid[i][j]` is either `'X'`, `'Y'`, or `'.'`, 
return the number of submatrices that contain:

- `grid[0][0]`
- an equal frequency of `'X'` and `'Y'`.
- at least one `'X'`.

**Constraints:**

- `1 <= grid.length, grid[i].length <= 1000`
- `grid[i][j]` is either `'X'`, `'Y'`, or `'.'`.

## 基礎思路

本題要求統計所有包含左上角 `(0, 0)` 的子矩陣中，滿足 `'X'` 與 `'Y'` 出現次數相同，且至少出現一個 `'X'` 的數量。由於子矩陣必須包含 `(0, 0)`，因此可知所有合法子矩陣都必然是從左上角開始，延伸到某個右下角位置的前綴矩形。

在思考解法時，可掌握以下核心觀察：

* **子矩陣形狀已被固定為前綴矩形**：
  因為必須包含 `(0, 0)`，所以每個候選子矩陣都可由其右下角唯一決定，不需要枚舉所有上下左右邊界。

* **判斷 `'X'` 與 `'Y'` 是否等量，可轉化為平衡值是否為 0**：
  將 `'X'` 視為 `+1`，`'Y'` 視為 `-1`，`.` 視為 `0`，則某個前綴矩形內若總和為 0，就代表 `'X'` 與 `'Y'` 的數量相同。

* **「至少一個 `'X'`」可由非空標記格搭配平衡條件推出**：
  若前綴矩形內平衡值為 0，且存在至少一個非 `'.'` 的格子，則其中不可能只包含單一種類字元，因此必然同時有 `'X'` 與 `'Y'`，自然也就滿足至少有一個 `'X'`。

* **可將二維統計拆成逐列累積，再做橫向前綴合併**：
  對每一欄維護從第一列累積到目前列的資訊，再沿著當前列由左至右建立前綴矩形，即可在走訪每個右下角時即時計算答案。

依據以上特性，可以採用以下策略：

* **先對每一欄維護目前為止的垂直累積平衡值與非空格數量**。
* **在固定某一列後，從左到右逐欄合併，形成以該列為底的所有前綴矩形資訊**。
* **當前綴矩形的平衡值為 0，且非空格數量不為 0 時，便可判定該矩形合法並累加答案**。

此策略避免了暴力枚舉所有子矩陣，能以線性掃描整個矩陣的方式完成統計。

## 解題步驟

### Step 1：取得矩陣尺寸並建立欄位累積陣列

先取得列數與欄數，接著建立兩個長度為欄數的陣列：
一個用來記錄每一欄從頂部累積到目前列的平衡值，
另一個用來記錄每一欄從頂部累積到目前列的非空格數量。

```typescript
const rowCount = grid.length;
const columnCount = grid[0].length;

// 儲存每一欄垂直累積的 (countX - countY)
const columnBalance = new Int32Array(columnCount);

// 儲存每一欄垂直累積的非點字元數量
const columnMarkedCount = new Int32Array(columnCount);
```

### Step 2：初始化答案並逐列展開前綴矩形

使用 `totalValidSubmatrices` 紀錄合法子矩陣數量。
接著逐列往下掃描；每到新的一列，就重新初始化目前這一列下的橫向前綴資訊，準備由左到右擴展前綴矩形。

```typescript
let totalValidSubmatrices = 0;

for (let row = 0; row < rowCount; row++) {
  const currentRow = grid[row];
  let prefixBalance = 0;
  let prefixMarkedCount = 0;

  // ...
}
```

### Step 3：逐欄讀取當前格子並更新該欄的垂直累積資訊

對於目前列中的每一個位置，先讀取格子內容。
若是 `'X'`，則該欄平衡值加一，非空格數量也加一；
若是 `'Y'`，則該欄平衡值減一，非空格數量也加一；
若是 `'.'`，則不需更新。

```typescript
for (let row = 0; row < rowCount; row++) {
  // Step 2：初始化答案並逐列展開前綴矩形

  for (let column = 0; column < columnCount; column++) {
    const cell = currentRow[column];

    // 更新此欄的垂直貢獻
    if (cell === 'X') {
      columnBalance[column]++;
      columnMarkedCount[column]++;
    } else if (cell === 'Y') {
      columnBalance[column]--;
      columnMarkedCount[column]++;
    }

    // ...
  }
}
```

### Step 4：把目前欄位資訊併入橫向前綴矩形

當某一欄的垂直累積資訊更新完成後，
便可將其加入目前列下、從左上角延伸到當前位置的前綴矩形中。
如此即可得到以 `(row, column)` 為右下角的整個前綴矩形狀態。

```typescript
for (let row = 0; row < rowCount; row++) {
  // Step 2：初始化答案並逐列展開前綴矩形

  for (let column = 0; column < columnCount; column++) {
    // Step 3：更新當前欄位的垂直累積資訊

    // 建立以 (row, column) 結尾的前綴矩形
    prefixBalance += columnBalance[column];
    prefixMarkedCount += columnMarkedCount[column];

    // ...
  }
}
```

### Step 5：判斷目前前綴矩形是否符合條件並累加答案

當前綴矩形的平衡值為 0，代表 `'X'` 與 `'Y'` 數量相同；
同時只要非空格數量不為 0，就表示矩形內確實有標記字元，結合平衡條件後即可保證至少存在一個 `'X'`。
此時便可將答案加一。

```typescript
for (let row = 0; row < rowCount; row++) {
  // Step 2：初始化答案並逐列展開前綴矩形

  for (let column = 0; column < columnCount; column++) {
    // Step 3：更新當前欄位的垂直累積資訊

    // Step 4：合併成目前的前綴矩形

    // X / Y 數量相等，且至少有一個 X => 平衡值為 0，且至少有一個被標記的格子
    if (prefixBalance === 0 && prefixMarkedCount !== 0) {
      totalValidSubmatrices++;
    }
  }
}
```

### Step 6：回傳所有合法前綴矩形的總數

當所有列與欄都掃描完成後，
`totalValidSubmatrices` 中即為所有符合條件的子矩陣數量，直接回傳即可。

```typescript
return totalValidSubmatrices;
```

## 時間複雜度

- 逐列逐欄掃描整個矩陣，每個格子只會被處理一次；
- 每次處理僅包含固定次數的加減、判斷與累加操作；
- 總時間複雜度為 $O(n \times m)$。

> $O(n \times m)$

## 空間複雜度

- 使用兩個長度為欄數的整數陣列來維護垂直累積資訊；
- 其餘僅使用固定數量的變數；
- 總空間複雜度為 $O(m)$。

> $O(m)$
