# 2257. Count Unguarded Cells in the Grid

You are given two integers `m` and `n` representing a 0-indexed `m x n` grid. 
You are also given two 2D integer arrays `guards` and `walls` where `guards[i] = [row_i, col_i]` and `walls[j] = [row_j, col_j]` represent the positions of the $i^{th}$ guard and $j^{th}$ wall respectively.

A guard can see every cell in the four cardinal directions (north, east, south, or west) starting from their position unless obstructed by a wall or another guard. 
A cell is guarded if there is at least one guard that can see it.

Return the number of unoccupied cells that are not guarded.

**Constraints:**

- `1 <= m, n <= 10^5`
- `2 <= m * n <= 10^5`
- `1 <= guards.length, walls.length <= 5 * 10^4`
- `2 <= guards.length + walls.length <= m * n`
- `guards[i].length == walls[j].length == 2`
- `0 <= row_i, row_j < m`
- `0 <= col_i, col_j < n`
- All the positions in `guards` and `walls` are unique.

## 基礎思路

本題要求在一個由牆壁 (`walls`) 與警衛 (`guards`) 組成的 $m \times n$ 網格中，計算「沒有被警衛看守、也沒有被佔據」的格子數量。警衛能沿著四個基本方向（上、下、左、右）直線觀察，直到被牆或另一名警衛阻擋。

在分析問題時，我們需要考慮以下幾個重點：

- **遮蔽條件**：警衛的視線會被「牆壁」或「其他警衛」阻擋。
- **觀察方向**：警衛可以同時往四個方向延伸視線。
- **可見格子標記**：若某格被至少一名警衛看到，就視為被看守。
- **效率要求**：$m \times n \le 10^5$，必須避免二維 BFS 或全表掃描（會超時），需設計線性時間掃描法。

為此，我們採用以下策略：

- **一維壓平儲存結構**：將二維座標 $(r, c)$ 轉為一維索引 $r \times n + c$，使用 TypedArray (`Uint8Array`) 儲存每格狀態，節省記憶體。
- **分方向線性掃描（Sweep Line）**：
    - 先以**橫向掃描**處理左右兩方向的可視格；
    - 再以**縱向掃描**處理上下兩方向的可視格。
      每一行與每一列都僅被掃描兩次（正向與反向），確保 $O(mn)$ 時間內完成。
- **狀態標記**：
    - `0`：空格（可被看守）；
    - `1`：牆壁（阻斷視線）；
    - `2`：警衛；
    - `3`：被看守的空格。
- **統計未看守格數**：起初總空格為 $m \times n -$（牆數 + 警衛數），最後扣除被看守格即可。

此設計可在不使用 BFS 的情況下高效地模擬警衛的直線視線，達成題目要求。

## 解題步驟

### Step 1：初始化常數與狀態陣列

建立四種狀態常數，並配置 `Uint8Array` 儲存每格狀態。

```typescript
// 定義狀態常數：0=空格、1=牆、2=警衛、3=被看守
const STATE_EMPTY = 0;
const STATE_WALL = 1;
const STATE_GUARD = 2;
const STATE_GUARDED = 3;

// 以一維陣列表示 m × n 網格，節省記憶體開銷
const totalCells = m * n;
const state = new Uint8Array(totalCells);
```

### Step 2：初始化未佔據格數

先計算所有非牆與非警衛格子的初始數量，方便最終扣除。

```typescript
// 初始未佔據格數 = 總格數 - (牆 + 警衛)
const wallsLength = walls.length;
const guardsLength = guards.length;
let unoccupiedCells = totalCells - wallsLength - guardsLength;
```

### Step 3：標記牆壁位置

遍歷 `walls` 陣列，將對應格狀態設為 `STATE_WALL`。

```typescript
// 標記牆壁位置（視線阻斷）
for (let i = 0; i < wallsLength; i += 1) {
  const rowIndex = walls[i][0];
  const columnIndex = walls[i][1];
  const index = rowIndex * n + columnIndex;
  state[index] = STATE_WALL;
}
```

### Step 4：標記警衛位置

遍歷 `guards` 陣列，將對應格狀態設為 `STATE_GUARD`。

```typescript
// 標記警衛位置（視線起點）
for (let i = 0; i < guardsLength; i += 1) {
  const rowIndex = guards[i][0];
  const columnIndex = guards[i][1];
  const index = rowIndex * n + columnIndex;
  state[index] = STATE_GUARD;
}
```

