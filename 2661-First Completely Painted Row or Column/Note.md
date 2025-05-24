# 2661. First Completely Painted Row or Column

You are given a 0-indexed integer array `arr`, and an `m x n` integer matrix `mat`. 
`arr` and `mat` both contain all the integers in the range `[1, m * n]`.

Go through each index `i` in `arr` starting from index `0` and 
paint the cell in `mat` containing the integer `arr[i]`.

Return the smallest index `i` at which either a row or a column will be completely painted in `mat`.

**Constraints:**

- `m == mat.length`
- `n = mat[i].length`
- `arr.length == m * n`
- `1 <= m, n <= 10^5`
- `1 <= m * n <= 10^5`
- `1 <= arr[i], mat[r][c] <= m * n`
- All the integers of `arr` are unique.
- All the integers of `mat` are unique.

## 基礎思路

題目要求我們依序「塗色」矩陣中的格子，並在**第一個整行或整列被完全塗色**時回傳當前的步驟。
因為每個數字只會出現在 `mat` 中的唯一一格，所以我們能把「每個數字在矩陣中的位置」預先記錄起來。

**為了高效完成這件事，我們要做的事情包括：**

1. **建立數字對應格子的行列索引**：
   這樣每次根據 `arr[i]` 取數字，就能在 $O(1)$ 時間知道該塗色的位置。
2. **維護每行與每列已塗色的格子數量**：
   每次塗色時，將對應行、列的計數加一，並檢查是否已經全部塗滿。
3. **即時判斷是否出現首個完全被塗色的行或列**：
   當某行或某列的計數達到該行/列總格數，立即回傳答案。

這樣可以確保在**遍歷過程中，隨時快速判斷是否完成條件**，而不需重複掃描整個矩陣，達到最優效率。

## 解題步驟

### Step 1: 取得行列數

```typescript
const n = mat.length;    // 行數
const m = mat[0].length; // 列數
```

### Step 2: 建立行列對應表

```typescript
// 用來建立數字對應到行列的索引表
const numberToRow: number[] = new Array(n * m);
const numberToCol: number[] = new Array(n * m);

// 遍歷矩陣，建立數字對應到行列的索引表
for (let row = 0; row < n; row++) {
  for (let col = 0; col < m; col++) {
    const value = mat[row][col];
    numberToRow[value] = row;
    numberToCol[value] = col;
  }
}
```

### Step 3: 利用行列對應表進行計數，並找到答案

```typescript
// 用建立行列計數表
const rowCounts: number[] = new Array(n).fill(0);
const colCounts: number[] = new Array(m).fill(0);

// 遍歷arr，進行計數
for (let i = 0; i < arr.length; i++) {
  const current = arr[i];
  const row = numberToRow[current];
  const col = numberToCol[current];

  // 更新行列計數
  rowCounts[row]++;
  colCounts[col]++;

  // 判斷是否找到答案，即行計數等於m或列計數等於n
  if (rowCounts[row] === m || colCounts[col] === n) {
    return i;
  }
}
```

## Step 4: 返回 -1

雖然本題不會出現找不到答案的情況，但是實際應用中，這個是個好習慣。

```typescript
// 如果沒有找到答案，返回-1
return -1;
```

## 時間複雜度

- 建立索引表的時間複雜度為$O(n \times m)$。
- 遍歷arr的時間複雜度為$O(n \times m)$。
- 總時間複雜度為 $O(n \times m)$。

> $O(n \times m)$

## 空間複雜度

- 兩個索引表的空間複雜度為$O(n \times m)$。
- 兩個計數表的空間複雜度為$O(n + m)$。
- 總空間複雜度為 $O(n \times m)$。

> $O(n \times m)$
