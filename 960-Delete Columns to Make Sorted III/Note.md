# 960. Delete Columns to Make Sorted III

You are given an array of `n` strings `strs`, all of the same length.

We may choose any deletion indices, and we delete all the characters in those indices for each string.

For example, if we have `strs = ["abcdef","uvwxyz"]` and deletion indices `{0, 2, 3}`, then the final array after deletions is `["bef", "vyz"]`.

Suppose we chose a set of deletion indices `answer` such that after deletions, the final array has every string (row) in lexicographic order. 
(i.e., `(strs[0][0] <= strs[0][1] <= ... <= strs[0][strs[0].length - 1])`, and `(strs[1][0] <= strs[1][1] <= ... <= strs[1][strs[1].length - 1])`, and so on). 
Return the minimum possible value of `answer.length`.

**Constraints:**

- `n == strs.length`
- `1 <= n <= 100`
- `1 <= strs[i].length <= 100`
- `strs[i]` consists of lowercase English letters.

## 基礎思路

本題給定 `n` 個等長字串（每列長度為 `m`），我們可以選擇刪除一些「欄位索引」，並且對所有列同時刪掉這些欄位。
刪除後要求：**每一列（每個字串）都必須是非遞減（字典序）**，也就是每列在保留的欄位順序下，字元必須滿足從左到右不下降。

在思考解法時，需要注意以下關鍵點：

* **刪的是欄，不是單一字元**：一個欄位被刪除會同時影響所有列，因此「是否能保留某兩欄的相對順序」必須同時對所有列成立。
* **目標是最少刪除 = 最多保留**：如果我們能找出一組欄位序列（依原索引遞增）使得每一列都不下降，那保留欄位越多，刪除欄位就越少；因此可轉為「求最多可保留欄位數」。
* **欄位之間有可相容關係**：若對所有列都滿足「欄 a 的字元 ≤ 欄 b 的字元」，則在任何保留序列中把 a 放在 b 前面都不會破壞每列排序。這形成一個「可前置關係」。
* **轉為最長合法欄位序列問題**：先判斷每對欄位 (a, b) 是否可相容（a 能在 b 之前），再用動態規劃求「以每個欄位結尾的最長可保留鏈」，最後得到最大可保留欄位數 `L`，答案為 `m - L`。

## 解題步驟

### Step 1：初始化列數、欄數，並處理極小欄數情況

先取得 `rowCount` 與 `columnCount`。若欄數 ≤ 1，任何列都必然非遞減，因此不需刪除。

```typescript
const rowCount = strs.length;
const columnCount = strs[0].length;

// 若只有一欄或空欄，必定非遞減
if (columnCount <= 1) {
  return 0;
}
```

### Step 2：將所有字元攤平成數值矩陣以加速比較

把每個字元轉為 `charCode` 存進一維 TypedArray，避免在後續大量比較中反覆做字串索引與 `charCodeAt`。

```typescript
// 將所有字元攤平成 TypedArray，降低字串索引成本
const characterCodeMatrix = new Uint16Array(rowCount * columnCount);
for (let rowIndex = 0; rowIndex < rowCount; rowIndex++) {
  const currentRow = strs[rowIndex];
  const rowOffset = rowIndex * columnCount;

  // 將字元轉成 char code，便於數值比較
  for (let columnIndex = 0; columnIndex < columnCount; columnIndex++) {
    characterCodeMatrix[rowOffset + columnIndex] = currentRow.charCodeAt(columnIndex);
  }
}
```

### Step 3：預先計算欄位可前置關係 `canPrecedeMatrix`

對每一對欄 `(leftColumnIndex, rightColumnIndex)`（且 left < right），檢查是否對**所有列**都滿足 `left <= right`。若任一列違反，則這兩欄不能同時保留成「left 在 right 前」的合法順序。

```typescript
// canPrecedeMatrix[a * columnCount + b] === 1
// 表示保留欄 a 在欄 b 之前，不會讓任何一列的順序被破壞
const canPrecedeMatrix = new Uint8Array(columnCount * columnCount);
for (let leftColumnIndex = 0; leftColumnIndex < columnCount - 1; leftColumnIndex++) {
  for (let rightColumnIndex = leftColumnIndex + 1; rightColumnIndex < columnCount; rightColumnIndex++) {
    let isValid = 1;

    // 檢查所有列是否都能維持非遞減
    for (let rowIndex = 0; rowIndex < rowCount; rowIndex++) {
      const rowOffset = rowIndex * columnCount;

      // 任一列違反就可提早結束
      if (characterCodeMatrix[rowOffset + leftColumnIndex] > characterCodeMatrix[rowOffset + rightColumnIndex]) {
        isValid = 0;
        break;
      }
    }

    // 記錄結果，供後續 DP 用 O(1) 查詢
    canPrecedeMatrix[leftColumnIndex * columnCount + rightColumnIndex] = isValid;
  }
}
```

