# 909. Snakes and Ladders

You are given an `n x n` integer matrix `board` where the cells are labeled from `1` to `n^2` 
in a [Boustrophedon style](https://en.wikipedia.org/wiki/Boustrophedon) starting from the bottom left of the board (i.e. `board[n - 1][0]`) and alternating direction each row.

You start on square `1` of the board. 
In each move, starting from square `curr`, do the following:

- Choose a destination square `next` with a label in the range `[curr + 1, min(curr + 6, n^2)]`.
  - This choice simulates the result of a standard 6-sided die roll: 
    i.e., there are always at most 6 destinations, regardless of the size of the board.
- If `next` has a snake or ladder, you must move to the destination of that snake or ladder. 
  Otherwise, you move to `next`.
- The game ends when you reach the square `n^2`.

A board square on row `r` and column `c` has a snake or ladder if `board[r][c] != -1`. 
The destination of that snake or ladder is `board[r][c]`. 
Squares `1` and `n^2` are not the starting points of any snake or ladder.

Note that you only take a snake or ladder at most once per dice roll. 
If the destination to a snake or ladder is the start of another snake or ladder, you do not follow the subsequent snake or ladder.

For example, suppose the board is `[[-1,4],[-1,3]]`, and on the first move, your destination square is `2`. 
You follow the ladder to square `3`, but do not follow the subsequent ladder to `4`.

Return the least number of dice rolls required to reach the square `n^2`. 
If it is not possible to reach the square, return `-1`.

**Constraints:**

- `n == board.length == board[i].length`
- `2 <= n <= 20`
- `board[i][j]` is either `-1` or in the range `[1, n^2]`.
- The squares labeled `1` and `n^2` are not the starting points of any snake or ladder.

## 基礎思路

這題實質上是一個「最短步數」圖論問題，需在一個依蛇梯規則變形的 $n \times n$ 棋盤上，由起點移動到終點，過程中每回合可前進 1\~6 步且有蛇或梯子時會自動跳轉。棋盤以二維陣列表示，但格子編號遵循「Z字型（Boustrophedon）」排列，因此必須先進行編號轉換。
接下來問題可視為在一維狀態空間進行 BFS（廣度優先搜尋），每格的鄰居即為擲骰後實際落點（經蛇梯轉換）。
BFS 確保每一格第一次被抵達時就是最短步數。

我們將使用以下步驟來解決這個問題：

1. **棋盤編號轉換**：先將 2D 棋盤攤平成一維，順序需吻合 Z 字型規則，方便之後以 index 模擬棋步推進。
2. **蛇梯跳躍處理**：預先建立一維「目的地」映射，能快速查詢某格擲骰到達後最終落點。
3. **BFS 最短路徑搜尋**：用佇列從起點層層擴展，標記每格首次抵達的步數。BFS 能找到所有可達格子的最短擲骰數。
4. **終點判斷與無解處理**：首次走到終點即回傳答案；若搜尋結束還未達終點，代表無法抵達。

## 解題步驟

### Step 1：變數初始化

- `boardSize`：取得棋盤邊長。
- `totalSquares`：計算總格子數（$n^2$），將用於所有一維狀態空間。

```typescript
const boardSize = board.length;
const totalSquares = boardSize * boardSize;
```

### Step 2：將二維棋盤依「Z字型順序」攤平成一維陣列

這段程式會從最下層（row 較大）往上掃，每層依次左右交換方向來寫入一維陣列，精確對應遊戲規則的編號方式。

```typescript
// 1. 將二維棋盤依 Boustrophedon（Z字型）順序攤平成一維 Int16Array
const flattenedBoard = new Int16Array(totalSquares);
let writeIndex = 0;
let leftToRight = true;
for (let row = boardSize - 1; row >= 0; row--, leftToRight = !leftToRight) {
  if (leftToRight) {
    for (let col = 0; col < boardSize; col++) {
      flattenedBoard[writeIndex++] = board[row][col];
    }
  } else {
    for (let col = boardSize - 1; col >= 0; col--) {
      flattenedBoard[writeIndex++] = board[row][col];
    }
  }
}
```

### Step 3：預先建立一階跳躍映射

- `destinationMapping[i]`：若第 $i$ 格有蛇或梯子（`cellValue !== -1`），映射到目標格子（轉為 0-based）；否則映射到自己。
- 這步讓後續每次擲骰時能 $O(1)$ 取得最終落點。

```typescript
// 2. 預先計算單層跳躍映射：若第 i 格有蛇或梯子，映射到 (目標編號-1)；否則映射到自身
const destinationMapping = new Int16Array(totalSquares);
for (let i = 0; i < totalSquares; i++) {
  const cellValue = flattenedBoard[i];
  destinationMapping[i] = cellValue !== -1 ? (cellValue - 1) : i;
}
```

### Step 4：初始化每格最短步數陣列

`movesToReach[i]` 表示從起點到第 $i$ 格的最少擲骰數，初始全部設為 -1（未到過），起點編號 0 設為 0。

```typescript
// 3. 初始化 movesToReach 陣列為 -1（未訪問），用 Int16Array 以節省記憶體
const movesToReach = new Int16Array(totalSquares);
movesToReach.fill(-1);
movesToReach[0] = 0;
```

### Step 5：建 BFS 佇列，使用固定長度與 head/tail 指標

手動控制 BFS 佇列以避免 JS 陣列額外開銷，確保大規模狀態下仍高效。

```typescript
// 4. 使用固定長度的 Int16Array 作為 BFS 佇列（head/tail 指標）
const bfsQueue = new Int16Array(totalSquares);
let headPointer = 0;
let tailPointer = 0;
bfsQueue[tailPointer++] = 0; // 將起點（索引 0）加入佇列
```

### Step 6：執行 BFS 求解最短步數

- 每次取出當前狀態，嘗試六種擲骰結果（若超出邊界則 break），根據蛇梯映射計算最終落點。
- 若終點首次被達到，直接回傳目前步數加一；否則若是未訪問新格子，則標記其步數並排入 BFS 佇列。

```typescript
// 5. 標準 BFS 探索一維攤平棋盤上的所有可達狀態
while (headPointer < tailPointer) {
  const currentIndex = bfsQueue[headPointer++];
  const currentMoves = movesToReach[currentIndex];

  // 嘗試所有骰子點數 1~6
  for (let roll = 1; roll <= 6; roll++) {
    const rawNext = currentIndex + roll;
    if (rawNext >= totalSquares) {
      break;
    }

    // 若有蛇或梯子，跳躍到目標位置
    const nextIndex = destinationMapping[rawNext];

    // 若已到終點，回傳答案
    if (nextIndex === totalSquares - 1) {
      return currentMoves + 1;
    }

    // 若此格尚未訪問，則標記步數並加入佇列
    if (movesToReach[nextIndex] === -1) {
      movesToReach[nextIndex] = currentMoves + 1;
      bfsQueue[tailPointer++] = nextIndex;
    }
  }
}
```

### Step 7：無法到終點則回傳 -1

若 BFS 結束後仍未走到終點，代表無解。

```typescript
return -1;
```

## 時間複雜度

- 主要運算為 BFS，最壞情況下所有 $n^2$ 個格子都需處理，每格嘗試 $1$ ~ $6$ 個鄰居，故總運算量 $O(n^2)$。
- 攤平棋盤與預處理蛇梯映射皆為 $O(n^2)$。
- 總時間複雜度為 $O(n^2)$。

> $O(n^2)$

## 空間複雜度

- 額外用到四個 $n^2$ 長度的 Int16Array，主要用於棋盤、映射、最短步數、BFS 佇列。
- 總空間複雜度為 $O(n^2)$。

> $O(n^2)$
