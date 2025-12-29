# 756. Pyramid Transition Matrix

You are stacking blocks to form a pyramid. Each block has a color, which is represented by a single letter. 
Each row of blocks contains one less block than the row beneath it and is centered on top.

To make the pyramid aesthetically pleasing, there are only specific triangular patterns that are allowed. 
A triangular pattern consists of a single block stacked on top of two blocks. 
The patterns are given as a list of three-letter strings `allowed`, 
where the first two characters of a pattern represent the left and right bottom blocks respectively, 
and the third character is the top block.

- For example, `"ABC"` represents a triangular pattern with a `'C'` block stacked on top of an `'A'` (left) and `'B'` (right) block. 
  Note that this is different from `"BAC"` where `'B'` is on the left bottom and `'A'` is on the right bottom.

You start with a bottom row of blocks `bottom`, given as a single string, that you must use as the base of the pyramid.

Given `bottom` and `allowed`, return `true` if you can build the pyramid all the way to the top such 
that every triangular pattern in the pyramid is in `allowed`, or `false` otherwise.

**Constraints:**

- `2 <= bottom.length <= 6`
- `0 <= allowed.length <= 216`
- `allowed[i].length == 3`
- The letters in all input strings are from the set `{'A', 'B', 'C', 'D', 'E', 'F'}`.
- All the values of `allowed` are unique.

## 基礎思路

本題要判斷能否從底層字串 `bottom` 出發，依照 `allowed` 的三角規則，一層層往上堆到最頂端（長度 1）。每個三角形規則固定為「底層兩塊決定上層一塊」，因此整個金字塔是否可行，本質上是**由下往上逐層生成**的可行性搜尋問題。

在思考解法時，有幾個關鍵觀察：

* **字母種類極少（僅 A~F 共 6 種）**：可以把字母集合用位元遮罩表示，讓「某個底層 pair 可以生成哪些上層字母」變成快速位元操作。
* **底層長度極小（`2 <= n <= 6`）**：雖然分支會爆炸，但狀態空間仍可被有效記憶化（memoization）壓縮。
* **子問題會大量重複**：同一層「某一排的排列」若曾判定無法到頂，就不必再重算；因此適合用**DFS + 記憶化**。
* **每一排可以緊湊編碼**：因為只有 6 種字母，每個位置用 3 bits 足夠，整排可打包成整數作為 memo key，大幅降低查表成本。
* **生成上一層可視為逐格填入**：對於當前一排的每個相鄰 pair，都有一組上層候選字母集合；逐格嘗試填上層並 DFS，若有任一組合可到頂即可回傳 `true`。

因此整體策略是：

1. 先將 `allowed` 規則整理成「底層 pair → 上層可用字母集合」的查表結構；
2. 用 bit-packed 整數表示每一排，搭配長度做分層 memo；
3. 對當前排做 DFS，先快速判斷是否存在任何 pair 無可用上層字母（可立即失敗）；
4. 逐格嘗試建立下一排，遇到可行就提早返回，否則記錄失敗避免重算。

## 解題步驟

### Step 1：預先建立「單一 bit → 字母索引」查表

這個表用來把 `optionsMask` 中的最低位 `leastBit` 快速映射回 `0..5` 的字母索引，避免額外的數學運算開銷。

```typescript
// 預先計算 bit -> index（6-bit mask 中只會出現 1,2,4,8,16,32），避免 Math/clz 開銷
const BIT_INDEX_BY_VALUE = (() => {
  const table = new Int8Array(64);
  table.fill(-1);
  for (let bitIndex = 0; bitIndex < 6; bitIndex++) {
    table[1 << bitIndex] = bitIndex;
  }
  return table;
})();
```

### Step 2：初始化規則查表 `allowedTopMask`（pair → 上層候選集合）

將 `allowed` 的每條規則 `(left, right) -> top` 編碼成 `pairIndex`，並用 6-bit mask 累積所有可行的 `top` 字母。

