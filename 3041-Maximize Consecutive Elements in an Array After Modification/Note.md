# 3041. Maximize Consecutive Elements in an Array After Modification

You are given a 0-indexed array `nums` consisting of positive integers.

Initially, you can increase the value of any element in the array by at most `1`.

After that, you need to select one or more elements from the final array such 
that those elements are consecutive when sorted in increasing order. 
For example, the elements `[3, 4, 5]` are consecutive while `[3, 4, 6]` and `[1, 1, 2, 3]` are not.

Return the maximum number of elements that you can select.

**Constraints:**

- `1 <= nums.length <= 10^5`
- `1 <= nums[i] <= 10^6`

## 基礎思路

本題允許每個元素「維持原值」或「增加 1」，之後要選出一組排序後彼此連續（每個值恰好出現一次、相鄰差為 1）的元素，並使數量最多。
由於陣列長度可達 $10^5$、數值上限為 $10^6$，需要線性等級的做法。

在思考解法時，可掌握以下核心觀察：

- **每個元素只有兩種可能的最終值**：
  原值 $x$ 只能變成 $x$ 或 $x + 1$，因此問題可轉化為：在數值軸上由小到大掃描，決定每個值要由哪個元素「佔據」。

- **連續序列中每個值只能使用一次**：
  同一個值出現多次時，最多只有兩份副本有用。一份維持原值，一份遞增成下一個值。因此只需區分「不存在、出現一次、出現至少兩次」三種情況。

- **以數值軸進行動態規劃**：
  掃描到某個值時，結束於該值的鏈有兩種來源。一種由原本就是該值的元素接上，另一種由前一個值遞增而來。將這兩類狀態分開維護，即可正確處理元素的遞增選擇。

- **數值範圍有限，可用計數取代排序**：
  數值上限僅 $10^6$，可直接以計數陣列記錄出現情形，省去比較排序，也讓掃描只需涵蓋實際出現的值域區間。

依據以上特性，可以採用以下策略：

- **先找出值域範圍，並以上限為 2 的計數陣列統計每個值的出現情形。**
- **由最小值掃描到最大值，以滾動方式維護兩種狀態**：
    - 「恰好結束於前一個值的最長鏈」；
    - 「僅使用較小元素、經遞增後結束於當前值的最長鏈」。
- **依當前值的出現次數更新狀態**：
    - 不存在時，只能沿用遞增而來的鏈；
    - 存在時，可延伸前一個值的鏈，或將元素遞增以延伸到下一個值；
    - 擁有兩份副本時，可同時佔據當前值與下一個值。
- **在掃描過程中持續記錄出現過的最長鏈長度。**

此策略只需一次線性掃描值域，即可求得最大可選元素數量。

## 解題步驟

### Step 1：取得陣列長度並找出數值範圍

先取得陣列長度，再線性掃描找出最小值與最大值。後續掃描只需涵蓋這段實際出現的值域，避免多餘計算。

```typescript
const length = nums.length;

// 找出數值範圍，使後續掃描只涵蓋實際出現過的值域
let minimumValue = nums[0];
let maximumValue = nums[0];
for (let index = 1; index < length; index++) {
  const value = nums[index];
  if (value > maximumValue) {
    maximumValue = value;
  } else if (value < minimumValue) {
    minimumValue = value;
  }
}
```

### Step 2：以計數排序統計每個值的出現情形

建立以數值為索引的計數陣列。由於只需區分「0 次、1 次、至少 2 次」，每個值的計數上限設為 2，因此可用 `Uint8Array` 節省空間。

```typescript
// 計數排序：只需區分「0、1 或至少 2」，因此次數上限設為 2
const occurrence = new Uint8Array(maximumValue + 1);
for (let index = 0; index < length; index++) {
  const value = nums[index];
  if (occurrence[value] < 2) {
    occurrence[value]++;
  }
}
```

### Step 3：初始化滾動狀態與最佳答案

這裡建立兩個滾動狀態：

- `endAtPrevious`：已考慮所有不超過 `value - 1` 的元素時，恰好結束於 `value - 1` 的最長鏈。
- `pendingAtCurrent`：只使用小於 `value` 的元素、經遞增後結束於 `value` 的最長鏈。

陣列至少有一個元素，因此最佳答案初始為 1。

```typescript
// endAtPrevious：恰好結束於 value - 1 的最長鏈（已考慮所有不超過 value - 1 的元素）
// pendingAtCurrent：僅使用小於 value 的元素、結束於 value 的最長鏈
let endAtPrevious = 0;
let pendingAtCurrent = 0;
let bestLength = 1;
```

