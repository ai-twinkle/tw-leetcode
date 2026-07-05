# 1301. Number of Paths with Max Score

You are given a square `board` of characters. 
You can move on the board starting at the bottom right square marked with the character `'S'`.

You need to reach the top left square marked with the character `'E'`. 
The rest of the squares are labeled either with a numeric character `1, 2, ..., 9` or with an obstacle `'X'`. 
In one move you can go up, left or up-left (diagonally) only if there is no obstacle there.

Return a list of two integers: the first integer is the maximum sum of numeric characters you can collect, 
and the second is the number of such paths that you can take to get that maximum sum, taken modulo `10^9 + 7`.

In case there is no path, return `[0, 0]`.

**Constraints:**

- `2 <= board.length == board[i].length <= 100`

## 基礎思路

本題要求在一個方形棋盤上，從右下角 `'S'` 出發，僅能向上、向左或斜向左上移動，最終抵達左上角 `'E'`，並收集沿途數字格的最大總和以及達成該最大總和的路徑數量。

在思考解法時，可掌握以下核心觀察：

- **移動方向的特殊性**：
  每次移動只能往上、往左或往左上，代表任意路徑的格子在列與行的索引上都只會遞減，具有明確的偏序關係，適合從終點反向動態規劃。

- **動態規劃的傳播方向**：
  由於只能向上或向左移動，若以「從起點出發」的角度建構 DP，每個格子的狀態依賴於下方、右方及右下方格子的結果。因此，從右下向左上逐格處理可確保每個格子計算時，其後繼格子皆已就緒。

- **同時追蹤最大分數與路徑數**：
  每個格子需維護兩個值：到達該格所能獲得的最大分數，以及達成該最大分數的路徑數量。當多條路徑匯聚至同一格時，若分數相同則累加路徑數，若有更高分數則以新分數及其路徑數完全取代。

- **處理無效格子與不可達格子**：
  障礙格（`'X'`）不可進入；若某格的路徑計數為 0，則表示從起點根本無法到達該格，兩者皆應跳過，不做任何傳播。

- **模運算的簡化**：
  路徑數可能極大，需對 $10^9+7$ 取模；由於每次僅累加兩個已不超過模數的值，直接用減法替代取模運算即可避免昂貴的除法。

依據以上特性，可以採用以下策略：

- **將棋盤扁平化為一維陣列**，以加速索引運算，並將字元預先解碼為數值。
- **以逆序掃描（從右下到左上）填充 DP 表**，在掃描過程中將每個格子的最佳結果推播到其三個可達鄰居。
- **最終讀取左上角格子的分數與路徑數**，若路徑數為 0 則表示無路可達，回傳 `[0, 0]`。

## 解題步驟

### Step 1：將棋盤字元預先解碼為數值

為了在後續 DP 過程中快速判斷格子類型與取得其數值，先將二維字串棋盤扁平化為一維整數陣列：障礙格編碼為 `-1`，`'S'` 與 `'E'` 編碼為 `0`，數字格編碼為對應的數字值。

```typescript
const MOD = 1000000007;
const size = board.length;

// 將棋盤扁平化為單一 Uint8Array 的數值陣列。
// 編碼方式：障礙 'X' 為 -1，'S'/'E' 為 0，其餘為對應數字值。
const cellValue = new Int8Array(size * size);
for (let row = 0; row < size; row++) {
  const rowString = board[row];
  const base = row * size;
  for (let col = 0; col < size; col++) {
    const character = rowString.charCodeAt(col);
    if (character === 88) {
      // 'X' 障礙格
      cellValue[base + col] = -1;
    } else if (character === 83 || character === 69) {
      // 'S' 或 'E' 不貢獻分數
      cellValue[base + col] = 0;
    } else {
      // 數字字元 '1'-'9'
      cellValue[base + col] = character - 48;
    }
  }
}
```

### Step 2：初始化 DP 陣列並設定起點狀態

