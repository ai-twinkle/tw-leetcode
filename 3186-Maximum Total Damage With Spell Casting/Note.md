# 3186. Maximum Total Damage With Spell Casting

A magician has various spells.

You are given an array `power`, where each element represents the damage of a spell. 
Multiple spells can have the same damage value.

It is a known fact that if a magician decides to cast a spell with a damage of `power[i]`, 
they cannot cast any spell with a damage of `power[i] - 2`, `power[i] - 1`, `power[i] + 1`, or `power[i] + 2`.

Each spell can be cast only once.

Return the maximum possible total damage that a magician can cast.

**Constraints:**

- `1 <= power.length <= 10^5`
- `1 <= power[i] <= 10^9`

## 基礎思路

本題要找出魔法師在一系列法術傷害值中，**能夠達到的最大總傷害**，但存在一項限制條件：

- 若施放了某個法術傷害值為 `x`，則不能再施放任何傷害為 `x - 2`、`x - 1`、`x + 1`、`x + 2` 的法術。

換言之，任意兩個被選取的傷害值，其差距必須 **至少為 3**。

在思考解法時，我們需要注意幾個重點：

1. **重複傷害值的處理**：可能有多個法術傷害相同，若選擇該傷害值，就能一次獲得其總貢獻（同值加總）。
2. **相鄰限制的影響**：選擇某個傷害值會排除相鄰 ±1、±2 的值，因此這是一個「非連續取數的最優化問題」。
3. **最適子結構**：若已知在前若干個傷害值下的最大總傷害，就能推導當前值是否取用的最佳決策。
4. **排序與壓縮**：由於傷害值最大可達 $10^9$，無法直接用陣列 DP，必須先排序並壓縮相同數值。

為了解決這個問題，我們可以採用以下策略：

- **排序與群組化**：先將所有傷害值排序，並將相同值的總和壓縮為單一節點。
- **動態規劃（Dynamic Programming）**：逐一考慮每個唯一傷害值，決定「取」或「不取」該傷害組。
- **前向相容檢查**：為避免與相鄰 ±1、±2 衝突，對於當前傷害值，找出最後一個可搭配的前值（差距 ≥ 3）。
- **轉移方程**：
  若 `dp[i]` 表示前 `i` 個唯一傷害值的最大總傷害：

  $$
  dp[i] = \max(dp[i-1], dp[j] + total[i])
  $$

  其中 `j` 為最後一個滿足 `values[i] - values[j] ≥ 3` 的索引。

透過這種設計，我們可以在線性時間內遍歷所有唯一傷害值，找到整體最大總傷害。

## 解題步驟

### Step 1：處理空陣列情況

若法術清單為空，則無法造成任何傷害，直接回傳 0。

```typescript
// 若無任何法術，直接回傳 0
if (power.length === 0) {
  return 0;
}
```

### Step 2：排序法術傷害值

為了方便後續分組與 DP，先將所有法術傷害值排序。

```typescript
// 建立 Int32Array 並進行排序
const sortedPower = new Int32Array(power.length);
for (let index = 0; index < power.length; index += 1) {
  sortedPower[index] = power[index];
}
sortedPower.sort();
```

### Step 3：壓縮重複傷害值

將相同的傷害值合併為一筆資料，並計算其總貢獻（同值相加）。

```typescript
// 壓縮相同傷害值，建立唯一值與其總傷害
const values = new Int32Array(power.length);
const weights = new Float64Array(power.length);
let uniqueCount = 0;
let index = 0;

while (index < sortedPower.length) {
  const currentValue = sortedPower[index];
  let totalDamage = 0;

  // 累計相同傷害值的總貢獻
  while (index < sortedPower.length && sortedPower[index] === currentValue) {
    totalDamage += currentValue;
    index += 1;
  }

  values[uniqueCount] = currentValue;
  weights[uniqueCount] = totalDamage;
  uniqueCount += 1;
}
```

### Step 4：建立唯一值與總傷害子陣列

只保留前 `uniqueCount` 筆有效資料，以減少不必要的運算。

```typescript
// 擷取唯一有效的傷害值與其總傷害
const uniqueValues = values.subarray(0, uniqueCount);
const totalWeights = weights.subarray(0, uniqueCount);
```

### Step 5：初始化動態規劃陣列

建立 `dp` 陣列，其中 `dp[i]` 表示考慮到第 `i` 個唯一傷害值時的最大總傷害。

```typescript
// 初始化 DP 陣列
const dp = new Float64Array(uniqueCount);
dp[0] = totalWeights[0];

// 指標：紀錄最後一個與當前值相容的索引（差距 ≥ 3）
let lastCompatibleIndex = -1;
```

### Step 6：主動態規劃迴圈

逐一考慮每個唯一傷害值，透過指標尋找最後一個可搭配的值（差距 ≥ 3），並選擇「取或不取」的最佳結果。

```typescript
for (let i = 1; i < uniqueCount; i += 1) {
  // 移動指標以找到最後一個相容值
  const requiredMaxValue = uniqueValues[i] - 3;
  while (
    lastCompatibleIndex + 1 < i &&
    uniqueValues[lastCompatibleIndex + 1] <= requiredMaxValue
  ) {
    lastCompatibleIndex += 1;
  }

  // 選項一：不取當前傷害值
  const skipCurrent = dp[i - 1];

  // 選項二：取當前傷害值，並加上相容前值的最佳結果
  let takeCurrent = totalWeights[i];
  if (lastCompatibleIndex >= 0) {
    takeCurrent += dp[lastCompatibleIndex];
  }

  // 取兩者中的最大值
  dp[i] = skipCurrent >= takeCurrent ? skipCurrent : takeCurrent;
}
```

### Step 7：回傳最終結果

DP 陣列最後一項即為全體法術的最大總傷害。

```typescript
// 回傳最大總傷害
return dp[uniqueCount - 1];
```

## 時間複雜度

- 排序階段：$O(n \log n)$。
- 壓縮階段：$O(n)$。
- 動態規劃階段：每個元素只被指標掃描一次，為 $O(n)$。
- 總時間複雜度為 $O(n \log n)$。

> $O(n \log n)$

## 空間複雜度

- 儲存排序與壓縮後的陣列需 $O(n)$。
- 動態規劃陣列 `dp` 與中間結構亦為 $O(n)$。
- 總空間複雜度為 $O(n)$。

> $O(n)$