### Step 5：橫向掃描（每行左→右與右→左）

對每一行進行兩次掃描：

- 第一次由左至右（模擬往右視線）
- 第二次由右至左（模擬往左視線）

若視線活躍（前方有警衛未被牆阻斷），且格為空則標記為被看守。

```typescript
// 被看守空格計數
let guardedEmptyCount = 0;

// 逐行橫向掃描
for (let rowIndex = 0; rowIndex < m; rowIndex += 1) {
  // ←→方向視線模擬
  let hasActiveGuard = false;
  let index = rowIndex * n;

  // 左→右掃描
  for (let columnIndex = 0; columnIndex < n; columnIndex += 1) {
    const cell = state[index];

    if (cell === STATE_WALL) {
      hasActiveGuard = false; // 牆阻擋視線
    } else if (cell === STATE_GUARD) {
      hasActiveGuard = true; // 新警衛開始發出視線
    } else if (hasActiveGuard && cell === STATE_EMPTY) {
      // 標記被看守格
      state[index] = STATE_GUARDED;
      guardedEmptyCount += 1;
    }

    index += 1;
  }

  // 右→左掃描
  hasActiveGuard = false;
  index = rowIndex * n + (n - 1);

  for (let columnIndex = n - 1; columnIndex >= 0; columnIndex -= 1) {
    const cell = state[index];

    if (cell === STATE_WALL) {
      hasActiveGuard = false; // 牆阻斷反向視線
    } else if (cell === STATE_GUARD) {
      hasActiveGuard = true; // 警衛向左發出視線
    } else if (hasActiveGuard && cell === STATE_EMPTY) {
      state[index] = STATE_GUARDED;
      guardedEmptyCount += 1;
    }

    index -= 1;
  }
}
```

### Step 6：縱向掃描（每列上→下與下→上）

同理，再對每一列進行兩次掃描：

- 第一次由上至下（模擬往下視線）
- 第二次由下至上（模擬往上視線）

```typescript
// 逐列縱向掃描
for (let columnIndex = 0; columnIndex < n; columnIndex += 1) {
  // 上→下掃描
  let hasActiveGuard = false;
  let index = columnIndex;

  for (let rowIndex = 0; rowIndex < m; rowIndex += 1) {
    const cell = state[index];

    if (cell === STATE_WALL) {
      hasActiveGuard = false; // 牆阻斷下視線
    } else if (cell === STATE_GUARD) {
      hasActiveGuard = true; // 警衛向下發出視線
    } else if (hasActiveGuard && cell === STATE_EMPTY) {
      state[index] = STATE_GUARDED;
      guardedEmptyCount += 1;
    }

    index += n;
  }

  // 下→上掃描
  hasActiveGuard = false;
  index = (m - 1) * n + columnIndex;

  for (let rowIndex = m - 1; rowIndex >= 0; rowIndex -= 1) {
    const cell = state[index];

    if (cell === STATE_WALL) {
      hasActiveGuard = false; // 牆阻斷上視線
    } else if (cell === STATE_GUARD) {
      hasActiveGuard = true; // 警衛向上發出視線
    } else if (hasActiveGuard && cell === STATE_EMPTY) {
      state[index] = STATE_GUARDED;
      guardedEmptyCount += 1;
    }

    index -= n;
  }
}
```

### Step 7：計算結果並回傳

最後，用未佔據總格扣掉被看守格數，得到「未被看守的空格數」。

```typescript
// 最終結果 = 總未佔據格數 - 被看守格數
return unoccupiedCells - guardedEmptyCount;
```

## 時間複雜度

- 初始化牆與警衛標記：$O(w + g)$，其中 $w$、$g$ 分別為牆與警衛數。
- 四次方向掃描（兩行兩列）：每格僅訪問常數次，為 $O(m \times n)$。
- 總時間複雜度為 $O(m \times n + w + g)$。

> $O(m \times n + w + g)$

## 空間複雜度

- 使用一個大小為 $m \times n$ 的 `Uint8Array` 儲存狀態。
- 額外僅有常數級變數，無遞迴或額外結構。
- 總空間複雜度為 $O(m \times n)$。

> $O(m \times n)$
