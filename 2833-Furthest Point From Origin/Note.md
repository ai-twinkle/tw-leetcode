# 2833. Furthest Point From Origin

You are given a string `moves` of length `n` consisting only of characters `'L'`, `'R'`, and `'_'`. 
The string represents your movement on a number line starting from the origin `0`.

In the $i^{th$} move, you can choose one of the following directions:

- move to the left if `moves[i] = 'L'` or `moves[i] = '_'`
- move to the right if `moves[i] = 'R'` or `moves[i] = '_'`

Return the distance from the origin of the furthest point you can get to after `n` moves.

**Constraints:**

- `1 <= moves.length == n <= 50`
- `moves` consists only of characters `'L'`, `'R'` and `'_'`.

## 基礎思路

本題要求在一條數線上，依照給定的移動序列選擇方向，最終求離原點最遠的可能距離。其中 `'L'` 只能向左、`'R'` 只能向右，而 `'_'` 可自由選擇方向。

在思考解法時，可掌握以下核心觀察：

- **最終距離取決於淨位移，而非絕對步數**：
  向右的步數減去向左的步數即為淨位移，正負號代表最終位於原點的哪一側，取絕對值即為距離。

- **萬用字元的最佳策略永遠是跟隨優勢方向**：
  若向右步數多於向左，則所有 `'_'` 都應向右；反之亦然。無論哪種情況，每個萬用字元都能為距離貢獻恰好 1。

- **只需一次線性掃描即可統計所有必要資訊**：
  只需記錄三種字元的出現次數，無需模擬實際的移動過程。

依據以上特性，可以採用以下策略：

- **單次遍歷統計 `'L'`、`'R'`、`'_'` 的數量**。
- **計算左右步數的差值取絕對值，再加上所有萬用字元的數量**，即為最遠距離。

此策略將問題化為純粹的計數問題，無需模擬路徑，簡潔高效。

## 解題步驟

### Step 1：初始化各方向計數器與字串長度

宣告三個計數器分別記錄向右、向左與萬用字元的出現次數，並取得字串長度以供後續遍歷使用。

```typescript
let rightCount = 0;
let leftCount = 0;
let wildcardCount = 0;

const length = moves.length;
```

### Step 2：單次遍歷統計三種字元的數量

逐一檢查每個字元的字元碼，分別對應 `'R'`（82）、`'L'`（76）與 `'_'`，並累加至對應計數器。

```typescript
// 單次遍歷統計每種字元類型的數量
for (let index = 0; index < length; index++) {
  const character = moves.charCodeAt(index);
  if (character === 82) {
    // 'R'
    rightCount++;
  } else if (character === 76) {
    // 'L'
    leftCount++;
  } else {
    wildcardCount++;
  }
}
```

### Step 3：計算左右差值並加上萬用字元數以得出最遠距離

取左右計數的差值絕對值，即為固定步數所貢獻的距離；再加上萬用字元數量，因為每個萬用字元都可以沿優勢方向增加 1 的距離。

```typescript
// 萬用字元永遠加到優勢方向
const difference = rightCount - leftCount;
return (difference < 0 ? -difference : difference) + wildcardCount;
```

## 時間複雜度

- 對長度為 $n$ 的字串進行一次線性遍歷，每個字元僅處理一次；
- 所有其他操作皆為常數時間。
- 總時間複雜度為 $O(n)$。

> $O(n)$

## 空間複雜度

- 僅使用固定數量的計數器變數；
- 無任何與輸入規模相關的額外空間。
- 總空間複雜度為 $O(1)$。

> $O(1)$
