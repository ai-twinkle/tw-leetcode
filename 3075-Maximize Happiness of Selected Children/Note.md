# 3075. Maximize Happiness of Selected Children

You are given an array happiness of length `n`, and a positive integer `k`.

There are `n` children standing in a queue, where the $i^{th}$ child has happiness value `happiness[i]`.
You want to select `k` children from these `n` children in `k` turns.

In each turn, when you select a child, the happiness value of all the children that have not been selected till now decreases by `1`.
Note that the happiness value cannot become negative and gets decremented only if it is positive.

Return the maximum sum of the happiness values of the selected children you can achieve by selecting `k` children.

**Constraints:**

- `1 <= n == happiness.length <= 2 * 10^5`
- `1 <= happiness[i] <= 10^8`
- `1 <= k <= n`

## 基礎思路

本題每一回合選一個小孩後，所有「尚未被選到」的小孩幸福值都會下降 1（且不會降到負數）。
目標是在進行 `k` 次選擇後，讓被選到的幸福值總和最大。

在思考解法時，有幾個關鍵觀察：

* **越早選到的孩子，受到的扣減越少**：第 0 回合選到的人不會被扣，第一回合選到的人等效被扣 1，第二回合等效被扣 2，以此類推。
* **最優策略是優先選原始幸福值最大的孩子**：因為每一回合的扣減是由回合數決定（與選誰無關），要最大化總和，就應該把扣減套用在原始值最大的元素上，避免把回合浪費在原始值較小、扣完後可能變成 0 的人。
* **當某回合的等效幸福值已經 ≤ 0**，後面回合只會扣得更多，因此不可能再產生正貢獻，可以直接停止。

因此策略是：先把幸福值排序，從最大開始挑 `k` 個，對第 `t` 回合挑到的值計入 `max(h - t, 0)`，並在出現非正值時提前結束。

## 解題步驟

### Step 1：初始化基本變數

先取得孩子總數與要選的人數，並準備累加的答案變數。

```typescript
const childCount = happiness.length;
const selectionCount = k;

let happinessSum = 0;
```

### Step 2：排序幸福值以便從最大開始挑選

將輸入轉成 TypedArray 並進行升序排序，之後可從尾端開始取最大值。

```typescript
// 使用 TypedArray 以利用原生數值排序（升序）
const happinessValues = new Int32Array(happiness);
happinessValues.sort();
```

### Step 3：主迴圈骨架 — 進行 k 回合選擇

每回合都從排序後的尾端取一個尚未使用的最大值，並計算該回合的等效幸福值。

```typescript
for (let turnIndex = 0; turnIndex < selectionCount; turnIndex++) {
  const selectedIndex = childCount - 1 - turnIndex;
  const effectiveHappiness = happinessValues[selectedIndex] - turnIndex;

  // ...
}
```

### Step 4：若等效幸福值已無正貢獻則提前停止

若 `effectiveHappiness <= 0`，代表本回合開始就沒有正收益；後面回合只會更小，因此可直接結束迴圈。

```typescript
for (let turnIndex = 0; turnIndex < selectionCount; turnIndex++) {
  // Step 3：主迴圈骨架 — 進行 k 回合選擇

  if (effectiveHappiness <= 0) {
    break;
  }

  // ...
}
```

### Step 5：累加本回合的幸福值

在確認仍為正值後，將本回合的等效幸福值加到答案中。

```typescript
for (let turnIndex = 0; turnIndex < selectionCount; turnIndex++) {
  // Step 3：主迴圈骨架 — 進行 k 回合選擇

  // Step 4：若等效幸福值已無正貢獻則提前停止

  happinessSum += effectiveHappiness;
}
```

### Step 6：回傳最大總幸福值

迴圈結束後回傳累加結果。

```typescript
return happinessSum;
```

## 時間複雜度

- 排序 `happinessValues.sort()`：時間複雜度為 $O(n \log n)$。
- 主迴圈最多跑 `k` 次：時間複雜度為 $O(k)$。
- 總時間複雜度為 $O(n \log n + k)$。

> $O(n \log n + k)$

## 空間複雜度

- `happinessValues` 會複製輸入成一個 `Int32Array`，額外空間為 $O(n)$。
- 其餘變數為常數空間。
- 總空間複雜度為 $O(n)$。

> $O(n)$
