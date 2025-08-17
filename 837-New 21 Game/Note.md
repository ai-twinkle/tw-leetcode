# 837. New 21 Game

Alice plays the following game, loosely based on the card game "21".

Alice starts with `0` points and draws numbers while she has less than `k` points. 
During each draw, she gains an integer number of points randomly from the range `[1, maxPts]`, where `maxPts` is an integer. 
Each draw is independent and the outcomes have equal probabilities.

Alice stops drawing numbers when she gets `k` or more points.

Return the probability that Alice has `n` or fewer points.

Answers within `10^-5` of the actual answer are considered accepted.

**Constraints:**

- `0 <= k <= n <= 10^4`
- `1 <= maxPts <= 10^4`

## 基礎思路

本題是經典的機率型動態規劃問題。Alice 持續抽牌直到分數 $\geq k$ 為止，每次可抽 $[1,,\text{maxPts}]$ 任一分數且機率均等。最終問「停止時分數 $\leq n$ 的機率」。

我們的核心策略如下：

- **狀態設計**：定義 $dp[i]$ 表示最終結束時分數恰好為 $i$ 的機率。
- **轉移邏輯**：只有在 $i < k$ 時可以繼續抽牌，$i \geq k$ 則遊戲結束。
- **機率累積**：$dp[i]$ 來自所有前一輪可能剛好抽到 $i-j$ 分（其中 $1 \leq j \leq \text{maxPts}$，且 $i-j < k$）的狀態，平均分配機率。
- **答案合併**：所有 $k \leq i \leq n$ 的 $dp[i]$ 機率總和即為所求。

此外，為了避免重複計算，我們使用「滑動視窗和」優化動態規劃，每次只需 $O(1)$ 即可取得區間和。

## 解題步驟

### Step 1：建立可重用的機率緩衝區

首先，設計一個全域的 `Float64Array`，用於多次查詢時減少記憶體配置成本。當長度不足時才重新擴展。

```typescript
// 可重複利用的全域緩衝區，避免重複配置與回收。
// 每次若長度不夠才擴充，確保效能穩定。
let SHARED_PROBABILITY_BUFFER: Float64Array | null = null;

function acquireProbabilityBuffer(requiredLength: number): Float64Array {
  if (SHARED_PROBABILITY_BUFFER === null || SHARED_PROBABILITY_BUFFER.length < requiredLength) {
    SHARED_PROBABILITY_BUFFER = new Float64Array(requiredLength);
  }
  return SHARED_PROBABILITY_BUFFER;
}
```

### Step 2：入口與特殊情況的提前返回

進入主邏輯前，先判斷是否可直接得到答案：

- 若 $k = 0$，代表 Alice 不會抽牌，分數永遠為 0，顯然 $\leq n$ 的機率為 1。
- 若 $n$ 已經大於「最大可能停牌分數」（即 $k-1+\text{maxPts}$），就算運氣最差也不會超過 $n$，答案同樣為 1。

```typescript
// 若 Alice 不需抽牌，或最大分數也不超過 n，機率為 1
const upperBoundCertain = k - 1 + maxPts;
if (k === 0 || n >= upperBoundCertain) {
  return 1.0;
}
```

### Step 3：初始化 DP 陣列與輔助變數

- 使用 `acquireProbabilityBuffer(n + 1)` 建立長度 $n+1$ 的 DP 陣列並清零。
- 設定 $dp[0]=1$，表示初始分數為 0 的機率為 1。
- `probabilityWindowSum` 記錄滑動視窗區間和（能轉移到下一分數的所有 $dp$ 累加值）。
- `inverseMaxPoints` 預算好 $1/\text{maxPts}$，避免每次都做除法。
- `result` 用來儲存所有合法停牌分數的機率總和。

```typescript
// dp[i] 表示最終分數為 i 的機率，僅需滑動視窗和。
const probabilityArray = acquireProbabilityBuffer(n + 1);
probabilityArray.fill(0, 0, n + 1);

probabilityArray[0] = 1.0;

let probabilityWindowSum = 1.0;        // 當前視窗內的機率和
const inverseMaxPoints = 1.0 / maxPts; // 事先計算避免重複運算
let result = 0.0;                      // 最終答案累加器
```

### Step 4：主迴圈計算所有可能分數的機率

從 $1$ 遍歷到 $n$，每個分數 $i$ 的機率由前一輪滑動視窗和決定，並依據 $k$ 決定要累加到答案或繼續影響下一輪。

```typescript
for (let points = 1; points <= n; points++) {
  // 由可轉移來源區間的機率和，等分配到 maxPts 個可能分數
  const probabilityAtPoints = probabilityWindowSum * inverseMaxPoints;
  probabilityArray[points] = probabilityAtPoints;

  // 若尚未達到 k 分，會繼續累加到未來分數的機率和
  if (points < k) {
    probabilityWindowSum += probabilityAtPoints;
  } else {
    // 已達停牌門檻，直接累加到最終結果
    result += probabilityAtPoints;
  }

  // 滑動視窗左移，移除超出 maxPts 範圍的 dp
  const expiredIndex = points - maxPts;
  if (expiredIndex >= 0) {
    probabilityWindowSum -= probabilityArray[expiredIndex];
  }
}
```

### Step 5：回傳累計的最終答案

回傳 $k \leq i \leq n$ 之間所有可能停牌分數的總機率。

```typescript
return result;
```

## 時間複雜度

- **初始化與主迴圈**：主要為填 $dp$ 陣列，從 $1$ 到 $n$，每輪所有操作皆為常數時間。
- 總時間複雜度為 $O(n)$。

> $O(n)$

## 空間複雜度

- **DP 陣列**：需長度 $n+1$ 的 `Float64Array` 暫存所有可能分數的機率。
- 其他僅常數級變數。
- 總空間複雜度為 $O(n)$。

> $O(n)$
