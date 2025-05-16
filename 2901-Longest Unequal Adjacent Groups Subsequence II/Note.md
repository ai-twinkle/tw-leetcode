# 2901. Longest Unequal Adjacent Groups Subsequence II

You are given a string array `words`, and an array `groups`, both arrays having length `n`.

The hamming distance between two strings of equal length is the number of positions at which the corresponding characters are different.

You need to select the longest subsequence from an array of indices $[0, 1, ..., n - 1]$, 
such that for the subsequence denoted as $[i_0, i_1, ..., i_{k-1}]$ having length `k`, the following holds:

- For adjacent indices in the subsequence, their corresponding groups are unequal, i.e., $groups[i_j] != groups[i_{j+1}]$, 
  for each `j` where `0 < j + 1 < k`.
- $words[i_j]$ and $words[i_{j+1}]$ are equal in length, and the hamming distance between them is `1`, 
  where `0 < j + 1 < k`, for all indices in the subsequence.

Return a string array containing the words corresponding to the indices (in order) in the selected subsequence. If there are multiple answers, return any of them.

Note: strings in `words` may be unequal in length.

**Constraints:**

- `1 <= n == words.length == groups.length <= 1000`
- `1 <= words[i].length <= 10`
- `1 <= groups[i] <= n`
- `words` consists of distinct strings.
- `words[i]` consists of lowercase English letters.

## 基礎思路

題目要求從給定的字串陣列 `words` 中選出一個最長的子序列，使得：

* 子序列內任兩個相鄰的單字屬於不同的群組（即 `groups[i_j] ≠ groups[i_{j+1}]`）。
* 相鄰兩個單字長度相同且漢明距離（hamming distance）剛好為 $1$。

此問題適合使用動態規劃（DP）解決。我們定義：

* `dpLength[i]`：表示以第 $i$ 個單字作為子序列結尾時的最長有效子序列長度。
* `previousIndex[i]`：表示以第 $i$ 個單字作為結尾的最長子序列中，前一個單字的索引，用以重建最終答案。

## 解題步驟

### Step 1：初始化與資料結構

首先，取得單字的總數，並將群組陣列轉成 Typed Array（提高運算效率）：

```typescript
const itemCount = words.length;

// 1. 將 groups 轉成 Typed Array 提升效能
const groupIndices = new Uint16Array(groups);
```

### Step 2：預處理單字成字元編碼陣列

將所有單字預處理成字元編碼（char code）的陣列，方便後續快速比對：

```typescript
// 2. 預計算每個單字的字元編碼
const wordCharCodes: Uint8Array[] = new Array(itemCount);
for (let idx = 0; idx < itemCount; idx++) {
  const w = words[idx];
  const codes = new Uint8Array(w.length);
  for (let pos = 0; pos < w.length; pos++) {
    codes[pos] = w.charCodeAt(pos);
  }
  wordCharCodes[idx] = codes;
}
```

### Step 3：初始化 DP 陣列

建立動態規劃用的陣列，初始情況下每個單字獨立皆可形成長度為 1 的子序列：

```typescript
// 3. 初始化 dp 陣列
const dpLength = new Uint16Array(itemCount);
dpLength.fill(1);  // 每個單字本身即長度為 1 的子序列
const previousIndex = new Int16Array(itemCount);
previousIndex.fill(-1); // -1 表示前面沒有單字
```

### Step 4：建立單字長度到索引的對應表

由於相鄰單字需長度相同，我們建立一個 `Map`，用來快速找到與當前單字同長度的其他單字：

```typescript
// 4. 建立單字長度與索引列表的對應表
const lengthToIndices = new Map<number, number[]>();
```

### Step 5：主要 DP 運算

依序檢查每個單字，與先前同長度的單字進行比對：

* 確保群組不同。
* 確保漢明距離為 $1$（有且只有一個字元不同）。

符合條件則更新 DP 狀態：

```typescript
// 5. 主 DP 迴圈
for (let currentIndex = 0; currentIndex < itemCount; currentIndex++) {
  const currentCodes = wordCharCodes[currentIndex];
  const currentLength = currentCodes.length;
  const currentGroup = groupIndices[currentIndex];

  const bucket = lengthToIndices.get(currentLength);
  if (bucket) {
    for (const candidateIndex of bucket) {
      const candidateDp = dpLength[candidateIndex];
      // 只有當能改善 dpLength[currentIndex] 時才考慮
      if (
        candidateDp + 1 > dpLength[currentIndex] &&
        groupIndices[candidateIndex] !== currentGroup
      ) {
        // 檢查漢明距離是否為 1（可提早退出）
        let differences = 0;
        const candidateCodes = wordCharCodes[candidateIndex];
        for (let p = 0; p < currentLength; p++) {
          if (candidateCodes[p] !== currentCodes[p] && ++differences > 1) {
            break;
          }
        }
        if (differences === 1) {
          dpLength[currentIndex] = candidateDp + 1;
          previousIndex[currentIndex] = candidateIndex;
        }
      }
    }
    bucket.push(currentIndex);
  } else {
    lengthToIndices.set(currentLength, [currentIndex]);
  }
}
```

### Step 6：找到最長子序列的結尾索引

透過遍歷找到 `dpLength` 最大的索引，以開始回溯最長子序列：

```typescript
// 6. 找出 dpLength 最大值的索引
let bestIndex = 0;
let bestValue = dpLength[0];
for (let i = 1; i < itemCount; i++) {
  const v = dpLength[i];
  if (v > bestValue) {
    bestValue = v;
    bestIndex = i;
  }
}
```

### Step 7：回溯重建子序列

從最佳索引開始，透過 `previousIndex` 陣列回溯構建子序列：

```typescript
// 7. 回溯以重建最長子序列的索引
const resultIndices: number[] = [];
for (let i = bestIndex; i >= 0; i = previousIndex[i]) {
  resultIndices.push(i);
  if (previousIndex[i] < 0) {
    break;
  }
}
resultIndices.reverse();
```

### Step 8：索引映射回單字陣列

最後將得到的索引陣列轉換回原始單字：

```typescript
// 8. 將索引映射回單字
return resultIndices.map(i => words[i]);
```

## 時間複雜度

* **主要 DP 迴圈**：每個單字最多需比較與前面所有同長度的單字，因每個單字長度最多 $10$，因此比較每組最多 $O(n \cdot 10)$。

* 每次漢明距離檢查操作為 $O(10)$，視為常數時間。

* 總時間複雜度為 $O(n^2)$。

> $O(n^2)$

## 空間複雜度

* 儲存 `groupIndices`、`dpLength`、`previousIndex`、`wordCharCodes` 等 DP 相關陣列需 $O(n)$ 空間。

* `lengthToIndices` 的陣列總大小亦為 $O(n)$。

* 每個單字長度最大為常數 $10$，故可視為常數空間。

* 總空間複雜度為 $O(n)$。

> $O(n)$
