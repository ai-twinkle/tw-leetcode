# 2267. Check if There Is a Valid Parentheses String Path

A parentheses string is a non-empty string consisting only of `'('` and `')'`. 
It is valid if any of the following conditions is `true`:

- It is `()`.
- It can be written as `AB` (`A` concatenated with `B`), where `A` and `B` are valid parentheses strings.
- It can be written as `(A)`, where `A` is a valid parentheses string.

You are given an `m x n` matrix of parentheses `grid`. 
A valid parentheses string path in the grid is a path satisfying all of the following conditions:

- The path starts from the upper left cell `(0, 0)`.
- The path ends at the bottom-right cell `(m - 1, n - 1)`.
- The path only ever moves down or right.
- The resulting parentheses string formed by the path is valid.

Return `true` if there exists a valid parentheses string path in the grid. 
Otherwise, return `false`.

**Constraints:**

- `m == grid.length`
- `n == grid[i].length`
- `1 <= m, n <= 100`
- `grid[i][j]` is either `'('` or `')'`.

## 基礎思路

本題要求判斷在一個僅由左右括號構成的矩陣中，是否存在一條從左上走到右下、只能向下或向右移動的路徑，使得沿途字元所組成的括號字串合法。由於路徑數量隨矩陣規模呈指數成長，逐條枚舉顯然不可行，必須改以狀態轉移的角度思考。

在思考解法時，可掌握以下核心觀察：

- **括號合法性可化約為單一數值狀態**：
  一個括號字串是否合法，只取決於由左往右掃描時的「未閉合左括號數量」是否全程非負，且最終歸零。因此路徑上真正需要攜帶的資訊只有這個計數，而非整個字串。

- **所有路徑長度相同**：
  由於每步只能向下或向右，任一條從左上到右下的路徑，其經過的格子數量完全相同。這使得長度奇偶性、首尾字元等條件可以在一開始就整體判定。

- **狀態具有上界且可被剪枝**：
  未閉合數量若超過剩餘長度所能閉合的極限，該狀態即永遠無法回到零，可以直接丟棄；同理，計數若降到負值也代表非法，應立即淘汰。

- **同一格可容納多種狀態，且僅需布林式的「是否可達」**：
  不同路徑抵達同一格時可能帶著不同的未閉合數量，我們只在意某個數量是否可達，而不在意有幾條路徑。這種集合語意天然適合用位元集表示，並以位移運算一次完成整個集合的加一或減一。

- **狀態僅依賴上方與左方**：
  每格的可達狀態集合，等於其上方與左方兩格狀態集合的聯集再套用當前字元的影響，因此可用滾動方式僅保留一列。

依據以上特性，可以採用以下策略：

- **先以整體性質快速剪枝**：長度為奇數、起點非左括號、終點非右括號者皆可立即否定。
- **以位元集表示每格可達的未閉合數量集合**，左括號對應整體左移一位、右括號對應整體右移一位，越界的位元自然被淘汰，等同免費完成剪枝。
- **按列滾動更新，並在每列結束後檢查是否仍有存活狀態**，因為每條路徑必定橫跨每一列，一旦整列皆空即可提前否定。
- **最終檢查終點格是否能以未閉合數量為零的狀態抵達**。

此策略將指數級的路徑枚舉壓縮為對每格一次的位元運算更新，兼顧正確性與效率。

## 解題步驟

### Step 1：計算路徑長度並以奇偶性快速剪枝

先取得矩陣的列數與行數，並推得任一條路徑必經的格子數量。合法括號字串長度必為偶數，若路徑長度為奇數則不可能成立，直接否定。

```typescript
const rowCount = grid.length;
const columnCount = grid[0].length;
const pathLength = rowCount + columnCount - 1;

// 所有路徑長度相同，而合法字串必須為偶數長度。
if ((pathLength & 1) === 1) {
  return false;
}
```

### Step 2：檢查起點與終點字元

合法括號字串的第一個字元必為左括號、最後一個字元必為右括號。由於所有路徑皆起於左上、止於右下，這兩格字元可直接決定是否有解。

```typescript
// 第一個字元必須為左括號，最後一個必須為右括號。
if (grid[0][0] === ')') {
  return false;
}
if (grid[rowCount - 1][columnCount - 1] === '(') {
  return false;
}
```

### Step 3：推導狀態上界並規劃位元集規格

未閉合數量若超過路徑長度的一半，便再也無法在剩餘步數內閉合回零，故以此為狀態上界。依此上界計算位元集所需的字組數量、最高字組索引，以及用於裁掉越界位元的遮罩。

```typescript
// 超過路徑長度一半的平衡值永遠無法閉合回零。
const maximumBalance = pathLength >> 1;
const wordCount = (maximumBalance >> 5) + 1;
const lastWordIndex = wordCount - 1;
const topBitIndex = maximumBalance & 31;
const topWordMask = topBitIndex === 31 ? -1 : ((1 << (topBitIndex + 1)) - 1);
```

### Step 4：配置滾動位元集並種入起點狀態

配置一列可滾動重用的位元集陣列，並在索引 0 處保留一整欄的零值填充，使第 0 欄的「左鄰居」與第 0 列的「上鄰居」自然讀到空集合，免去邊界判斷。起點已確定為左括號，故其唯一可達狀態為未閉合數量 1。

```typescript
// 一列可滾動重用的位元集，並在索引 0 保留一欄零值填充，
// 使第 0 欄的「左鄰居」與第 0 列的「上鄰居」
// 讀起來就是空集合，不需任何邊界分支。
const balanceSets = new Uint32Array((columnCount + 1) * wordCount);

// 起點格已知為左括號，故其唯一可達的平衡值為 1。
balanceSets[wordCount] = 2;
```

