# 2147. Number of Ways to Divide a Long Corridor

Along a long library corridor, there is a line of seats and decorative plants. 
You are given a 0-indexed string `corridor` of length `n` consisting of letters `'S'` and `'P'` 
where each `'S'` represents a seat and each `'P'` represents a plant.

One room divider has already been installed to the left of index `0`, and another to the right of index `n - 1`. 
Additional room dividers can be installed. 
For each position between indices `i - 1` and `i` (`1 <= i <= n - 1`), at most one divider can be installed.

Divide the corridor into non-overlapping sections, where each section has exactly two seats with any number of plants. There may be multiple ways to perform the division. Two ways are different if there is a position with a room divider installed in the first way but not in the second way.

Return the number of ways to divide the corridor. 
Since the answer may be very large, return it modulo `10^9 + 7`. 
If there is no way, return `0`.

**Constraints:**

- `n == corridor.length`
- `1 <= n <= 10^5`
- `corridor[i]` is either `'S'` or `'P'`.

## 基礎思路

本題要將走廊切分成多個不重疊區段，且**每個區段必須恰好包含兩張座位**，植物數量不限。
由於分隔板只能放在相鄰位置之間，因此每種切分方式可視為在若干「間隔」上選擇是否放置分隔板。

核心觀察如下：

* **可行性只取決於座位數量**：
  每段需要 2 張座位，因此總座位數必須為正且為偶數；否則無法切分。

* **分隔點只會出現在「兩段之間」的植物間隙**：
  以座位為基準，每兩張座位形成一段；相鄰兩段之間，會出現一段只由植物構成的間隙。
  分隔板必須放在這段間隙中的某個位置，才能把前一段與下一段切開。

* **每個植物間隙提供獨立的選擇數**：
  若兩段之間共有 `x` 株植物，則可放置分隔板的位置共有 `x + 1` 種（包含放在間隙最左側或最右側）。
  不同間隙之間的選擇彼此獨立，因此總方案數為各間隙選擇數的乘積。

* **單次掃描即可完成計數**：
  依序掃描字串，追蹤目前已遇到的座位數與目前「兩段之間」累積的植物數。
  每當確認開始進入下一段（遇到下一段的第一張座位）時，就把上一個植物間隙的選擇數乘入答案。

依此策略可在線性時間內完成計算，並在過程中以模數維持結果大小。

## 解題步驟

### Step 1：初始化模數與必要狀態變數

設定模數，並初始化座位數計數器、段與段之間的植物數累計器，以及答案累積值。

```typescript
const modulo: number = 1000000007;

let seatCount = 0;
let plantsBetweenPairs = 0;
let ways = 1;
```

### Step 2：單次掃描走廊並根據座位配對更新答案

以單一迴圈掃描字串。遇到座位時更新座位數；當開始新的一段時，將上一段植物間隙的可選分隔板數量乘入答案並清空累計。遇到植物時，僅在「已完成一段兩座位」且尚未開始下一段的期間累計植物數。

```typescript
for (let index = 0, length = corridor.length; index < length; index++) {
  const characterCode = corridor.charCodeAt(index);

  if (characterCode === 83) { // 'S'
    seatCount++;

    if (seatCount === 1) {
      continue;
    }

    // 當開始新的座位對（座位數為奇數）時，結算上一段植物間隙的分隔板選擇數
    if ((seatCount & 1) === 1) {
      ways = (ways * (plantsBetweenPairs + 1)) % modulo;
      plantsBetweenPairs = 0;
    }
  } else { // 'P'
    if (seatCount > 0 && (seatCount & 1) === 0) {
      plantsBetweenPairs++;
    }
  }
}
```

### Step 3：檢查座位總數是否可形成有效切分

掃描完成後，若完全沒有座位，或座位總數為奇數，代表無法分成每段兩座位，直接回傳 0。

```typescript
if (seatCount === 0) {
  return 0;
}
if ((seatCount & 1) === 1) {
  return 0;
}
```

### Step 4：回傳累計的切分方案數

若通過可行性檢查，回傳掃描過程中累積出的答案。

```typescript
return ways;
```

## 時間複雜度

- 僅對字串進行一次線性掃描。
- 每個位置只進行常數次判斷與更新。
- 總時間複雜度為 $O(n)$。

> $O(n)$

## 空間複雜度

- 只使用固定數量的變數記錄狀態與答案。
- 不需額外陣列或動態結構。
- 總空間複雜度為 $O(1)$。

> $O(1)$
