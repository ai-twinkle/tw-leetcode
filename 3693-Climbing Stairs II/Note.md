# 3693. Climbing Stairs II

You are climbing a staircase with `n + 1` steps, numbered from `0` to `n`.

You are also given a 1-indexed integer array `costs` of length `n`, 
where `costs[i]` is the cost of step `i`.

From step `i`, you can jump only to step `i + 1`, `i + 2`, or `i + 3`. 
The cost of jumping from step `i` to step `j` is defined as: `costs[j] + (j - i)^2`

You start from step 0 with `cost = 0`.

Return the minimum total cost to reach step `n`.

**Constraints:**

- `1 <= n == costs.length <= 10^5`
- `1 <= costs[i] <= 10^4`

## 基礎思路

本題要求從第 0 階出發，每次可向上跳 1、2 或 3 階，每次跳躍的代價為落點階梯的成本加上跳躍距離的平方，求抵達第 `n` 階的最小總成本。

在思考解法時，可掌握以下核心觀察：

- **最優子結構明確**：
  抵達某一階的最小成本，只取決於抵達其前 1、2、3 階的最小成本，再加上對應的跳躍懲罰與該階的落點成本，因此適合以動態規劃求解。

- **跳躍懲罰固定且遞增**：
  距離 1、2、3 的懲罰分別為 1、4、9，與位置無關，可視為常數直接套用。

- **狀態依賴範圍僅限最近三階**：
  每一階的計算只需參考前三階的結果，更早的狀態不再被使用，因此不必保存整個成本表。

- **起點之前的虛擬階梯不影響答案**：
  若將起點之前不存在的階梯成本也視為 0，從這些虛擬位置跳躍的懲罰必定大於從起點直接跳躍，因此永遠不會被選為最佳來源。
  這樣可以省去邊界判斷，同時讓數值維持為整數。

依據以上特性，可以採用以下策略：

- **以滾動視窗維護最近三階的最小成本**，用常數空間取代完整的動態規劃陣列。
- **對每一階比較三種跳躍來源，取代價最小者**，再加上該階的落點成本。
- **每處理完一階就將視窗向前推移**，最後視窗中最新的值即為抵達終點的最小成本。

此策略只需一次線性掃描與常數額外空間，即可求得最優解。

## 解題步驟

### Step 1：初始化最近三階的成本滾動視窗

以三個變數分別記錄前三階、前兩階與前一階的最小成本，初始皆設為 0。起點之前的虛擬階梯也設為 0 是安全的，因為從這些位置跳躍的代價必定高於從第 0 階直接跳躍，而且這樣能讓數值維持在 V8 的快速整數形式。

```typescript
// 以 0 作為起始值是安全的：位於第 0 階之前的虛擬階梯，其跳躍成本必定高於從第 0 階起跳，且能讓數值維持在 V8 的快速整數形式
let costThreeBack = 0;
let costTwoBack = 0;
let costOneBack = 0;
```

### Step 2：對每一階比較三種跳躍來源，取最小代價

逐一處理每一階。距離 1、2、3 的跳躍懲罰分別為 1、4、9，將其加到前一、前二、前三階的成本上，比較後取最小者作為抵達此階前的最佳累積成本。

```typescript
for (let index = 0; index < n; index++) {
  // 跳躍距離 1、2、3 的懲罰分別為 1、4、9
  let bestPrevious = costOneBack + 1;
  const viaTwo = costTwoBack + 4;
  if (viaTwo < bestPrevious) {
    bestPrevious = viaTwo;
  }
  const viaThree = costThreeBack + 9;
  if (viaThree < bestPrevious) {
    bestPrevious = viaThree;
  }

  // ...
}
```

### Step 3：推移視窗並加上當前階梯的落點成本

求得最佳來源後，將視窗整體向前推移一格，並把當前階梯的落點成本加到最佳累積成本上，作為新的「前一階」成本。陣列索引 `index` 對應第 `index + 1` 階。

```typescript
for (let index = 0; index < n; index++) {
  // Step 2：比較三種跳躍來源並取最小代價

  // 將視窗向前推移，並加上此階梯的落點成本
  costThreeBack = costTwoBack;
  costTwoBack = costOneBack;
  costOneBack = bestPrevious + costs[index];
}
```

### Step 4：回傳抵達終點的最小成本

所有階梯處理完畢後，視窗中最新的值即為抵達第 `n` 階的最小總成本，直接回傳。

```typescript
return costOneBack;
```

## 時間複雜度

- 共處理 `n` 階，每階只進行固定次數的比較與加法。
- 所有操作皆為常數時間。
- 總時間複雜度為 $O(n)$。

> $O(n)$

## 空間複雜度

- 僅使用三個滾動變數與少量暫存變數。
- 不需要額外的動態規劃陣列。
- 總空間複雜度為 $O(1)$。

> $O(1)$