### Step 4：逐值掃描並處理該值不存在的情況

由最小值掃描到最大值。每一輪先讀取當前值的出現次數，並宣告本輪要計算的兩個新狀態：

- `finalAtCurrent`：結束於當前值的最長鏈。
- `pendingAtNext`：經遞增後結束於下一個值的最長鏈。

若沒有任何元素等於當前值，結束於此處的鏈只能由前一個值遞增而來。同時，此處無元素可遞增到下一個值，因此 `pendingAtNext` 歸零。

```typescript
for (let value = minimumValue; value <= maximumValue; value++) {
  const count = occurrence[value];
  let finalAtCurrent: number;
  let pendingAtNext: number;

  if (count === 0) {
    // 沒有任何元素等於 value：只有由 value - 1 遞增而來的鏈能在此結束
    finalAtCurrent = pendingAtCurrent;
    pendingAtNext = 0;
  } else {
    // ...
  }

  // ...
}
```

### Step 5：當前值存在時，計算結束於當前值的最長鏈

若當前值存在，可保留一個元素為原值，接在結束於前一個值的鏈之後，長度為 `endAtPrevious + 1`。也可沿用由前一個值遞增而來、同樣結束於當前值的鏈。兩者取較大者。

```typescript
for (let value = minimumValue; value <= maximumValue; value++) {
  // Step 4：讀取出現次數並處理該值不存在的情況

  if (count === 0) {
    // Step 4：沿用遞增而來的鏈，並將下一個值的狀態歸零
  } else {
    // 保留一個元素為 value，以延伸結束於 value - 1 的鏈
    finalAtCurrent = endAtPrevious + 1;
    if (pendingAtCurrent > finalAtCurrent) {
      finalAtCurrent = pendingAtCurrent;
    }

    // ...
  }

  // ...
}
```

### Step 6：計算經遞增後結束於下一個值的最長鏈

將一個當前值的元素遞增為下一個值，可延伸「結束於當前值且只使用較小元素」的鏈，長度為 `pendingAtCurrent + 1`。

若當前值有兩份以上副本，可讓一份維持原值、另一份遞增，一次延伸兩格，長度為 `endAtPrevious + 2`。取兩者較大者後，同步更新最佳答案。

```typescript
for (let value = minimumValue; value <= maximumValue; value++) {
  // Step 4：讀取出現次數並處理該值不存在的情況

  if (count === 0) {
    // Step 4：沿用遞增而來的鏈，並將下一個值的狀態歸零
  } else {
    // Step 5：計算結束於當前值的最長鏈

    // 在結束於 value 的鏈上，將一個元素遞增為 value + 1
    pendingAtNext = pendingAtCurrent + 1;

    // 若有兩份副本，一份維持為 value，另一份遞增為 value + 1
    if (count > 1 && endAtPrevious + 2 > pendingAtNext) {
      pendingAtNext = endAtPrevious + 2;
    }

    if (pendingAtNext > bestLength) {
      bestLength = pendingAtNext;
    }
  }

  // ...
}
```

### Step 7：更新最佳答案並推進滾動狀態

先以結束於當前值的鏈長更新最佳答案。接著將本輪結果轉為下一輪的狀態：`finalAtCurrent` 變成下一輪的「結束於前一個值」，`pendingAtNext` 變成下一輪的「遞增而來結束於當前值」。

```typescript
for (let value = minimumValue; value <= maximumValue; value++) {
  // Step 4：讀取出現次數並處理該值不存在的情況

  // Step 5：計算結束於當前值的最長鏈

  // Step 6：計算經遞增後結束於下一個值的最長鏈

  if (finalAtCurrent > bestLength) {
    bestLength = finalAtCurrent;
  }

  // 將滾動狀態向前推進一個值
  endAtPrevious = finalAtCurrent;
  pendingAtCurrent = pendingAtNext;
}
```

### Step 8：回傳最長可選元素數量

掃描完整個值域後，`bestLength` 即為可選出的最多元素數量，直接回傳。

```typescript
return bestLength;
```

## 時間複雜度

- 找出數值範圍與建立計數陣列，各需一次線性掃描，為 $O(n)$；
- 值域掃描涵蓋最小值到最大值，每個值只做常數次運算，為 $O(m)$，其中 $m$ 為陣列中的最大值；
- 總時間複雜度為 $O(n + m)$。

> $O(n + m)$

## 空間複雜度

- 計數陣列大小為最大值加一，為 $O(m)$；
- 滾動狀態只使用固定數量的變數；
- 總空間複雜度為 $O(m)$。

> $O(m)$
