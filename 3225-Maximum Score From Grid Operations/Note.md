# 3225. Maximum Score From Grid Operations

You are given a 2D matrix `grid` of size `n x n`. 
Initially, all cells of the grid are colored white. 
In one operation, you can select any cell of indices `(i, j)`, 
and color black all the cells of the $j^th$ column starting from the top row down to the $i^{th}$ row.

The `grid` score is the sum of all `grid[i][j]` such that cell `(i, j)` is white and it has a horizontally adjacent black cell.

Return the maximum score that can be achieved after some number of operations.

**Constraints:**

- `1 <= n == grid.length <= 100`
- `n == grid[i].length`
- `0 <= grid[i][j] <= 10^9`

## 基礎思路

本題要求在一個 `n x n` 的方格中，透過操作將部分格子塗黑（每次操作會將某欄從頂端往下連續塗黑至指定列），使得「白色格子且水平方向緊鄰黑色格子」的分數總和最大化。

在思考解法時，可掌握以下核心觀察：

- **黑色格子的形狀為「列前綴」**：
  每欄最終的黑色區域必為從第 0 列到某個高度 `h[j]` 的連續前綴（`h[j] = 0` 代表該欄全白），因此問題可轉換為替每欄選擇一個高度值。

- **得分僅來自於左右相鄰欄的高度差**：
  一個白色格子 `(i, j)` 能得分，當且僅當它本身未被塗黑（`i >= h[j]`），且左欄或右欄有黑格覆蓋到第 `i` 列（即 `h[j-1] > i` 或 `h[j+1] > i`）。對某欄 `j` 而言，其白色格在左鄰貢獻的總和，等於欄 `j` 中高度介於 `[h[j], h[j-1])` 的元素之和——即 `colPrefix[j][max(h[j-1], h[j+1])] - colPrefix[j][h[j]]`（當 `max > h[j]` 時）。

- **相鄰欄之間的依賴關係適合動態規劃**：
  每欄 `j` 的貢獻由 `h[j-1]`、`h[j]`、`h[j+1]` 共同決定，構成三元相依，可以使用「滑動二維 DP 狀態 `dp[a][b]`（代表前一欄高度為 `a`、當前欄高度為 `b` 時的最佳累積分數）」逐欄推進。

- **狀態轉移中存在前後綴極值優化的機會**：
  對每個 `(b, c)` 的轉移，需對所有合法的 `a` 取最大值，而 `a` 的貢獻可按照 `a <= c` 與 `a > c` 分為兩種情形，分別對應前綴最大值與後綴最大值（後者帶有欄前綴和的加成），可預先計算以將轉移降至 $O(1)$。

依據以上特性，可以採用以下策略：

- **預計算每欄的列前綴和**，以 $O(1)$ 查詢任意高度區間的元素總和。
- **以滑動二維 DP 逐欄處理**，狀態為「前欄高度」與「當前欄高度」的組合，轉移時引入「下一欄高度」。
- **對每個 `b` 預建前綴最大值與帶加成的後綴最大值**，使每個 `(b, c)` 的轉移降為 $O(1)$，令整體複雜度保持在可接受範圍內。
- **首欄與末欄單獨處理**，因為它們只有單側相鄰欄，貢獻計算邏輯與中間欄不同。

此策略能在保證正確性的同時，有效處理所有欄的高度選擇，求得最大總分。

## 解題步驟

### Step 1：處理只有單欄的邊界情況

當 `n = 1` 時，任何格子都沒有水平相鄰格，因此得分恆為 0，直接回傳。

```typescript
const n = grid.length;
// 只有一欄時不存在水平相鄰格，白色格子無法得分。
if (n === 1) {
  return 0;
}
```

### Step 2：預計算每欄的列前綴和

為了能以 $O(1)$ 查詢任意欄在高度區間 `[lo, hi)` 的元素總和，預先對每欄建立列方向的前綴和陣列，並以扁平化的 `Float64Array` 儲存以利快取存取。
`colPrefix[j * stride + k]` 代表第 `j` 欄前 `k` 列（即第 `0` 到 `k-1` 列）的元素總和。