```typescript
const letterCount = 6; // 'A'..'F'
const pairCount = letterCount * letterCount; // 36

// allowedTopMask[pairIndex] 以 6-bit mask 表示該底層 pair 可生成的上層字母集合
const allowedTopMask = new Uint8Array(pairCount);

for (let ruleIndex = 0; ruleIndex < allowed.length; ruleIndex++) {
  const rule = allowed[ruleIndex];
  const leftCode = rule.charCodeAt(0) - 65;
  const rightCode = rule.charCodeAt(1) - 65;
  const topCode = rule.charCodeAt(2) - 65;

  const pairIndex = leftCode * letterCount + rightCode;
  allowedTopMask[pairIndex] |= 1 << topCode;
}
```

### Step 3：建立分層記憶化表 `memoByLength`

對每個 `rowLength`，用 `rowBits`（每格 3 bits 打包）作索引，記錄該排是否可到頂：

* `0`：未知
* `1`：不可行
* `2`：可行

```typescript
const maximumLength = bottom.length;

// memoByLength[length][rowBits] -> 0 未知, 1 不可行, 2 可行
const memoByLength: Uint8Array[] = new Array(maximumLength + 1);
for (let rowLength = 2; rowLength <= maximumLength; rowLength++) {
  memoByLength[rowLength] = new Uint8Array(1 << (rowLength * 3));
}
```

### Step 4：為每層準備可重用的 pair mask 緩衝（降低遞迴配置成本）

因為遞迴長度嚴格遞減，可安全重用每個 `rowLength` 對應的緩衝陣列。

```typescript
// 依長度重用緩衝（遞迴時 rowLength 嚴格遞減，不會同時使用同一層 buffer）
const pairTopMasksByLength: Uint8Array[] = new Array(maximumLength + 1);
for (let rowLength = 2; rowLength <= maximumLength; rowLength++) {
  pairTopMasksByLength[rowLength] = new Uint8Array(rowLength - 1);
}
```

### Step 5：將 `bottom` 編碼成 3-bit 打包整數 `bottomRowBits`

把每個字元 `'A'..'F'` 轉成 `0..5`，再塞入 `(index * 3)` 的 bit 位置中。

```typescript
let bottomRowBits = 0;
for (let index = 0; index < maximumLength; index++) {
  const letterCode = bottom.charCodeAt(index) - 65;
  bottomRowBits |= letterCode << (index * 3);
}
```

### Step 6：主 DFS `depthFirstSearch` — 基底條件與 memo 查表

* 若 `rowLength === 1` 代表已到頂端，回傳 `true`。
* 若 memo 已有結果，直接回傳，避免重算。

```typescript
/**
 * @param currentRowBits 每個位置 3-bit 打包（最低位位置為 index 0）
 * @param rowLength 當前排長度
 * @returns 此排是否能到達頂端
 */
function depthFirstSearch(currentRowBits: number, rowLength: number): boolean {
  if (rowLength === 1) {
    return true;
  }

  const memoArray = memoByLength[rowLength];
  const memoState = memoArray[currentRowBits];
  if (memoState !== 0) {
    return memoState === 2;
  }

  const pairTopMasks = pairTopMasksByLength[rowLength];

  // ...
}
```

### Step 7：在 DFS 中建立每個相鄰 pair 的上層候選集合（fail fast）

這段必須**保留最外層 for 迴圈**，並用省略標記串接（你要求的格式）。

```typescript
function depthFirstSearch(currentRowBits: number, rowLength: number): boolean {
  // Step 6：主 DFS — 基底條件與 memo 查表

  // 為每個相鄰 pair 建立上層候選 mask；若任一 pair 無候選則立即失敗
  let slidingBits = currentRowBits;
  for (let positionIndex = 0; positionIndex < rowLength - 1; positionIndex++) {
    const leftCode = slidingBits & 7;
    const rightCode = (slidingBits >> 3) & 7;
    const pairIndex = leftCode * letterCount + rightCode;

    const topOptionsMask = allowedTopMask[pairIndex];
    if (topOptionsMask === 0) {
      memoArray[currentRowBits] = 1;
      return false;
    }

    pairTopMasks[positionIndex] = topOptionsMask;
    slidingBits >>= 3;
  }

  const nextRowLength = rowLength - 1;

  // ...
}
```