### Step 5：逐列走訪並初始化該列的存活狀態

由上而下走訪每一列，準備該列資料並重置存活位元的累積器。第 0 列因起點格已預先種入狀態，故從第 1 欄開始處理，並讓存活位元帶著起點的狀態。

```typescript
for (let row = 0; row < rowCount; row++) {
  const gridRow = grid[row];
  let aliveBits = 0;
  let startColumn = 0;

  // 第 0 列從第 1 欄開始，因為起點格已經預先種入。
  if (row === 0) {
    aliveBits = 2;
    startColumn = 1;
  }

  // ...
}
```

### Step 6：逐欄走訪並計算目前格與左鄰居的基準位移

在列內由左而右走訪每一欄，並先算出目前格與其左鄰居在位元集陣列中的起始位移；由於陣列採滾動重用，目前格原有的內容即代表上鄰居的狀態。

```typescript
for (let row = 0; row < rowCount; row++) {
  // Step 5：初始化該列的走訪狀態

  for (let column = startColumn; column < columnCount; column++) {
    const base = (column + 1) * wordCount;
    const leftBase = base - wordCount;

    // ...
  }

  // ...
}
```

### Step 7：處理右括號時整體下移一位

若目前格為右括號，所有進入此格的狀態其未閉合數量皆減一，對應位元集整體右移一位；原本為零的狀態會直接掉出位元集底部，等同免費完成非法剪枝。由低字組往高字組走訪，可確保尚未讀取的字組維持原值。處理完畢後即跳至下一欄。

```typescript
for (let row = 0; row < rowCount; row++) {
  // Step 5：初始化該列的走訪狀態

  for (let column = startColumn; column < columnCount; column++) {
    // Step 6：計算目前格與左鄰居的基準位移

    if (gridRow[column] === ')') {
      // 右括號使每個平衡值減一；平衡值 0 會直接
      // 掉出位元集底部，等同免費完成剪枝。
      // 由低字組走向高字組可保持尚未讀取的字組不受影響。
      for (let word = 0; word <= lastWordIndex; word++) {
        const incoming = balanceSets[base + word] | balanceSets[leftBase + word];
        let higherIncoming = 0;

        if (word < lastWordIndex) {
          higherIncoming = balanceSets[base + word + 1] | balanceSets[leftBase + word + 1];
        }

        const shifted = (incoming >>> 1) | (higherIncoming << 31);

        balanceSets[base + word] = shifted;
        aliveBits |= shifted;
      }

      continue;
    }

    // ...
  }

  // ...
}
```

### Step 8：處理左括號時整體上移一位並裁去越界狀態

若目前格為左括號，所有進入此格的狀態其未閉合數量皆加一，對應位元集整體左移一位；此方向需由高字組往低字組走訪，才能保持尚未讀取的字組不被覆寫。最高字組另需套用遮罩，丟棄已超過上界而無法及時閉合的狀態。

```typescript
for (let row = 0; row < rowCount; row++) {
  // Step 5：初始化該列的走訪狀態

  for (let column = startColumn; column < columnCount; column++) {
    // Step 6：計算目前格與左鄰居的基準位移

    // Step 7：處理右括號的狀態下移

    // 左括號使每個進入的平衡值加一，因此此方向
    // 由高字組走向低字組，以保持尚未讀取的字組不受影響。
    for (let word = lastWordIndex; word >= 0; word--) {
      const incoming = balanceSets[base + word] | balanceSets[leftBase + word];
      let lowerIncoming = 0;

      if (word > 0) {
        lowerIncoming = balanceSets[base + word - 1] | balanceSets[leftBase + word - 1];
      }

      let shifted = (incoming << 1) | (lowerIncoming >>> 31);

      // 丟棄已無法及時閉合的平衡值。
      if (word === lastWordIndex) {
        shifted &= topWordMask;
      }

      balanceSets[base + word] = shifted;
      aliveBits |= shifted;
    }
  }

  // ...
}
```

### Step 9：每列結束後檢查是否仍有存活狀態

由於任一條路徑都必定橫跨每一列，若某列走完後完全沒有任何可達狀態，代表所有候選路徑皆已被淘汰，可立即否定。

```typescript
for (let row = 0; row < rowCount; row++) {
  // Step 5：初始化該列的走訪狀態

  // Step 6 至 Step 8：逐欄更新該列的位元集

  // 每條路徑都會經過每一列，因此空列會殺光所有候選。
  if (aliveBits === 0) {
    return false;
  }
}
```

### Step 10：檢查終點是否能以零平衡抵達

所有列處理完畢後，位元集最後一欄即代表終點格的可達狀態集合；只要其中包含未閉合數量為零的狀態，即存在合法路徑。

```typescript
// 唯有終點格能以平衡值 0 抵達時，路徑才算合法。
return (balanceSets[columnCount * wordCount] & 1) === 1;
```

## 時間複雜度

- 前置的奇偶性與首尾字元檢查皆為常數時間；
- 需走訪 $m \times n$ 個格子，每格對整個位元集進行一次線性掃描；
- 位元集的字組數量為 $O((m + n) / 32)$，故每格更新成本為 $O((m + n) / 32)$；
- 總時間複雜度為 $O(m \times n \times (m + n) / 32)$，以漸進式表示為 $O(m \cdot n \cdot (m + n))$。

> $O(m \cdot n \cdot (m + n))$

## 空間複雜度

- 僅保留一列滾動的位元集，長度為 $(n + 1)$ 欄乘上每欄的字組數量；
- 字組數量為 $O((m + n) / 32)$，其餘皆為固定數量的純量變數；
- 總空間複雜度為 $O(n \times (m + n) / 32)$，以漸進式表示為 $O(n \cdot (m + n))$。

> $O(n \cdot (m + n))$
