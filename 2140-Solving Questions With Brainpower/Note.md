# 2140. Solving Questions With Brainpower

You are given a 0-indexed 2D integer array `questions` where $\text{questions}[i] = [\text{points}_i, \text{brainpower}_i]$.

The array describes the questions of an exam, where you have to process the questions in order (i.e., starting from question `0`) 
and make a decision whether to solve or skip each question. 
Solving question `i` will earn you $\text{points}_i$ points but 
you will be unable to solve each of the next $\text{brainpower}_i$ questions. 
If you skip question i, you get to make the decision on the next question.

- For example, given `questions = [[3, 2], [4, 3], [4, 4], [2, 5]]`:
  - If question `0` is solved, you will earn `3` points but you will be unable to solve questions `1` and `2`.
  - If instead, question `0` is skipped and question `1` is solved, you will earn `4` points but you will be unable to solve questions `2` and `3`.

Return the maximum points you can earn for the exam.

## 基礎思路

題目要求在考試中取得最高分，考試由一系列題目組成，每題都有分數與「腦力消耗」。

- 若選擇解題，第 i 題會獲得 `questions[i][0]` 分，但接下來的 `questions[i][1]` 題將無法作答；
- 若選擇跳過，則直接進入下一題。

此問題適合用動態規劃來求解，我們定義 `dp[i]` 表示從第 `i` 題開始能取得的最高分。

對於每一題，我們有兩種選擇：
1. **跳過該題**：此時最高分為 `dp[i+1]`。
2. **解該題**：此時可獲得的分數為 `questions[i][0]` 加上跳過後（即第 `i + questions[i][1] + 1` 題）的 dp 值。

因此，我們可以寫出遞推關係：
> dp[i] = max(dp[i+1], questions[i][0] + dp[min(i + questions[i][1] + 1, n)])

## 解題步驟

### Step 1：初始化與資料結構

首先，我們獲取題目的數量 n，並初始化一個長度為 `n+1` 的 `dp` 陣列。
由於可能涉及到較大的數值，我們使用 Float64Array 並初始化為 0，這樣當超出題目範圍時，分數預設為 0。

```typescript
const n = questions.length;
// 使用 Float64Array 處理可能的較大數值
const dp = new Float64Array(n + 1).fill(0);
```

### Step 2：反向動態規劃求解

我們從最後一題開始，逆向計算 dp 陣列。對於每一題 i：
- **計算下一題索引**  
  若解題，必須跳過接下來 `questions[i][1]` 題，所以下一題索引為：

  ```typescript
  const nextIndex = i + questions[i][1] + 1;
  ```

- **狀態轉移**  
  對於題目 i，有兩個選擇：
  - 跳過：得分為 dp[i+1]。
  - 解題：得分為 `questions[i][0]` 加上在跳過後能作答的 dp 值，即 `dp[Math.min(nextIndex, n)]`，此處用 Math.min 確保索引不超界。

  取兩者中較大的值即為 dp[i]：

  ```typescript
  dp[i] = Math.max(dp[i + 1], questions[i][0] + dp[Math.min(nextIndex, n)]);
  ```

完整的反向迴圈如下：

```typescript
for (let i = n - 1; i >= 0; i--) {
  // 計算跳過 brainpower 題後的下一題索引
  const nextIndex = i + questions[i][1] + 1;
  // 選擇跳過該題或解該題所能獲得的最大分數
  dp[i] = Math.max(dp[i + 1], questions[i][0] + dp[Math.min(nextIndex, n)]);
}
```

### Step 3：返回最終結果

最終結果保存在 dp[0]，代表從第一題開始所能取得的最高分。

```typescript
return dp[0];
```

## 時間複雜度

- **動態規劃迴圈**：遍歷 n 個題目，每次計算均為常數時間操作，因此時間複雜度為 $O(n)$。
- 總空間複雜度為 $O(n)$。

> $O(n)$

## 空間複雜度

- **dp 陣列**：需要額外儲存長度為 `n+1` 的陣列，空間複雜度為 $O(n)$。
- 其他變數僅佔用常數空間。
- 總空間複雜度為 $O(n)$。

> $O(n)$
