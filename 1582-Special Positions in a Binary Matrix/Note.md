# 1582. Special Positions in a Binary Matrix

Given an m x n binary matrix `mat`, return the number of special positions in `mat`.

A position `(i, j)` is called special if `mat[i][j] == 1` 
and all other elements in row `i` and column `j` are `0` (rows and columns are 0-indexed).

**Constraints:**

- `m == mat.length`
- `n == mat[i].length`
- `1 <= m, n <= 100`
- `mat[i][j]` is either `0` or `1`.

## 基礎思路

本題要找出矩陣中「特殊位置」的數量：某位置為 `1`，且同一列與同一行的其他元素皆為 `0`。核心是把「同列同行唯一性」轉成可快速驗證的統計條件。

可掌握以下關鍵觀察：

* **特殊位置的判定可拆成兩個獨立必要條件**
  某位置要成立，必須同時滿足：該列的 `1` 數量恰好為 1、該行的 `1` 數量恰好為 1。

* **先統計列與行的 `1` 數量，再做候選驗證**
  先取得每列與每行的 `1` 計數後，只需針對「列計數為 1」的列做驗證即可。

* **需要記住每列唯一 `1` 的所在行**
  若一列恰好只有一個 `1`，就必須知道它在哪一行，才能直接檢查對應行的計數是否也為 1，而不必再次掃描。

整體流程：

* 第一次掃描矩陣：統計每列與每行的 `1` 數量，並記錄每列第一次遇到 `1` 的行索引。
* 第二次掃描列：只針對列計數為 1 的列，檢查其對應行計數是否也為 1，成立則累加答案。

## 解題步驟

### Step 1：初始化矩陣維度與列行計數容器

先取得矩陣列數與行數，並建立兩個計數容器分別統計每一列與每一行的 `1` 數量。

```typescript
const rowCount = mat.length;
const columnCount = mat[0].length;

const onesInRow = new Uint8Array(rowCount);
const onesInColumn = new Uint8Array(columnCount);
```

### Step 2：初始化每列第一個 `1` 的欄位索引紀錄

為了在第二階段能快速定位「該列唯一的 `1`」所在欄位，建立索引紀錄容器並以 `-1` 初始化。

```typescript
// 對每一列，儲存該列第一次遇到的 '1' 的欄位索引。
// 只有當該列剛好包含一個 '1' 時，這個值才有意義。
const firstOneColumnIndexInRow = new Int16Array(rowCount);
firstOneColumnIndexInRow.fill(-1);
```

### Step 3：建立外層列走訪並取得當前列

第一階段採用單次走訪矩陣，因此先建立外層列迴圈，並取得當前列以供後續欄位掃描使用。

```typescript
// 單次走訪以統計每一列與每一行的 '1' 數量。
// 同時記錄每一列第一次看到 '1' 的欄位位置。
for (let rowIndex = 0; rowIndex < rowCount; rowIndex++) {
  const currentRow = mat[rowIndex];

  // ...
}
```

### Step 4：在外層骨架內加入內層欄位走訪並跳過非 `1` 的位置

延續 Step 3 的外層骨架，因此此步驟不可重複展開已講解內容，需以 `// Step 3` 佔位，並加入欄位走訪與篩選條件，只在遇到 `1` 時才進入後續統計。

```typescript
// 單次走訪以統計每一列與每一行的 '1' 數量。
// 同時記錄每一列第一次看到 '1' 的欄位位置。
for (let rowIndex = 0; rowIndex < rowCount; rowIndex++) {
  // Step 3：建立外層列走訪並取得當前列

  for (let columnIndex = 0; columnIndex < columnCount; columnIndex++) {
    if (currentRow[columnIndex] !== 1) {
      continue;
    }

    // ...
  }
}
```

### Step 5：遇到 `1` 時更新列計數並記錄首次出現的欄位索引

當掃到 `1` 時，更新該列的 `1` 計數；若此列第一次遇到 `1`，則記錄其欄位索引作為候選位置。

```typescript
// 單次走訪以統計每一列與每一行的 '1' 數量。
// 同時記錄每一列第一次看到 '1' 的欄位位置。
for (let rowIndex = 0; rowIndex < rowCount; rowIndex++) {
  // Step 3：建立外層列走訪並取得當前列

  for (let columnIndex = 0; columnIndex < columnCount; columnIndex++) {
    // Step 4：加入內層欄位走訪並跳過非 '1' 的位置

    // 增加該列的計數，並儲存第一個 '1' 的位置。
    const updatedRowCount = onesInRow[rowIndex] + 1;
    onesInRow[rowIndex] = updatedRowCount;

    if (updatedRowCount === 1) {
      firstOneColumnIndexInRow[rowIndex] = columnIndex;
    }

    // ...
  }
}
```

### Step 6：同步更新行計數以完成第一階段統計

同一個 `1` 也需累加到其所在行的計數中，讓第二階段能直接驗證行唯一性。

```typescript
// 單次走訪以統計每一列與每一行的 '1' 數量。
// 同時記錄每一列第一次看到 '1' 的欄位位置。
for (let rowIndex = 0; rowIndex < rowCount; rowIndex++) {
  // Step 3：建立外層列走訪並取得當前列

  for (let columnIndex = 0; columnIndex < columnCount; columnIndex++) {
    // Step 4：加入內層欄位走訪並跳過非 '1' 的位置

    // Step 5：更新列計數並記錄首次出現的欄位索引

    // 增加該行的計數，以便後續驗證。
    onesInColumn[columnIndex]++;
  }
}
```

### Step 7：建立第二階段候選列篩選並初始化答案

只有列中 `1` 數量為 1 的列才可能產生特殊位置，因此先篩選候選列並初始化答案累加器。

```typescript
// 只有 '1' 數量剛好為 1 的列才可能包含特殊位置。
// 對這些列，檢查其對應的行是否也剛好只有一個 '1'。
let specialCount = 0;
for (let rowIndex = 0; rowIndex < rowCount; rowIndex++) {
  if (onesInRow[rowIndex] !== 1) {
    continue;
  }

  // ...
}
```

### Step 8：驗證候選列對應的行是否也恰有一個 `1` 並累加

取出候選列唯一 `1` 的欄位索引，檢查該欄的行計數是否為 1；若成立則累加答案。

```typescript
// 只有 '1' 數量剛好為 1 的列才可能包含特殊位置。
// 對這些列，檢查其對應的行是否也剛好只有一個 '1'。
let specialCount = 0;
for (let rowIndex = 0; rowIndex < rowCount; rowIndex++) {
  // Step 7：建立第二階段候選列篩選並初始化答案

  const columnIndex = firstOneColumnIndexInRow[rowIndex];
  if (onesInColumn[columnIndex] !== 1) {
    continue;
  }

  specialCount++;
}
```

### Step 9：回傳答案

完成所有檢查後，回傳特殊位置總數。

```typescript
return specialCount;
```

## 時間複雜度

- 第一階段完整走訪矩陣一次，成本為 $O(m \times n)$。
- 第二階段掃描所有列一次，成本為 $O(m)$。
- 總時間複雜度為 $O(m \times n)$。

> $O(m \times n)$

## 空間複雜度

- 額外使用列計數、行計數與每列候選欄位索引，合計為 $O(m + n)$。
- 總空間複雜度為 $O(m + n)$。

> $O(m + n)$
