# 2658. Maximum Number of Fish in a Grid

You are given a 0-indexed 2D matrix grid of size `m x n`, where `(r, c)` represents:

* A land cell if `grid[r][c] = 0`, or
* A water cell containing `grid[r][c]` fish, if `grid[r][c] > 0`.

A fisher can start at any water cell `(r, c)` and can do the following operations any number of times:

* Catch all the fish at cell `(r, c)`, or
* Move to any adjacent water cell.

Return the maximum number of fish the fisher can catch if he chooses his starting cell optimally, or 0 if no water cell exists.

An adjacent cell of the cell `(r, c)`, is one of the cells `(r, c + 1)`, `(r, c - 1)`, `(r + 1, c)` or `(r - 1, c)` if it exists.

## 基礎思路
這題是典型的 DFS 問題，我們可以從每一個水域開始，然後進行 DFS，我們會捕獲該水域的魚，然後移動到相鄰的水域，進行 DFS，直到所有的連接的水域都被訪問過。
然後跳到下一個水域，重複上述步驟，直到所有的水域都被訪問過。

> Tips
> - 我們這邊用個小技巧，將 `grid` 當訪問過的水域，將其值設為 0，這樣就不用另外開一個 `visited` 陣列了。
> - 同時在遍歷每個水域時，由於我們會跳過是 0 的地方，這也同時達到了避免重複訪問的效果。

## 解題步驟

### Step 1: 取得水域的 row 和 col

```typescript
const m = grid.length;    // row
const n = grid[0].length; // col
```

### Step 2: 定義 DFS 函數

```typescript
const dfs = (x: number, y: number): number => {
  // 檢查是否超出邊界與是否為 0 (已訪問過或是陸地)
  if (x < 0 || x >= m || y < 0 || y >= n || grid[x][y] == 0) {
    return 0;
  }

  // 進行捕捉魚，並將該水域設為 0
  let fish = grid[x][y];
  grid[x][y] = 0;

  // 朝四個方向進行 DFS
  return fish + dfs(x - 1, y) + dfs(x + 1, y) + dfs(x, y - 1) + dfs(x, y + 1);
};
```

### Step 3: 遍歷所有的水域

```typescript
// 紀錄最大的魚數
let maxFish = 0;

// 訪問每一個格子，且當前格子為水域時，進行 DFS
for (let i = 0; i < m; i++) {
  for (let j = 0; j < n; j++) {
    // 跳過陸地或是已訪問過的水域
    if (grid[i][j] == 0) {
      continue;
    }

    // 更新最大獲得的魚數
    maxFish = Math.max(maxFish, dfs(i, j))
  }
}
```

## 時間複雜度
- 每個水域只會被訪問一次，所以時間複雜度為 $O(m \times n)$

> $O(m \times n)$

## 空間複雜度
- 在最壞的情況下，DFS 的遞迴深度為 $m \times n$，所以空間複雜度為 $O(m \times n)$

> $O(m \times n)$
