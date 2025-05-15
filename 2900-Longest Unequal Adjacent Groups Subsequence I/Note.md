# 2900. Longest Unequal Adjacent Groups Subsequence I

You are given a string array `words` and a binary array `groups` both of length `n`, 
where `words[i]` is associated with `groups[i]`.

Your task is to select the longest alternating subsequence from `words`. 
A subsequence of words is alternating if for any two consecutive strings in the sequence, 
their corresponding elements in the binary array `groups` differ. 
Essentially, you are to choose strings such that adjacent elements have non-matching corresponding bits in the `groups` array.

Formally, you need to find the longest subsequence of an array of indices $[0, 1, ..., n - 1]$ denoted as $[i_0, i_1, ..., i_{k-1}]$, 
such that $groups[i_j] != groups[i_{j+1}]$ for each `0 <= j < k - 1` and then find the words corresponding to these indices.

Return the selected subsequence. If there are multiple answers, return any of them.

Note: The elements in `words` are distinct.

**Constraints:**

- `1 <= n == words.length == groups.length <= 100`
- `1 <= words[i].length <= 10`
- `groups[i]` is either `0` or `1`.
- `words` consists of distinct strings.
- `words[i]` consists of lowercase English letters.

## 基礎思路

題目要求從給定的字串陣列 `words` 與其對應的二元陣列 `groups` 中，選出一個最長的「交替子序列」。
所謂「交替子序列」，即是相鄰選取的兩個字串在 `groups` 中的值互不相同。

我們採用貪心策略來解題，因為只要能選擇就盡量選擇，即可保證最長：

- 從左至右依序遍歷每個元素；
- 若當前元素的群組與上一個加入子序列的群組不同，則將該元素加入子序列中。

具體操作方式為：

1. 設置一個變數 `lastGroup` 來紀錄上一個加入子序列元素的群組，初始值設定為無效值（如 `-1`）。
2. 逐個掃描每個元素，檢查是否能加入子序列（即群組不同），若可以則直接加入並更新 `lastGroup`。

## 解題步驟

### Step 1：初始化資料結構與狀態變數

首先，我們定義以下幾個重要的變數：

- `n`：字串陣列 `words` 的長度。
- `result`：用於儲存最終選擇的交替子序列。
- `lastGroup`：紀錄上一個加入子序列元素所屬群組，初始設為 `-1`，表示尚未加入任何元素。

```typescript
const n = words.length;      // 字串陣列的長度
const result: string[] = []; // 存放結果的交替子序列
let lastGroup = -1;          // 初始化為 -1，表示初始時尚未加入任何群組
```

### Step 2：貪心掃描並更新子序列

接下來，我們依序掃描每個元素：

- 若目前元素的群組與上一個元素不同，即 `groups[i] !== lastGroup`，表示可加入子序列：

   - 將 `words[i]` 加入 `result`；
   - 更新 `lastGroup` 為目前元素的群組 `groups[i]`。

程式碼如下：

```typescript
for (let i = 0; i < n; i++) {
  if (groups[i] !== lastGroup) { // 檢查是否為不同群組
    result.push(words[i]);       // 加入交替子序列
    lastGroup = groups[i];       // 更新上次加入元素的群組
  }
}
```

### Step 3：返回最終結果

完成掃描後，`result` 即為符合要求的最長交替子序列，直接返回即可。

```typescript
return result; // 回傳最終交替子序列
```

## 時間複雜度

- **貪心掃描迴圈**：遍歷陣列長度 $n$，每個元素僅做常數時間判斷和操作，因此時間複雜度為 $O(n)$。
- 總時間複雜度為 $O(n)$。

> $O(n)$

## 空間複雜度

- **額外儲存結果的陣列**：在最壞情況下可能儲存全部 $n$ 個元素，因此空間複雜度為 $O(n)$。
- 除此之外僅使用固定數量的變數，佔用常數空間。
- 總空間複雜度為 $O(n)$。

> $O(n)$
