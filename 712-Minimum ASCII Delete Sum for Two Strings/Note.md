# 712. Minimum ASCII Delete Sum for Two Strings

Given two strings `s1` and `s2`, return the lowest ASCII sum of deleted characters to make two strings equal.

**Constraints:**

- `1 <= s1.length, s2.length <= 1000`
- `s1` and `s2` consist of lowercase English letters.

## 基礎思路

本題要讓兩個字串透過「刪除字元」變得相同，並使被刪除字元的 ASCII 總和最小。
等價地，我們可以從反方向思考：**盡量保留一個共同的子序列，使其 ASCII 總和最大**，因為保留得越多、需要刪掉的 ASCII 總和就越少。

關鍵觀察如下：

* **最終相等代表保留相同的共同子序列**：兩字串各自刪掉其餘字元後，剩下的必須完全一致，這正是「共同子序列」的概念。
* **成本最小 ⇔ 保留價值最大**：刪除成本是兩字串 ASCII 總和減去「被保留的共同部分」的兩倍，因此只要最大化共同子序列的 ASCII 總和即可。
* **動態規劃解共同子序列最佳值**：令狀態表示兩字串前綴能形成的「共同子序列最大 ASCII 總和」，即可用典型的二維 DP 轉移。
* **空間可壓縮**：DP 轉移只依賴前一列與當前列左側，因此可將二維表壓縮成一維陣列，節省記憶體。
* **將較短字串當作 DP 欄位**：用較短字串作為 DP 陣列寬度，可在不改變時間的情況下把空間降到最小。

## 解題步驟

### Step 1：初始化字串與確保 DP 欄位使用較短字串

先把兩字串指派到本地變數，並在必要時交換，確保第二個字串較短，以縮小一維 DP 的寬度。

```typescript
// 讓 DP 的寬度盡可能小（只存較短字串的欄位）
let firstString = s1;
let secondString = s2;

if (secondString.length > firstString.length) {
  const temporaryString = firstString;
  firstString = secondString;
  secondString = temporaryString;
}

const firstLength = firstString.length;
const secondLength = secondString.length;
```

### Step 2：預先計算較短字串的 ASCII 陣列與總和

將較短字串每個字元的 ASCII code 存入 TypedArray，同時計算其 ASCII 總和，供最後答案使用。

```typescript
// ASCII 範圍保證是 97..122（小寫英文字母），使用 Uint8Array 即可
const secondAsciiCodes = new Uint8Array(secondLength);
let totalAsciiSumSecond = 0;

for (let index = 0; index < secondLength; index++) {
  const asciiCode = secondString.charCodeAt(index);
  secondAsciiCodes[index] = asciiCode;
  totalAsciiSumSecond += asciiCode;
}
```

### Step 3：建立一維 DP 陣列並準備逐列更新

`bestCommonAsciiSumByColumn` 表示：在第一字串某個前綴與第二字串某個前綴之間，能保留的共同子序列最大 ASCII 總和。
後續會用「逐列掃描」方式原地更新它。

```typescript
// bestCommonAsciiSumByColumn[column] = firstString[0..row) 與 secondString[0..column)
// 之間共同子序列的最大 ASCII 總和
const bestCommonAsciiSumByColumn = new Int32Array(secondLength + 1);

let totalAsciiSumFirst = 0;
```

### Step 4：外層逐列掃描第一字串，建立內層更新骨架

每次固定一個 `rowIndex`（第一字串某字元作為當前列），並用 `previousDiagonal` 保存左上角值，以支援一維 DP 的正確轉移。

```typescript
for (let rowIndex = 0; rowIndex < firstLength; rowIndex++) {
  const firstCharCode = firstString.charCodeAt(rowIndex);
  totalAsciiSumFirst += firstCharCode;

  let previousDiagonal = 0;

  // 重要步驟：用 previousDiagonal（上一列的左上角）原地更新 DP
  for (let columnIndex = 0; columnIndex < secondLength; columnIndex++) {
    // ...
  }
}
```

### Step 5：在同一個雙層迴圈中完成 DP 轉移（核心）

若兩字元相等，代表可延伸共同子序列；否則取「跳過第一字串字元」或「跳過第二字串字元」兩者的最大值。
同時用 `savedFromPreviousRow` 保存上一列同欄位的舊值，並在迴圈尾端更新 `previousDiagonal`。

```typescript
for (let rowIndex = 0; rowIndex < firstLength; rowIndex++) {
  // Step 4：外層逐列掃描第一字串

  const firstCharCode = firstString.charCodeAt(rowIndex);
  totalAsciiSumFirst += firstCharCode;

  let previousDiagonal = 0;

  for (let columnIndex = 0; columnIndex < secondLength; columnIndex++) {
    const savedFromPreviousRow = bestCommonAsciiSumByColumn[columnIndex + 1];

    if (firstCharCode === secondAsciiCodes[columnIndex]) {
      bestCommonAsciiSumByColumn[columnIndex + 1] = previousDiagonal + firstCharCode;
    } else {
      const keepFromFirstPrefix = savedFromPreviousRow;
      const keepFromSecondPrefix = bestCommonAsciiSumByColumn[columnIndex];
      bestCommonAsciiSumByColumn[columnIndex + 1] =
        keepFromFirstPrefix > keepFromSecondPrefix ? keepFromFirstPrefix : keepFromSecondPrefix;
    }

    previousDiagonal = savedFromPreviousRow;
  }
}
```

### Step 6：由最大共同保留值推回最小刪除成本並回傳

共同子序列的最大 ASCII 總和為 `commonAsciiSum`，
最小刪除總和 = 兩字串 ASCII 總和 − 2 × commonAsciiSum。

```typescript
const commonAsciiSum = bestCommonAsciiSumByColumn[secondLength];
return totalAsciiSumFirst + totalAsciiSumSecond - (commonAsciiSum + commonAsciiSum);
```

## 時間複雜度

- 設 `m = max(|s1|, |s2|)`、`n = min(|s1|, |s2|)`（交換後 `firstLength = m`、`secondLength = n`）。
- 預處理第二字串 ASCII 與總和：執行 `n` 次迴圈，為 $O(n)$。
- DP 主體為雙層迴圈：外層 `m` 次、內層 `n` 次，每次皆為常數操作，為 $O(mn)$。
- 其餘計算與回傳為常數時間。
- 總時間複雜度為 $O(mn)$。

> $O(mn)$

## 空間複雜度

- `secondAsciiCodes` 長度為 `n` 的 `Uint8Array`：$O(n)$。
- `bestCommonAsciiSumByColumn` 長度為 `n+1` 的 `Int32Array`：$O(n)$。
- 其餘變數皆為常數額外空間。
- 總空間複雜度為 $O(n)$。

> $O(n)$
