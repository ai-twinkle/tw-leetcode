# 944. Delete Columns to Make Sorted

You are given an array of `n` strings `strs`, all of the same length.

The strings can be arranged such that there is one on each line, making a grid.

- For example, `strs = ["abc", "bce", "cae"]` can be arranged as follows:
  - `abc`
  - `bce`
  - `cae`

You want to delete the columns that are not sorted lexicographically. 
In the above example (0-indexed), columns 0 (`'a'`, `'b'`, `'c'`) and 2 (`'c'`, `'e'`, `'e'`) are sorted, 
while column 1 (`'b'`, `'c'`, `'a'`) is not, so you would delete column 1.

Return the number of columns that you will delete.

**Constraints:**

- `n == strs.length`
- `1 <= n <= 100`
- `1 <= strs[i].length <= 1000`
- `strs[i]` consists of lowercase English letters.

## 基礎思路

本題給定 `n` 個等長字串，把它們視為一個 `n x m` 的字元矩陣（`n` 列、`m` 欄）。
我們要刪除那些「欄位不是按字典序非遞減排列」的欄數量。

在思考解法時，我們注意到：

* **每一欄是否需要刪除是獨立判定的**：某一欄只需要檢查該欄自上而下的字元是否保持非遞減。
* **判定條件很直接**：只要存在某一列 `rowIndex` 使得 `strs[rowIndex-1][col] > strs[rowIndex][col]`，這一欄就不排序，必須刪除。
* **可以提早終止掃描**：一旦某欄發現下降對（decreasing pair），就可立即停止該欄檢查，避免不必要比較。
* **整體策略**：逐欄掃描，每欄逐列比較相鄰兩個字元；若發現違反非遞減就計入刪除數。

此策略簡潔且符合限制（`n <= 100`, `m <= 1000`），能在可接受時間內完成。

## 解題步驟

### Step 1：初始化列數、欄數與刪除計數器

先取得矩陣的列數與欄數，並初始化刪除欄位的計數器。

```typescript
const rowCount = strs.length;
const columnCount = strs[0].length;

let deletionCount = 0;
```

### Step 2：逐欄掃描並準備欄位檢查狀態

外層迴圈逐一遍歷每個欄位，並在每欄開始時設定「前一個字元」與「是否不排序」的旗標。

```typescript
for (let columnIndex = 0; columnIndex < columnCount; columnIndex++) {
  let previousCharCode = strs[0].charCodeAt(columnIndex);
  let isUnsorted = false;

  // ...
}
```

### Step 3：逐列比較相鄰字元，偵測是否出現下降對

對同一欄自上而下比較，若發現前一個字元大於目前字元，代表此欄不符合字典序，標記後立即停止掃描該欄。

```typescript
for (let columnIndex = 0; columnIndex < columnCount; columnIndex++) {
  // Step 2：逐欄掃描並準備欄位檢查狀態

  for (let rowIndex = 1; rowIndex < rowCount; rowIndex++) {
    const currentCharCode = strs[rowIndex].charCodeAt(columnIndex);

    // 一旦偵測到下降對，立刻停止掃描此欄
    if (previousCharCode > currentCharCode) {
      isUnsorted = true;
      break;
    }

    previousCharCode = currentCharCode;
  }

  // ...
}
```

### Step 4：若該欄不排序則累加刪除數

欄位掃描完後，若 `isUnsorted` 為真，代表這欄必須刪除，因此刪除計數加一。

```typescript
for (let columnIndex = 0; columnIndex < columnCount; columnIndex++) {
  // Step 2：逐欄掃描並準備欄位檢查狀態

  // Step 3：逐列比較相鄰字元，偵測是否出現下降對

  if (isUnsorted) {
    deletionCount++;
  }
}
```

### Step 5：回傳刪除欄位數量

所有欄位處理完畢後，回傳累計的刪除欄位數量。

```typescript
return deletionCount;
```

## 時間複雜度

- 外層逐欄掃描共 `m` 欄（令 `m = strs[0].length`）。
- 每一欄最壞情況需逐列比較 `n - 1` 次（令 `n = strs.length`），因為要檢查 `rowIndex = 1...n-1`。
- 雖然遇到下降對會提早 `break`，但最壞情況下每欄都不下降，仍需完整比較。
- 總時間複雜度為 $O(m\times(n - 1))$，等價於 $O(m \times n)$。

> $O(m \times n)$

## 空間複雜度

- 僅使用固定數量的變數（計數器、索引、暫存字元碼、旗標）。
- 未建立與輸入大小相關的額外資料結構。
- 總空間複雜度為 $O(1)$。

> $O(1)$
