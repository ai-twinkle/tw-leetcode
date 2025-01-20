# 916. 2661. First Completely Painted Row or Column

You are given a 0-indexed integer array `arr`, and an `m x n` integer matrix `mat`. 
`arr` and `mat` both contain all the integers in the range `[1, m * n]`.

Go through each index `i` in `arr` starting from index `0` and 
paint the cell in `mat` containing the integer `arr[i]`.

Return the smallest index `i` at which either a row or a column will be completely painted in `mat`.

## 基礎思路
這題很重要的是建立索引列表，即數字對應到的行列，這樣可以快速找到對應的行列，然後進行計數，當計數等於m或n時，即找到答案。
對應表比較有效率的是構建兩個陣列，一個是行對應表，一個是列對應表，這樣可以快速找到對應的行列。
當然字典也是一個不錯的選擇，但是字典的查找效率比較低。

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

## Step 4: 返回-1

```typescript
// 如果沒有找到答案，返回-1
return -1;
```
雖然本題不會出現找不到答案的情況，但是實際應用中，這個是個好習慣。

## 時間複雜度
- 建立索引表的時間複雜度為$O(n \times m)$
- 遍歷arr的時間複雜度為$O(n \times m)$
- 總的時間複雜度為$O(n \times m)$

> $O(n \times m)$

## 空間複雜度

- 兩個索引表的空間複雜度為$O(n \times m)$
- 兩個計數表的空間複雜度為$O(n + m)$
- 總的空間複雜度為$O(n \times m)$

> $O(n \times m)$
