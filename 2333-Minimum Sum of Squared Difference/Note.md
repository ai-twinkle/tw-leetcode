# 2333. Minimum Sum of Squared Difference

You are given two positive 0-indexed integer arrays `nums1` and `nums2`, both of length `n`.

The sum of squared difference of arrays `nums1` and `nums2` is defined as 
the sum of `(nums1[i] - nums2[i])^2` for each `0 <= i < n`.

You are also given two positive integers `k1` and `k2`. 
You can modify any of the elements of `nums1` by `+1` or `-1` at most `k1` times. 
Similarly, you can modify any of the elements of `nums2` by `+1` or `-1` at most `k2` times.

Return the minimum sum of squared difference after modifying array `nums1` at most `k1` times and 
modifying array `nums2` at most `k2` times.

Note: You are allowed to modify the array elements to become negative integers.

**Constraints:**

- `n == nums1.length == nums2.length`
- `1 <= n <= 10^5`
- `0 <= nums1[i], nums2[i] <= 10^5`
- `0 <= k1, k2 <= 10^9`

## 基礎思路

本題要求在兩個陣列上進行有限次數的 ±1 修改，使兩陣列對應位置差的平方和最小。
由於修改次數上限可達 `10^9`，且陣列長度可達 `10^5`，不可能逐次模擬每一次修改，需要從差值的整體分佈著手。

在思考解法時，可掌握以下核心觀察：

- **兩個陣列的修改本質相同**：
  不論修改哪一個陣列，效果都只是讓該位置的差值絕對值增加或減少 1。因此兩份修改次數可以合併為一份總預算，問題轉化為：在總預算內，將一組非負差值逐一減 1，使平方和最小。

- **平方函數的凸性決定了貪心方向**：
  將差值 `d` 減 1 所帶來的平方和下降量為 `2d - 1`，差值越大，下降量越大。因此每一單位預算都應該花在當前最大的差值上，最終結果會是把所有大差值「削平」到某個共同高度。

- **預算足夠時可直接歸零**：
  若總預算不少於所有差值的總和，即可將每個差值都削為 0，答案直接為 0。

- **削平成本隨門檻下降單調遞增**：
  將所有高於某門檻的差值壓到該門檻，所需成本會隨門檻降低而單調增加。因此可以由最大差值開始向下掃描，找到預算仍能負擔的最低門檻；一旦成本超過預算即可停止。

- **差值值域有限，可用計數取代排序**：
  差值不超過 `10^5`，以計數方式統計每個差值的出現次數，即可在線性時間內按大小處理，不需比較式排序。

依據以上特性，可以採用以下策略：

- **合併兩份預算，並在單次掃描中取得所有差值的絕對值、總和、平方和與最大值**。
- **若預算足以消除全部差值，直接回傳 0**。
- **以計數表統計差值分佈，並由大到小移動門檻，同時累計門檻以上元素的數量、總和與平方和**，求出預算可負擔的最低削平門檻。
- **把剩餘預算分配給位於門檻的元素，每單位使一個元素再降 1**，最後組合出最小平方和。

此策略避免了逐次模擬，只需對差值值域掃描一次即可求出最佳分配。

## 解題步驟

### Step 1：取得陣列長度並合併兩份修改預算

對任一陣列進行 ±1 修改，效果都只是改變對應位置的差值，因此兩份修改次數可以直接合併為一份總預算。

```typescript
const length = nums1.length;
// 對任一陣列的操作都只會改變兩者的差值，因此兩份預算可合併使用。
const budget = k1 + k2;
```

### Step 2：初始化差值陣列與統計變數

準備一個陣列儲存每個位置差值的絕對值，並初始化最大差值、差值總和與平方和三個累積量。

```typescript
const absoluteDifferences = new Int32Array(length);
let maximumDifference = 0;
let totalAbsoluteSum = 0;
let totalSquareSum = 0;
```

### Step 3：單次掃描計算差值並收集統計資訊

逐一計算每個位置的差值並取絕對值，存入差值陣列，同時累加總和與平方和，並更新最大差值，供後續剪枝與計數排序使用。

```typescript
// 單次掃描同時收集差值、差值總和、平方和以及最大範圍。
for (let index = 0; index < length; index++) {
  let difference = nums1[index] - nums2[index];

  if (difference < 0) {
    difference = -difference;
  }

  absoluteDifferences[index] = difference;
  totalAbsoluteSum += difference;
  totalSquareSum += difference * difference;

  if (difference > maximumDifference) {
    maximumDifference = difference;
  }
}
```

### Step 4：預算足以消除所有差值時直接回傳 0

若總預算不少於所有差值的總和，即可把每個差值都削為 0，最小平方和為 0。

