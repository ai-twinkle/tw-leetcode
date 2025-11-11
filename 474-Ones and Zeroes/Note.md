# 474. Ones and Zeroes

You are given an array of binary strings `strs` and two integers `m` and `n`.

Return the size of the largest subset of `strs` such that there are at most `m` `0`'s and `n` `1`'s in the subset.

A set `x` is a subset of a set `y` if all elements of `x` are also elements of `y`.

**Constraints:**

- `1 <= strs.length <= 600`
- `1 <= strs[i].length <= 100`
- `strs[i]` consists only of digits `'0'` and `'1'`.
- `1 <= m, n <= 100`

## 基礎思路

本題要求在一組二進位字串中，找出一個最大子集，使得其中所有字串的 `'0'` 總數不超過 `m`、`'1'` 總數不超過 `n`。
換句話說，我們有兩種資源（`0` 與 `1` 的數量上限），每個字串都消耗一定數量的這兩種資源，而我們要選出最多的字串，使其總消耗不超出上限。

這是一個**雙維度 0/1 背包問題（Two-dimensional Knapsack）**。
在思考解法時，需注意幾個重點：

- 每個字串可以選或不選，不能重複使用；
- 字串同時消耗兩種資源（`0` 與 `1`），需以雙維度動態規劃表示；
- 為避免重複計算，需要自下而上反向更新；
- 為應付上限約 100×100 的資源空間，必須使用高效儲存結構（如 TypedArray）。

為了解決這個問題，我們可以採取以下策略：

- **前置統計**：先統計每個字串中的 `0` 與 `1` 數量；
- **狀態定義**：`dp[i][j]` 表示使用至多 `i` 個 `0` 與 `j` 個 `1` 時，能得到的最大子集大小；
- **轉移關係**：若當前字串的 `(zeros, ones)` 為 `(a, b)`，則

  $$
  dp[i][j] = max(dp[i][j], dp[i - a][j - b] + 1)
  $$

- **反向更新**：為確保每個字串僅使用一次，更新時需從大到小迭代；
- **空間優化**：利用一維壓縮並展平成 TypedArray 陣列以減少記憶體與常數開銷。

## 解題步驟

### Step 1：初始化動態規劃表結構

以二維限制 `(m, n)` 建立壓平的一維動態規劃表，`dp[i * (n + 1) + j]` 代表使用至多 `i` 個 0 和 `j` 個 1 時的最大子集數。

```typescript
// 緩存寬度以避免重複計算 (n + 1)
const dynamicTableWidth = n + 1;

// 壓平的 DP 表：dp[zeroBudget * width + oneBudget] = 最大子集大小
const dynamicTable = new Uint16Array((m + 1) * dynamicTableWidth);
```

### Step 2：遍歷所有字串並統計每個字串的 0 與 1 數量

將每個字串視為一個「物品」，計算它的「花費」(使用多少個 0 和 1)。

```typescript
// 遍歷每個二元字串，視為背包中的一個物品
for (let stringIndex = 0; stringIndex < strs.length; stringIndex++) {
  const binaryString = strs[stringIndex];

  // 統計當前字串中 '1' 的數量
  let oneCountInString = 0;
  for (let characterIndex = 0; characterIndex < binaryString.length; characterIndex++) {
    if (binaryString.charCodeAt(characterIndex) === 49) {
      oneCountInString++;
    }
  }

  // 由長度與 1 的數量可得 0 的數量
  const zeroCountInString = binaryString.length - oneCountInString;

  // 若此字串本身已超過可用資源，直接跳過
  if (zeroCountInString > m || oneCountInString > n) {
    continue;
  }

  // ...
}
```

### Step 3：倒序遍歷並更新 DP 狀態（確保每個字串僅被使用一次）

採用 0/1 背包倒序更新策略。對每個字串，從大到小遍歷可用的 0 與 1 預算，
判斷是否加入該字串能使子集大小變大，若能則更新目前最佳值。

```typescript
for (let stringIndex = 0; stringIndex < strs.length; stringIndex++) {
  // Step 2：遍歷所有字串並統計每個字串的 0 與 1 數量

  // 倒序遍歷 0 與 1 預算，確保每個字串僅被使用一次
  for (let zeroBudget = m; zeroBudget >= zeroCountInString; zeroBudget--) {
    const currentRowBaseIndex = zeroBudget * dynamicTableWidth;
    const previousRowBaseIndex = (zeroBudget - zeroCountInString) * dynamicTableWidth;

    for (let oneBudget = n; oneBudget >= oneCountInString; oneBudget--) {
      const currentIndex = currentRowBaseIndex + oneBudget;
      const previousIndex = previousRowBaseIndex + (oneBudget - oneCountInString);

      // 若選取此字串，子集大小為前狀態 + 1
      const candidateSubsetSize = dynamicTable[previousIndex] + 1;

      // 更新當前最佳值（手動比較以避免 Math.max 開銷）
      if (candidateSubsetSize > dynamicTable[currentIndex]) {
        dynamicTable[currentIndex] = candidateSubsetSize;
      }
    }
  }
}
```

### Step 4：返回最終結果

最終答案為在資源上限 `(m, n)` 下可達成的最大子集大小。

```typescript
// 結果為 dp[m][n]
return dynamicTable[m * dynamicTableWidth + n];
```

## 時間複雜度

- 對每個字串計算位數總成本為所有字串長度總和：$O(k \times L)$（$k=\text{strs.length}$，$L$ 為單字串長度上限；最壞合併為 $O(\sum |str_i|)$）。
- 動態規劃雙重倒序遍歷：每個字串更新 $O(m \times n)$ 狀態。
- 總時間複雜度為 $O(k \times (m \times n + L))$；在常見情況下若 $m,n$ 較大，常簡寫為 $O(k \times m \times n)$。

> $O(k \times (m \times n + L))$

## 空間複雜度

- 壓平的 DP 陣列大小為 $(m + 1) \times (n + 1)$。
- 其餘變數僅為常數空間。
- 總空間複雜度為 $O(m \times n)$。

> $O(m \times n)$