建立兩個一維陣列分別儲存每格的最大分數（`score`）與對應路徑數（`count`）。`score` 全部初始化為 `-1` 表示不可達，`count` 全部初始化為 `0`。接著將起點（右下角，即最後一格）的分數設為 `0`、路徑數設為 `1`，作為 DP 的初始狀態。

```typescript
// 以行主序索引的扁平型別陣列，分別儲存分數與路徑數。
const score = new Int32Array(size * size).fill(-1);
const count = new Float64Array(size * size);

const lastIndex = size * size - 1;
score[lastIndex] = 0;
count[lastIndex] = 1;
```

### Step 3：以逆序掃描，從起點向每個格子的三個鄰居傳播最優結果

從右下向左上逐格掃描，對每個非障礙且可達的格子，計算離開該格後可攜帶的分數（即當前最佳分數加上該格數值），並嘗試向上、向左、左上三個方向傳播。傳播時若新分數更優則完全取代目標格的狀態，若相等則累加路徑數（並以減法模擬取模）。

```typescript
// 從右下向左上逐格處理。
for (let row = size - 1; row >= 0; row--) {
  const base = row * size;
  for (let col = size - 1; col >= 0; col--) {
    const index = base + col;

    // 跳過障礙格與不可達格。
    if (cellValue[index] === -1) {
      continue;
    }
    const currentCount = count[index];
    if (currentCount === 0) {
      continue;
    }

    const currentScore = score[index];
    const value = cellValue[index];
    const newScore = currentScore + value;

    // 向上移動。
    if (row > 0) {
      const upIndex = index - size;
      if (cellValue[upIndex] !== -1) {
        const target = score[upIndex];
        if (newScore > target) {
          score[upIndex] = newScore;
          count[upIndex] = currentCount;
        } else if (newScore === target) {
          let combined = count[upIndex] + currentCount;
          if (combined >= MOD) {
            combined -= MOD;
          }
          count[upIndex] = combined;
        }
      }
    }

    // 向左移動。
    if (col > 0) {
      const leftIndex = index - 1;
      if (cellValue[leftIndex] !== -1) {
        const target = score[leftIndex];
        if (newScore > target) {
          score[leftIndex] = newScore;
          count[leftIndex] = currentCount;
        } else if (newScore === target) {
          let combined = count[leftIndex] + currentCount;
          if (combined >= MOD) {
            combined -= MOD;
          }
          count[leftIndex] = combined;
        }
      }
    }

    // 向左上斜向移動。
    if (row > 0 && col > 0) {
      const diagIndex = index - size - 1;
      if (cellValue[diagIndex] !== -1) {
        const target = score[diagIndex];
        if (newScore > target) {
          score[diagIndex] = newScore;
          count[diagIndex] = currentCount;
        } else if (newScore === target) {
          let combined = count[diagIndex] + currentCount;
          if (combined >= MOD) {
            combined -= MOD;
          }
          count[diagIndex] = combined;
        }
      }
    }
  }
}
```

### Step 4：讀取終點狀態並回傳結果

DP 掃描完成後，左上角（索引 `0`）即為終點 `'E'`。若其路徑數為 `0` 表示根本無路可達，回傳 `[0, 0]`；否則回傳其最大分數與路徑數。

```typescript
if (count[0] === 0) {
  return [0, 0];
}
return [score[0], count[0]];
```

## 時間複雜度

- 棋盤扁平化需遍歷所有 $n^2$ 個格子，其中 $n$ 為棋盤邊長；
- DP 逆序掃描同樣遍歷所有 $n^2$ 個格子，每格進行常數次操作（最多三個方向各一次比較與更新）；
- 總時間複雜度為 $O(n^2)$。

> $O(n^2)$

## 空間複雜度

- 使用 `cellValue`、`score`、`count` 三個大小為 $n^2$ 的一維陣列；
- 無遞迴或額外動態資料結構。
- 總空間複雜度為 $O(n^2)$。

> $O(n^2)$