```typescript
// 預算足以消除所有差值，平方和直接降為零。
if (totalAbsoluteSum <= budget) {
  return 0;
}
```

### Step 5：以計數排序統計差值分佈

差值範圍有限，因此建立大小為最大差值加一的計數表，統計每個差值出現的次數，取代比較式排序。

```typescript
// 在差值範圍上使用計數排序，取代任何比較式排序。
const counts = new Int32Array(maximumDifference + 1);

for (let index = 0; index < length; index++) {
  counts[absoluteDifferences[index]]++;
}
```

### Step 6：初始化門檻掃描所需的累積量與結果狀態

第一組變數在向下掃描時，持續累計「高於目前值」的元素數量、總和與平方和。第二組變數記錄目前預算可負擔的最佳門檻，以及該門檻下的成本、門檻以上的元素數量與平方和。初始門檻設為最大差值，此時不需任何成本。

```typescript
let runningCountAbove = 0;
let runningSumAbove = 0;
let runningSquareSumAbove = 0;

let threshold = maximumDifference;
let costAtThreshold = 0;
let countAboveThreshold = 0;
let squareSumAboveThreshold = 0;
```

### Step 7：由上往下移動門檻並累計高於門檻的元素

門檻從最大差值減一開始向下掃描。每往下移一格，原本等於 `value + 1` 的元素就變成「高於門檻」，因此把該桶的數量、總和與平方和併入累積量。

```typescript
// 由上往下移動門檻可使削平成本單調遞增，
// 因此第一個超出預算的值即可立刻結束掃描。
for (let value = maximumDifference - 1; value >= 1; value--) {
  const bucket = counts[value + 1];

  if (bucket !== 0) {
    const higherValue = value + 1;

    runningCountAbove += bucket;
    runningSumAbove += higherValue * bucket;
    runningSquareSumAbove += higherValue * higherValue * bucket;
  }

  // ...
}
```

### Step 8：計算削平成本並在超出預算時停止

把所有高於 `value` 的差值壓到 `value` 的成本，等於這些差值的總和減去 `value` 乘上其數量。成本超過預算時代表此門檻無法達成，因成本單調遞增，可直接結束掃描。否則記錄此門檻及其對應的成本、數量與平方和。

```typescript
for (let value = maximumDifference - 1; value >= 1; value--) {
  // Step 7：累計高於門檻的元素數量、總和與平方和

  // 將所有大於 `value` 的差值壓低至 `value` 所需的成本。
  const cost = runningSumAbove - value * runningCountAbove;

  if (cost > budget) {
    break;
  }

  threshold = value;
  costAtThreshold = cost;
  countAboveThreshold = runningCountAbove;
  squareSumAboveThreshold = runningSquareSumAbove;
}
```

### Step 9：計算剩餘預算與低於門檻部分的平方和

削平到門檻後，剩餘的預算不足以讓所有位於門檻的元素再降一格，但每一單位仍可讓其中一個元素由 `threshold` 降至 `threshold - 1`。

此時位於門檻的元素包含原本高於門檻（已被削平）的元素，以及原本就等於門檻的元素。低於門檻的元素不受影響，其平方和等於總平方和扣掉門檻以上與恰為門檻的平方和。

```typescript
// 剩餘的每一單位預算，可再將一個元素由 `threshold` 降至 `threshold - 1`。
const leftoverBudget = budget - costAtThreshold;
const countAtThreshold = countAboveThreshold + counts[threshold];
const squaresBelowThreshold =
  totalSquareSum -
  squareSumAboveThreshold -
  counts[threshold] * threshold * threshold;
const loweredValue = threshold - 1;
```

### Step 10：組合三部分平方和並回傳結果

最終平方和由三部分組成：

- 低於門檻、未被修改的元素平方和；
- 仍停留在門檻的元素平方和；
- 被剩餘預算再降一格的元素平方和。

```typescript
return (
  squaresBelowThreshold +
  (countAtThreshold - leftoverBudget) * threshold * threshold +
  leftoverBudget * loweredValue * loweredValue
);
```

## 時間複雜度

- 計算差值與統計資訊需一次線性掃描，為 $O(n)$；
- 建立計數表需掃描所有差值，為 $O(n)$；
- 門檻掃描最多走過整個差值值域，為 $O(m)$，其中 $m$ 為最大差值；
- 最終組合結果為常數時間。
- 總時間複雜度為 $O(n + m)$。

> $O(n + m)$

## 空間複雜度

- 差值陣列需 $O(n)$ 空間；
- 計數表大小為最大差值加一，需 $O(m)$ 空間；
- 其餘僅使用固定數量的變數。
- 總空間複雜度為 $O(n + m)$。

> $O(n + m)$