### Step 4：初始化 DP 陣列與全域最佳保留欄數

`longestChainEndingAt[i]` 表示「以第 i 欄結尾」時最多可保留的合法欄位數（最長鏈長度）。同時用 `longestKeptColumnCount` 維護全域最大值。

```typescript
// longestChainEndingAt[i] 表示以欄 i 結尾的最長合法欄位序列長度
const longestChainEndingAt = new Int16Array(columnCount);
longestChainEndingAt[0] = 1;

// 紀錄最多能保留的欄數
let longestKeptColumnCount = 1;
```

### Step 5：遍歷每個右端欄位，嘗試延伸先前的合法鏈

以 `rightColumnIndex` 作為當前結尾欄位，預設最短鏈為 1（只保留自己），並準備在內層迴圈嘗試由各個左欄延伸。

```typescript
for (let rightColumnIndex = 1; rightColumnIndex < columnCount; rightColumnIndex++) {
  // 這一欄至少可以單獨形成一條合法鏈
  let bestChainLength = 1;

  // ...
}
```

### Step 6：在同一個最外層迴圈內，掃描所有左欄並更新最佳鏈長

若 `leftColumnIndex` 能在 `rightColumnIndex` 前（`canPrecedeMatrix` 為 1），則可嘗試用 `longestChainEndingAt[left] + 1` 更新 `bestChainLength`。

```typescript
for (let rightColumnIndex = 1; rightColumnIndex < columnCount; rightColumnIndex++) {
  // Step 5：遍歷每個右端欄位並初始化 bestChainLength

  // Try extending all valid previous column chains
  for (let leftColumnIndex = 0; leftColumnIndex < rightColumnIndex; leftColumnIndex++) {
    if (canPrecedeMatrix[leftColumnIndex * columnCount + rightColumnIndex] !== 0) {
      const candidateChainLength = longestChainEndingAt[leftColumnIndex] + 1;

      // 更新以此欄結尾的最佳鏈長
      if (candidateChainLength > bestChainLength) {
        bestChainLength = candidateChainLength;
      }
    }
  }

  // ...
}
```

### Step 7：在同一個最外層迴圈內，寫回 DP 狀態並更新全域最大值

完成內層掃描後，把 `bestChainLength` 寫入 `longestChainEndingAt[right]`，並同步更新 `longestKeptColumnCount`。

```typescript
for (let rightColumnIndex = 1; rightColumnIndex < columnCount; rightColumnIndex++) {
  // Step 5：遍歷每個右端欄位並初始化 bestChainLength

  // Step 6：掃描所有左欄並更新 bestChainLength

  // Finalize DP state for this column
  longestChainEndingAt[rightColumnIndex] = bestChainLength;

  // Maintain global maximum chain length
  if (bestChainLength > longestKeptColumnCount) {
    longestKeptColumnCount = bestChainLength;
  }
}
```

### Step 8：以「總欄數 - 最多可保留欄數」得到最少刪除數

最少刪除欄位數 = `columnCount - longestKeptColumnCount`。

```typescript
// 最少刪除數 = 總欄數 - 最多可保留欄數
return columnCount - longestKeptColumnCount;
```

## 時間複雜度

- 建立 `characterCodeMatrix`：外層 `rowCount = n`、內層 `columnCount = m`，時間為 $O(nm)$。
- 建立 `canPrecedeMatrix`：`leftColumnIndex` 與 `rightColumnIndex` 枚舉所有欄位對，對數為 $\frac{m(m-1)}{2}$；每對需掃描所有列 `n`，時間為 $O!\left(n \cdot \frac{m(m-1)}{2}\right)$。
- DP 計算最長可保留鏈：外層 `m-1` 次，內層至多 `m-1` 次，時間為 $O(m^2)$。
- 總時間複雜度為 $O(nm + n\cdot \frac{m(m-1)}{2} + m^2)$

> $O(nm + n\cdot \frac{m(m-1)}{2} + m^2)$

## 空間複雜度

- `characterCodeMatrix`：大小為 `n * m`，空間為 $O(nm)$。
- `canPrecedeMatrix`：大小為 `m * m`，空間為 $O(m^2)$。
- `longestChainEndingAt`：大小為 `m`，空間為 $O(m)$。
- 總空間複雜度為 $O(nm + m^2 + m)$

> $O(nm + m^2 + m)$