```typescript
// 以扁平 Float64Array 儲存欄方向前綴和，提升快取命中率。
// colPrefix[j * stride + k] = grid[0..k-1][j] 的總和
const stride = n + 1;
const colPrefix = new Float64Array(n * stride);
for (let j = 0; j < n; j++) {
  const base = j * stride;
  let running = 0;
  for (let i = 0; i < n; i++) {
    running += grid[i][j];
    colPrefix[base + i + 1] = running;
  }
}
```

### Step 3：初始化 DP 陣列並為第 0、1 欄建立初始狀態

以 `dp[a * stride + b]` 表示「第 0 欄高度為 `a`、第 1 欄高度為 `b`」時，前兩欄中已可確定的最佳累積分數。
第 0 欄沒有左側相鄰欄，其白色格的得分僅來自第 1 欄（高度 `b`）對其造成的右側貢獻：當 `b > a` 時，貢獻為第 0 欄在高度 `[a, b)` 的元素總和。

```typescript
// dp[a * stride + b] 記錄當 h[j-1] = a、h[j] = b 時，所有 j 以前已確定欄的最佳累積分數。
let dp = new Float64Array(stride * stride);
let next = new Float64Array(stride * stride);

// 以 j = 1 為基點建立初始值：放置 h[0] = a、h[1] = b。
// 第 0 欄無左鄰，其貢獻僅取決於 h[1] = b：當 b > a 時，計入 [a, b) 高度段的元素。
for (let a = 0; a <= n; a++) {
  for (let b = 0; b <= n; b++) {
    let contribution = 0;
    if (b > a) {
      contribution = colPrefix[b] - colPrefix[a];
    }
    dp[a * stride + b] = contribution;
  }
}
```

### Step 4：準備每輪轉移使用的暫存緩衝區

為了在每個 `(b, c)` 的轉移中達到 $O(1)$ 的查詢，預先宣告兩個可重複使用的緩衝陣列：
前者儲存對所有 `a` 的前綴最大值，後者儲存帶有欄前綴和加成的後綴最大值。

```typescript
// 可重複使用的暫存緩衝區，以 a（= h[j-1]）為索引。
const prefMaxOverA = new Float64Array(stride);
const suffMaxBoostedOverA = new Float64Array(stride);
```

### Step 5：逐欄推進 DP，為每個 `b` 預建前綴與後綴最大值

在每一輪（對應欄 `j`）的轉移前，針對每個固定的 `b` 值，分別計算：
前綴最大值 `prefMaxOverA[a]`（代表在所有 `a' <= a` 中 `dp[a'][b]` 的最大值）；
後綴最大值 `suffMaxBoostedOverA[a]`（代表在所有 `a' >= a` 中 `dp[a'][b] + colPrefix[j][a']` 的最大值）。

```typescript
// 處理 j = 1 .. n-2：以左鄰 h[j-1] = a 與右鄰 h[j+1] = c 閉合第 j 欄。
// 欄 j 的貢獻 = colPrefix[j][max(a, c)] - colPrefix[j][b]，當 max(a, c) > b 時。
for (let j = 1; j <= n - 2; j++) {
  const colBaseJ = j * stride;

  // 對每個 b，預建兩種對 a 的歸約，使 (b, c) 的轉移降至 O(1)。
  for (let b = 0; b <= n; b++) {
    // dp[a][b] 在 a in [0, k] 的前綴最大值
    let runningPrefMax = -Infinity;
    for (let a = 0; a <= n; a++) {
      const value = dp[a * stride + b];
      if (value > runningPrefMax) {
        runningPrefMax = value;
      }
      prefMaxOverA[a] = runningPrefMax;
    }

    // (dp[a][b] + colPrefix[j][a]) 在 a in [k, n] 的後綴最大值
    let runningSuffMax = -Infinity;
    for (let a = n; a >= 0; a--) {
      const boosted = dp[a * stride + b] + colPrefix[colBaseJ + a];
      if (boosted > runningSuffMax) {
        runningSuffMax = boosted;
      }
      suffMaxBoostedOverA[a] = runningSuffMax;
    }

    // ...
  }

  // ...
}
```

### Step 6：利用預建的前後綴最大值完成每個 `(b, c)` 的轉移

