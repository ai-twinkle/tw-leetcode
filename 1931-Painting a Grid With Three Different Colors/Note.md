# 1931. Painting a Grid With Three Different Colors

You are given two integers `m` and `n`. 
Consider an `m x n` grid where each cell is initially white. 
You can paint each cell red, green, or blue. All cells must be painted.

Return the number of ways to color the grid with no two adjacent cells having the same color. 
Since the answer can be very large, return it modulo $10^9 + 7$.

**Constraints:**

- `1 <= m <= 5`
- `1 <= n <= 1000`

## 基礎思路

題目要求在一個 $m \times n$ 的網格上進行紅、綠、藍三色著色，每個格子須塗上顏色，且相鄰（上下左右）的格子不能使用相同的顏色。

由於每個格子相鄰的限制，若單純逐格塗色會過於複雜，但考量到題目的特殊性：$m \leq 5$ 很小，這暗示我們可以：

- **列舉所有可能的列（column）著色方式**（因為每列至多有 $3^m$ 種可能），然後去掉垂直方向內相鄰同色的無效模式。
- 再針對**相鄰兩列的模式間的相容性**（即垂直相同位置不可同色）進行預先計算並快取。
- 最後用**動態規劃**，從左到右依次計算每一列的模式數量，藉由已快取的模式相容性快速推算下一列的數量。

此方法可大幅縮減運算量，符合題目規模要求。

### Step 1：生成並快取所有相容的欄模式

#### Step 1.1：建立快取，避免重複計算

我們先建立一個快取物件，針對不同列數，避免重複計算相容模式的鄰接列表。

```typescript
// cache[rows] = 相容的欄模式的鄰接列表
const compatibilityListCache: { [rows: number]: number[][] } = {};

function ensureCompatibilityList(rows: number): number[][] {
  // 若已計算過此 `rows`，則返回快取的鄰接列表
  if (compatibilityListCache[rows]) {
    return compatibilityListCache[rows];
  }
  
  // ...
}
```

#### Step 1.2：生成所有合法的單欄著色模式

利用 DFS 遞迴產生每一欄的所有合法著色模式（保證同一欄上下相鄰格子不同色），並儲存下來。

```typescript
function ensureCompatibilityList(rows: number): number[][] {
  // Step 1.1：建立快取，避免重複計算
  
  // Step 1.2：生成所有有效的欄模式（欄位著色），確保相鄰格子顏色不同
  const validColumnPatterns: number[][] = [];
  const currentPattern: number[] = new Array(rows);

  function generatePatterns(position: number): void {
    // 當填滿所有格子時，儲存此合法模式
    if (position === rows) {
      validColumnPatterns.push(currentPattern.slice());
      return;
    }

    for (let colorIndex = 0; colorIndex < 3; colorIndex++) {
      // 若與上一格同色則略過
      if (position > 0 && currentPattern[position - 1] === colorIndex) {
        continue;
      }

      currentPattern[position] = colorIndex;
      generatePatterns(position + 1);
    }
  }

  generatePatterns(0);

  // ...
}
```

#### Step 1.3：計算並建立所有模式的相容鄰接列表

對每一對模式，檢查相同 row 位置是否顏色不同，如果都不同則兩模式相容，將其加入 adjacency list。

```typescript
function ensureCompatibilityList(rows: number): number[][] {
  // Step 1.1：建立快取，避免重複計算
  
  // Step 1.2：生成所有合法的單欄著色模式

  // Step 1.3：建立所有模式的相容鄰接列表
  const patternCount = validColumnPatterns.length;
  const compatibilityAdjacencyList: number[][] = Array.from(
    { length: patternCount },
    () => [],
  );

  for (let firstPatternIndex = 0; firstPatternIndex < patternCount; firstPatternIndex++) {
    const firstPattern = validColumnPatterns[firstPatternIndex];

    for (let secondPatternIndex = 0; secondPatternIndex < patternCount; secondPatternIndex++) {
      const secondPattern = validColumnPatterns[secondPatternIndex];
      let isCompatible = true;

      for (let rowIndex = 0; rowIndex < rows; rowIndex++) {
        // 若有任一 row 在相鄰欄顏色相同，則不相容
        if (firstPattern[rowIndex] === secondPattern[rowIndex]) {
          isCompatible = false;
          break;
        }
      }

      // 若所有 row 都不同色，則這兩種模式相容
      if (isCompatible) {
        compatibilityAdjacencyList[firstPatternIndex].push(secondPatternIndex);
      }
    }
  }

  // 快取結果以便下次直接返回
  compatibilityListCache[rows] = compatibilityAdjacencyList;
  return compatibilityAdjacencyList;
}
```

