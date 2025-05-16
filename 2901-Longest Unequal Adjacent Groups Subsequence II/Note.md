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

本題目希望從給定的單字陣列中，挑選出最長的一個子序列，且此子序列滿足以下條件：

- 子序列內任兩個相鄰的單字必須屬於不同的群組。
- 相鄰的兩個單字必須長度相同，且兩單字之間的漢明距離（hamming distance）正好為 $1$（即只差一個字元）。

為解決這個問題，我們使用動態規劃（Dynamic Programming）策略：

- 定義狀態：

  - `dpLength[i]`：表示以第 $i$ 個單字結尾的最長有效子序列的長度。
  - `previousIndex[i]`：表示以第 $i$ 個單字結尾的最長子序列中，前一個單字的索引，用於最後重建答案。

透過動態規劃，我們可以逐步計算並記錄每個位置的最佳結果，最終取得整個問題的最優解。

## 解題步驟

### Step 1：初始化與資料結構

取得輸入的單字數量，並將輸入的群組資料轉換成 Typed Array（提升運算效率）：

```typescript
const itemCount = words.length;

// 1. 將 groups 轉成 Typed Array 提升效能
const groupIndices = new Uint16Array(groups);
```

### Step 2：預處理單字成字元編碼陣列

為了更有效率地計算漢明距離，將每個單字預先轉換成字元編碼（char code）的陣列：

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

我們建立並初始化動態規劃的相關陣列：

- `dpLength`：初始化為 1（每個單字本身都是長度為 1 的有效子序列）。
- `previousIndex`：初始化為 -1，代表每個單字起初沒有前置單字。

```typescript
// 3. 初始化 dp 陣列
const dpLength = new Uint16Array(itemCount);
dpLength.fill(1); // 每個單字本身即長度為 1 的子序列
const previousIndex = new Int16Array(itemCount);
previousIndex.fill(-1); // -1 表示前面沒有單字
```

### Step 4：建立單字長度到索引的對應表

由於只有長度相同的單字才可能相鄰，我們建立一個 `Map` 來保存同樣長度單字的索引，方便快速查詢：

```typescript
// 4. 建立單字長度與索引列表的對應表
const lengthToIndices = new Map<number, number[]>();
```

### Step 5：主要 DP 運算

開始進行動態規劃，對每個單字進行以下操作：

- 取得當前單字的編碼陣列與群組資訊。
- 找到與當前單字長度相同的其他單字。
- 逐一檢查其他單字：

  - **群組不同**
  - **漢明距離為 1**（只有一個字元不同）
  - 更新 DP 狀態（若能提升當前子序列長度）

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
      // 僅考慮可提升 dpLength[currentIndex] 且群組不同
      if (
        candidateDp + 1 > dpLength[currentIndex] &&
        groupIndices[candidateIndex] !== currentGroup
      ) {
        // 檢查漢明距離（超過 1 即可提早退出）
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

透過比較所有 `dpLength` 的值，找到最長子序列的結尾位置：

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

利用 `previousIndex` 陣列，從結尾開始往回追溯，重建整個子序列：

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

將子序列索引轉換回實際的單字，得出答案：

```typescript
// 8. 將索引映射回單字
return resultIndices.map(i => words[i]);
```

## 時間複雜度

- 主要 DP 迴圈對每個單字最多檢查 $O(n)$ 個其他單字（長度最多 $10$ 可視為常數）。

- 每次檢查漢明距離最多需 $O(10)$（常數時間）。

- 總時間複雜度為 $O(n^2)$。

> $O(n^2)$

## 空間複雜度

- 儲存 DP 狀態 (`dpLength`, `previousIndex`) 與字元編碼陣列 (`wordCharCodes`) 需要 $O(n)$。

- 儲存單字長度對應索引的 Map (`lengthToIndices`) 亦為 $O(n)$。

- 總空間複雜度為 $O(n)$。

> $O(n)$