對每個 `(b, c)` 組合，分為兩個情形計算最佳轉移值：
情形 A（`a <= c`，`max(a, c) = c`）：貢獻僅由 `c` 決定，查詢前綴最大值即可；
情形 B（`a > c`，`max(a, c) = a`）：貢獻與 `a` 相關，需查詢後綴最大值，並視 `a` 與 `b` 的大小關係進一步拆分。
取兩情形的最大值寫入 `next[b * stride + c]`。

```typescript
for (let j = 1; j <= n - 2; j++) {
  const colBaseJ = j * stride;

  for (let b = 0; b <= n; b++) {
    // Step 5：預建前綴與後綴最大值

    const subtractAtB = colPrefix[colBaseJ + b];
    const nextRowBase = b * stride;

    for (let c = 0; c <= n; c++) {
      // 情形 A（a <= c，max(a,c) = c）：貢獻僅取決於 c。
      let caseA = prefMaxOverA[c];
      if (c > b) {
        caseA += colPrefix[colBaseJ + c] - subtractAtB;
      }

      // 情形 B（a > c，max(a,c) = a）：依 a 是否大於 b 決定貢獻計算方式。
      let caseB = -Infinity;
      if (c + 1 <= n) {
        if (c >= b) {
          // 所有 a > c 均滿足 a > b，直接使用帶加成的後綴最大值。
          caseB = suffMaxBoostedOverA[c + 1] - subtractAtB;
        } else {
          // a in (c, b]：貢獻為 0；a in (b, n]：使用帶加成形式。
          let lowPart = -Infinity;
          if (b >= c + 1) {
            // 上界；若最大值的 a 位於 [0, c]，情形 A 已涵蓋。
            lowPart = prefMaxOverA[b];
          }
          let highPart = -Infinity;
          if (b + 1 <= n) {
            highPart = suffMaxBoostedOverA[b + 1] - subtractAtB;
          }
          caseB = lowPart > highPart ? lowPart : highPart;
        }
      }

      next[nextRowBase + c] = caseA > caseB ? caseA : caseB;
    }
  }

  // 滾動緩衝區
  const tmp = dp;
  dp = next;
  next = tmp;
}
```

### Step 7：處理最後一欄並求出最大總分

最後一欄（欄 `n-1`）沒有右側相鄰欄，其白色格的得分僅來自左側貢獻：當 `a > b` 時，貢獻為該欄在高度 `[b, a)` 的元素總和。
遍歷所有 `(a, b)` 狀態，將 DP 值與最後一欄的貢獻相加，取全域最大值作為答案。

```typescript
// 以左鄰 a = h[n-2] 閉合最後一欄 n-1。
let maximumGridScore = 0;
const colBaseLast = (n - 1) * stride;
for (let a = 0; a <= n; a++) {
  const rowBase = a * stride;
  const colSumAtA = colPrefix[colBaseLast + a];
  for (let b = 0; b <= n; b++) {
    const stateScore = dp[rowBase + b];
    let contribution = 0;
    if (a > b) {
      contribution = colSumAtA - colPrefix[colBaseLast + b];
    }
    const total = stateScore + contribution;
    if (total > maximumGridScore) {
      maximumGridScore = total;
    }
  }
}

return maximumGridScore;
```

## 時間複雜度

- 預計算欄前綴和需 $O(n^2)$；
- 初始化 DP 初始狀態需 $O(n^2)$；
- 主迴圈共 $O(n)$ 輪，每輪對每個 `b` 建立前後綴最大值需 $O(n)$，對每個 `(b, c)` 轉移需 $O(n^2)$，合計每輪 $O(n^2)$，共 $O(n^3)$；
- 最後一欄的收尾遍歷需 $O(n^2)$。
- 總時間複雜度為 $O(n^3)$。

> $O(n^3)$

## 空間複雜度

- 欄前綴和陣列佔用 $O(n^2)$；
- 兩個滾動 DP 陣列各佔 $O(n^2)$；
- 兩個暫存緩衝陣列各佔 $O(n)$。
- 總空間複雜度為 $O(n^2)$。

> $O(n^2)$