### Step 2：初始化 DP 緩衝區

計算所有合法模式後，初始化 DP 緩衝區。第一欄每一種模式皆可單獨成立，設為 1，其餘欄以 0 起始。

```typescript
function colorTheGrid(rowCount: number, columnCount: number): number {
  const MODULO = 1_000_000_007;

  // 預先取得單欄的所有相容模式
  const compatibilityAdjacencyList = ensureCompatibilityList(rowCount);
  const patternCount = compatibilityAdjacencyList.length;

  // waysForPreviousColumn[i] 代表目前在第1欄，且末尾為第i種pattern的方案數
  let waysForPreviousColumn = new Int32Array(patternCount).fill(1); // 第一欄所有模式均有效
  let waysForCurrentColumn = new Int32Array(patternCount);          // 暫存新欄狀態
  
  // ...
}
```

### Step 3：動態規劃計算每一欄的方法數

每一欄的每一個 pattern，將所有可從前一欄轉移過來的 pattern 方案數累加起來，並維持模數範圍。

```typescript
function colorTheGrid(rowCount: number, columnCount: number): number {
  // Step 2：初始化 DP 緩衝區

  // 從第2欄（index=1）到第n欄依序遞推
  for (let columnIndex = 1; columnIndex < columnCount; columnIndex++) {
    waysForCurrentColumn.fill(0);

    for (let previousPatternIndex = 0; previousPatternIndex < patternCount; previousPatternIndex++) {
      const waysCount = waysForPreviousColumn[previousPatternIndex];
      // 若這個pattern無法形成任何合法著色則跳過
      if (waysCount === 0) {
        continue;
      }

      // 對所有與當前pattern相容的下一pattern，將方法數累加
      const compatibleNextPatterns = compatibilityAdjacencyList[previousPatternIndex];
      for (let neighborIndex = 0; neighborIndex < compatibleNextPatterns.length; neighborIndex++) {
        const nextPatternIndex = compatibleNextPatterns[neighborIndex];
        let updatedWays = waysForCurrentColumn[nextPatternIndex] + waysCount;

        // 維持結果在模數範圍內
        if (updatedWays >= MODULO) {
          updatedWays -= MODULO;
        }
        waysForCurrentColumn[nextPatternIndex] = updatedWays;
      }
    }

    // 交換前後兩個 DP 緩衝區，不重新配置
    const swapTemporary = waysForPreviousColumn;
    waysForPreviousColumn = waysForCurrentColumn;
    waysForCurrentColumn = swapTemporary;
  }
  
  // ...
}
```

### Step 4：計算最終結果

遍歷最後一欄所有模式，將方案數加總即為答案。

```typescript
function colorTheGrid(rowCount: number, columnCount: number): number {
  // Step 2：初始化 DP 緩衝區
  
  // Step 3：動態規劃計算每一欄的方法數

  // 最終結果為所有末尾pattern的方案總和
  let totalWays = 0;
  for (let patternIndex = 0; patternIndex < patternCount; patternIndex++) {
    totalWays += waysForPreviousColumn[patternIndex];
    if (totalWays >= MODULO) {
      totalWays -= MODULO;
    }
  }
  return totalWays;
}
```

## 時間複雜度

- 枚舉合法模式約需 $O(m \cdot 2^m)$。
- 模式間相容性建表 $O(m \cdot 4^m)$。
- 動態規劃每一欄計算時間為 $O(n \cdot 4^m)$。
- 總時間複雜度為：$O(n \times 4^m)$。

> $O(n \times 4^m)$

## 空間複雜度

- 快取模式相容性列表的空間複雜度為 $O(4^m)$。
- DP 狀態緩衝區需 $O(2^m)$ 空間。
- 總空間複雜度為：$O(4^m)$。

> $O(4^m)$
