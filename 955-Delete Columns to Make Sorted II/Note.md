# 955. Delete Columns to Make Sorted II

You are given an array of `n` strings `strs`, all of the same length.

We may choose any deletion indices, and we delete all the characters in those indices for each string.

For example, if we have `strs = ["abcdef","uvwxyz"]` and deletion indices `{0, 2, 3}`, then the final array after deletions is `["bef", "vyz"]`.

Suppose we chose a set of deletion indices `answer` such that after deletions, 
the final array has its elements in lexicographic order (i.e., `strs[0] <= strs[1] <= strs[2] <= ... <= strs[n - 1]`). 
Return the minimum possible value of `answer.length`.

**Constraints:**

- `n == strs.length`
- `1 <= n <= 100`
- `1 <= strs[i].length <= 100`
- `strs[i]` consists of lowercase English letters.

## 基礎思路

本題給定 `n` 個等長字串（每個長度為 `m`），我們可以選擇刪除某些「欄位索引」，並對所有字串同步刪除那些欄位，使得刪除後的字串陣列滿足：

`strs[0] <= strs[1] <= ... <= strs[n-1]`（字典序非遞減）。

我們要找最少刪除欄位數。

在思考解法時，有幾個關鍵觀察：

* **比較順序由左到右決定**：字典序比較時，最左邊第一個不同字元就決定大小，因此我們應該從左到右逐欄處理。
* **相鄰列對（row i, row i+1）是基本約束單位**：只要所有相鄰對都能確保非遞減，整體陣列就會非遞減。
* **已確定嚴格有序的相鄰對可「永久解決」**：若在某欄位出現 `strs[i][col] < strs[i+1][col]`，且之前所有保留欄位都相等，則這一對相鄰列的順序已確定，後面欄位不再需要考慮它。
* **貪心刪欄策略**：依序檢查每一欄：

    * 若存在某個尚未解決的相鄰對在此欄出現降序（上 > 下），這欄必須刪除；
    * 否則保留此欄，並把在此欄出現上 < 下的相鄰對標記為已解決。

透過「從左到右逐欄判斷刪或留」並維護相鄰對的解決狀態，就能以線性掃描方式得到最少刪除欄位數。

## 解題步驟

### Step 1：初始化狀態與輔助結構

建立：

* `isAdjacentPairResolved`：標記每個相鄰列對是否已經被判定為嚴格有序；
* `pendingResolvedPairIndex`：暫存本欄位能讓哪些相鄰對變成已解決；
* `unresolvedPairCount`：尚未解決的相鄰對數量；
* `deletedColumnCount`：刪除欄位計數。

```typescript
const rowCount = strs.length;
const columnCount = strs[0].length;

// 追蹤每個相鄰列對 (rowIndex, rowIndex+1) 是否已經被判定為嚴格有序
const isAdjacentPairResolved = new Uint8Array(rowCount - 1);

// 可重用的緩衝：儲存本欄位可使哪些相鄰列對變為已解決
const pendingResolvedPairIndex = new Uint8Array(rowCount - 1);

let unresolvedPairCount = rowCount - 1;
let deletedColumnCount = 0;
```

### Step 2：逐欄遍歷並建立最外層迴圈骨架

從左到右掃描每個欄位；若所有相鄰對都已解決，代表後續欄位不可能再影響結果，可提前結束。

```typescript
for (let columnIndex = 0; columnIndex < columnCount; columnIndex++) {
  if (unresolvedPairCount === 0) {
    break;
  }

  let mustDeleteColumn = false;
  let pendingCount = 0;

  // ...
}
```

### Step 3：在同一個最外層迴圈中掃描相鄰列對，判斷是否必須刪除此欄

對每個尚未解決的相鄰列對比較此欄位字元：

* 若出現 `upper > lower`：此欄會破壞字典序，必須刪除並跳到下一欄。
* 若出現 `upper < lower`：此相鄰對會被此欄「解決」，先放入暫存清單，等確定此欄不刪除後再套用。

```typescript
for (let columnIndex = 0; columnIndex < columnCount; columnIndex++) {
  // Step 2：逐欄遍歷並建立最外層迴圈骨架

  // 掃描此欄一次：判斷是否需刪除，並記錄可被解決的相鄰對
  for (let rowIndex = 0; rowIndex < rowCount - 1; rowIndex++) {
    if (isAdjacentPairResolved[rowIndex] !== 0) {
      continue;
    }

    const upperCode = strs[rowIndex].charCodeAt(columnIndex);
    const lowerCode = strs[rowIndex + 1].charCodeAt(columnIndex);

    if (upperCode > lowerCode) {
      // 重要步驟：此欄對未解決相鄰對造成降序 -> 必須刪除此欄
      mustDeleteColumn = true;
      deletedColumnCount++;
      break;
    }

    if (upperCode < lowerCode) {
      pendingResolvedPairIndex[pendingCount] = rowIndex;
      pendingCount++;
    }
  }

  // ...
}
```

### Step 4：若本欄必須刪除則跳過；否則套用「解決相鄰對」更新

只有在「本欄被保留」時，才把 `pendingResolvedPairIndex` 中的相鄰對標記為已解決，並同步減少 `unresolvedPairCount`。

```typescript
for (let columnIndex = 0; columnIndex < columnCount; columnIndex++) {
  // Step 2：逐欄遍歷並建立最外層迴圈骨架

  // Step 3：掃描相鄰列對，判斷是否必須刪除此欄

  if (mustDeleteColumn) {
    continue;
  }

  // 只有在保留此欄時，才套用「已解決」狀態更新
  for (let pendingIndex = 0; pendingIndex < pendingCount; pendingIndex++) {
    const pairIndex = pendingResolvedPairIndex[pendingIndex];
    if (isAdjacentPairResolved[pairIndex] === 0) {
      isAdjacentPairResolved[pairIndex] = 1;
      unresolvedPairCount--;
    }
  }
}
```

### Step 5：回傳最少刪除欄位數

所有欄位處理完後，`deletedColumnCount` 即為最少刪除的欄位數。

```typescript
return deletedColumnCount;
```

## 時間複雜度

- 外層以欄位數 $m$（`strs[0].length`）進行遍歷。
- 每一欄最壞需掃描所有尚未解決的相鄰列對，最多為 $n - 1$（其中 $n = strs.length$），因此掃描成本為 $O(n)$。
- 若該欄不刪除，還需套用本欄可解決的相鄰列對更新，最壞也為 $n - 1$，更新成本同為 $O(n)$。
- 因此每一欄最壞成本為 $O(n)$，整體最壞為 $m \cdot O(n)$。
- 總時間複雜度為 $O(n \times m)$。

> $O(n \times m)$

## 空間複雜度

- `isAdjacentPairResolved` 與 `pendingResolvedPairIndex` 皆為長度 $n - 1$ 的 `Uint8Array`，合計額外空間為 $O(n)$。
- 其餘變數為常數級。
- 總空間複雜度為 $O(n)$。

> $O(n)$
