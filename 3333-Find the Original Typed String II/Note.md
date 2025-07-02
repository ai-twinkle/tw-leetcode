# 3333. Find the Original Typed String II

Alice is attempting to type a specific string on her computer. 
However, she tends to be clumsy and may press a key for too long, resulting in a character being typed multiple times.

You are given a string `word`, which represents the final output displayed on Alice's screen. 
You are also given a positive integer `k`.

Return the total number of possible original strings that Alice might have intended to type, 
if she was trying to type a string of size at least `k`.

Since the answer may be very large, return it modulo `10^9 + 7`.

**Constraints:**

- `1 <= word.length <= 5 * 10^5`
- `word` consists only of lowercase English letters.
- `1 <= k <= 2000`

## 基礎思路

本題的核心策略在於分析 Alice 實際輸入時可能的行為模式。因為 Alice 有時會不小心長按鍵盤，因此一個原始字串經過輸入後，可能會導致相同的字元連續重複多次。
我們必須透過以下高階策略推導出原始字串的可能情況數：

- 將最終輸出的字串進行分段，將連續相同的字元視為一個獨立的「分段」。
- 每個分段的原始輸入方式，必然是該字元的連續輸入次數 $1$ 至目前長度之間任意一個數量。
- 將各分段的可能數量相乘，即得出原始輸入字串的總可能數。
- 最後需考慮原始輸入字串的最少長度限制 $k$，透過動態規劃計算出不足長度 $k$ 的無效情況並從總數扣除，便得到最終答案。

透過此策略，可以高效地計算所有符合題意的原始輸入字串總數。

## 解題步驟

### Step 1：處理特殊邊界情況並初始化參數

首先檢查邊界情況，若要求的最小長度 `k` 大於字串長度，則無有效情況：

```typescript
const MOD = 1_000_000_007;
const wordLength = word.length;

// 若最小長度 k 已大於字串長度，則無任何可能
if (k > wordLength) {
  return 0;
}
```

### Step 2：一次遍歷進行分段統計與計算基本組合數

接著透過單次遍歷，實現連續字元分段（Run-Length Encoding）並計算基本的可能組合數：

```typescript
// 初始化記錄每個分段的長度
const runLengths = new Uint16Array(wordLength);
let segmentCount = 0;
let totalWays = 1;
let currentRun = 1;

// 一次遍歷字串，計算每個分段的長度與基本可能數
for (let i = 1; i < wordLength; i++) {
  if (word.charCodeAt(i) === word.charCodeAt(i - 1)) {
    currentRun++;
  } else {
    runLengths[segmentCount] = currentRun;
    totalWays = (totalWays * currentRun) % MOD;
    segmentCount++;
    currentRun = 1;
  }
}
```

### Step 3：處理最後一個分段

在結束迴圈後，需補上最後一段的資料：

```typescript
// 處理最後一個分段的資料
runLengths[segmentCount] = currentRun;
totalWays = (totalWays * currentRun) % MOD;
segmentCount++;
```

### Step 4：檢查是否符合最少分段限制，快速返回結果

若目前的分段數已經足夠滿足最小字串長度 `k`，即可直接返回：

```typescript
// 若目前分段數已經滿足 k，表示所有組合均有效
if (segmentCount >= k) {
  return totalWays;
}
```

### Step 5：初始化 DP 參數以處理不足長度的情況

需要透過動態規劃，計算出分段數不足時（小於 `k`）的無效情況：

```typescript
// 計算最多少於 (k - 1 - segmentCount) 個額外重複
const maxOffset = k - 1 - segmentCount;

// 初始化 DP 陣列，用於計算無效情況數
let dpPrev = new Uint32Array(maxOffset + 1);
let dpCurr = new Uint32Array(maxOffset + 1);
dpPrev[0] = 1; // 起始情況只有一種
```

### Step 6：透過滑動窗口進行 DP 狀態轉移

使用滑動窗口技巧加速動態規劃，統計每個分段額外拆分後的情況：

```typescript
for (let seg = 0; seg < segmentCount; seg++) {
  const runLength = runLengths[seg];
  if (runLength === 1) {
    continue;
  }
  const windowSize = Math.min(runLength - 1, maxOffset);
  let windowSum = 0;
  for (let offset = 0; offset <= maxOffset; offset++) {
    windowSum = (windowSum + dpPrev[offset]) % MOD;
    if (offset > windowSize) {
      windowSum = (windowSum - dpPrev[offset - windowSize - 1] + MOD) % MOD;
    }
    dpCurr[offset] = windowSum;
  }
  // 交換 DP 陣列
  let temp = dpPrev;
  dpPrev = dpCurr;
  dpCurr = temp;
  // dpCurr 下一輪會被覆蓋，不須清零
}
```

### Step 7：計算並扣除所有不滿足最少長度的無效情況

最後，將所有無效的情況加總後從總數中扣除：

```typescript
// 累加所有不滿足最小分段要求的情況
let tooShortWays = 0;
for (let offset = 0; offset <= maxOffset; offset++) {
  tooShortWays = (tooShortWays + dpPrev[offset]) % MOD;
}

// 計算最終結果，需確保為非負數
let answer = totalWays - tooShortWays;
if (answer < 0) {
  answer += MOD;
}
```

### Step 8：返回最終結果

```typescript
return answer;
```

## 時間複雜度

- 字串分段與基本情況計算一次遍歷，耗時為 $O(n)$。
- 動態規劃過程需要 $O(n)$ 段，每段最多遍歷 $O(k)$ 個狀態，耗時為 $O(n \times k)$。
- 總時間複雜度為 $O(n \times k)$。

> $O(n \times k)$

## 空間複雜度

- 使用了長度為 $O(n)$ 的 `runLengths` 陣列記錄分段資料。
- 動態規劃部分使用固定大小的 DP 陣列佔用 $O(k)$ 空間。
- 總空間複雜度為 $O(n + k)$。

> $O(n + k)$
