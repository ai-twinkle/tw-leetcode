# 1267. Count Servers that Communicate

You are given a map of a server center, represented as a `m * n` integer matrix `grid`, 
where 1 means that on that cell there is a server and 0 means that it is no server. 
Two servers are said to communicate if they are on the same row or on the same column.

Return the number of servers that communicate with any other server.

## 基礎思路
可以溝通的條件是在同一行或同一列，那麼換句話說，就是他所處的行或列上的伺服器數量大於 1，那麼這個伺服器就可以溝通。
那麼問題就分解成了兩個部分，一個是計算每一行與每一列的伺服器數量，然後逐一檢查這個伺服器是否可以溝通。

## 解題步驟

### Step 1: 紀錄每一行與每一列的伺服器數量

```typescript
const m = grid.length;
const n = grid[0].length;
```

### Step 2: 計算每一行與每一列的伺服器數量

```typescript
// 紀錄每一行與每一列的伺服器數量
const serverCountInRow = new Array(m).fill(0);
const serverCountInCol = new Array(n).fill(0);

// 遍歷 grid，計算每一行與每一列的伺服器數量
for (let i = 0; i < m; i++) {
  for (let j = 0; j < n; j++) {
    if (grid[i][j] === 1) {
      serverCountInRow[i]++;
      serverCountInCol[j]++;
    }
  }
}
```

### Step 3: 計算可以溝通的伺服器數量

```typescript
let count = 0;
for (let i = 0; i < m; i++) {
  for (let j = 0; j < n; j++) {
    // 我們會在以下情況跳過
    // 1. 這個位置沒有伺服器
    // 2. 這個伺服器所在的行或列只有一個伺服器
    if (grid[i][j] === 0 || serverCountInRow[i] === 1 && serverCountInCol[j] === 1) {
      continue;
    }

    count++;
  }
}
```

## 時間複雜度
- 計算每一行與每一列的伺服器數量需要 $O(m * n)$ 的時間
- 計算可以溝通的伺服器數量需要 $O(m * n)$ 的時間
- 因此總時間複雜度為 $O(m * n)$

> $O(m * n)$

## 空間複雜度
- 我們需要兩個陣列來記錄每一行與每一列的伺服器數量，因此空間複雜度為 $O(m + n)$
- 紀錄其他變數的空間複雜度為 $O(1)$
- 因此總空間複雜度為 $O(m + n)$

> $O(m + n)$