### Step 8：在 DFS 中用 `buildNextRow` 枚舉下一排（逐格填入）

`buildNextRow` 會依序填入下一排每個位置；每格的候選字母由 `pairTopMasks[positionIndex]` 提供。
一旦任一完整下一排能到頂，立即回傳 `true`。

```typescript
function depthFirstSearch(currentRowBits: number, rowLength: number): boolean {
  // Step 6：主 DFS — 基底條件與 memo 查表

  // Step 7：建立相鄰 pair 的上層候選集合（fail fast）

  /**
   * @param positionIndex 下一排要填的索引位置
   * @param nextRowBits 下一排目前已打包的 bits
   * @returns 是否存在任一完成的下一排可到頂
   */
  function buildNextRow(positionIndex: number, nextRowBits: number): boolean {
    if (positionIndex === nextRowLength) {
      return depthFirstSearch(nextRowBits, nextRowLength);
    }

    let optionsMask = pairTopMasks[positionIndex];
    const bitShift = positionIndex * 3;

    while (optionsMask !== 0) {
      const leastBit = optionsMask & -optionsMask;
      const topCode = BIT_INDEX_BY_VALUE[leastBit];

      const updatedNextRowBits = nextRowBits | (topCode << bitShift);
      if (buildNextRow(positionIndex + 1, updatedNextRowBits)) {
        return true;
      }

      optionsMask ^= leastBit;
    }

    return false;
  }

  // ...
}
```

### Step 9：在 DFS 中完成遞迴呼叫與 memo 記錄，最後從 bottom 開始

把 `buildNextRow` 的結果寫回 memo，並回傳。最後由 `bottomRowBits` 開始 DFS。

```typescript
function depthFirstSearch(currentRowBits: number, rowLength: number): boolean {
  // Step 6：主 DFS — 基底條件與 memo 查表

  // Step 7：建立相鄰 pair 的上層候選集合（fail fast）

  // Step 8：用 buildNextRow 枚舉下一排

  const canBuild = buildNextRow(0, 0);
  memoArray[currentRowBits] = canBuild ? 2 : 1;
  return canBuild;
}

return depthFirstSearch(bottomRowBits, maximumLength);
```

## 時間複雜度

- 設 $n = bottom.length$，字母種類固定為 6，且每個位置以 3 bits 打包，因此長度為 $L$ 的 rowBits 狀態空間上界為 $8^L$。
- 對於每個長度為 $L$ 的狀態，先掃描相鄰 pair 建立候選集合，成本為 $O(L)$。
- 在最壞情況下，下一排長度為 $L-1$，每格最多 6 種候選字母，枚舉所有下一排組合的上界為 $O(6^{L-1})$。
- 記憶化保證每個 $(L, rowBits)$ 狀態最多計算一次，因此將每層狀態數與單狀態成本相乘後加總即可得最壞總時間。
- 總時間複雜度為 $O(\sum_{L=2}^{n} 8^L \cdot (L + 6^{L-1}))$。

> $O(\sum_{L=2}^{n} 8^L \cdot (L + 6^{L-1}))$

## 空間複雜度

- 記憶化表 `memoByLength[L]` 的大小為 $8^L$，總配置量為 $O(\sum_{L=2}^{n} 8^L)$。
- 緩衝 `pairTopMasksByLength[L]` 的總量為 $O(\sum_{L=2}^{n} (L-1))$，相較於 $8^L$ 為較小項。
- 其他結構（規則表與 bit→index 表）皆為常數空間。
- 總空間複雜度為 $O(\sum_{L=2}^{n} 8^L)$。

> $O(\sum_{L=2}^{n} 8^L)$
