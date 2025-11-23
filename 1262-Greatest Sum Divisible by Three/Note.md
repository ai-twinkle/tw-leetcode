# 1262. Greatest Sum Divisible by Three

Given an integer array `nums`, return the maximum possible sum of elements of the array such that it is divisible by three.

**Constraints:**

- `1 <= nums.length <= 4 * 10^4`
- `1 <= nums[i] <= 10^4`

## 基礎思路

本題要求從整個陣列中選取元素，使其總和 **可以被 3 整除**，並且總和**最大化**。

在思考解法時，我們需要掌握以下關鍵觀察：

- **所有數字 mod 3 的特性**：
  一個整數 mod 3 的結果只可能是 0、1 或 2。
  當所有元素加總後，若 `sum % 3 === 0`，代表已可直接回傳。

- **若總和不被 3 整除，只能移除少量元素修正餘數**：
  若 `sum % 3 === 1`，則需移除：

    - **一個餘數為 1 的最小數**，或
    - **兩個餘數為 2 的最小數的總和**
      擇其較小。

  若 `sum % 3 === 2`，則需移除：

    - **一個餘數為 2 的最小數**，或
    - **兩個餘數為 1 的最小數的總和**
      擇其較小。

- **只需追蹤每種餘數下最小的兩個值**：
  因為最多只會移除一個或兩個數字，所以我們只需維護：

    - 最小兩個 remainder = 1 的值
    - 最小兩個 remainder = 2 的值

- **單遍掃描即可完成所有統計**
  我們用一次迴圈計算總和並更新最小值候選。
  最後依照餘數判斷最佳移除量。

此策略能在單一線掃描內完成，效率極佳且不需要排序。

## 解題步驟

### Step 1：初始化各類變數

建立總和變數，並準備追蹤餘數為 1 與餘數為 2 的最小兩個值。

```typescript
const length = nums.length;

// 所有元素總和
let totalSum = 0;

// 追蹤餘數為 1 的最小與次小數
let minRemainderOneFirst = Number.MAX_SAFE_INTEGER;
let minRemainderOneSecond = Number.MAX_SAFE_INTEGER;

// 追蹤餘數為 2 的最小與次小數
let minRemainderTwoFirst = Number.MAX_SAFE_INTEGER;
let minRemainderTwoSecond = Number.MAX_SAFE_INTEGER;
```

### Step 2：單次遍歷陣列並記錄必要資訊

在同一個迴圈中：

- 累加元素總和
- 根據 `num % 3` 更新對應的最小候選值

```typescript
for (let index = 0; index < length; index++) {
  const currentNumber = nums[index];

  // 加總所有元素
  totalSum += currentNumber;

  const currentRemainder = currentNumber % 3;

  if (currentRemainder === 1) {
    // 維護餘數為 1 的最小與次小值
    if (currentNumber < minRemainderOneFirst) {
      minRemainderOneSecond = minRemainderOneFirst;
      minRemainderOneFirst = currentNumber;
    } else if (currentNumber < minRemainderOneSecond) {
      minRemainderOneSecond = currentNumber;
    }
  } else if (currentRemainder === 2) {
    // 維護餘數為 2 的最小與次小值
    if (currentNumber < minRemainderTwoFirst) {
      minRemainderTwoSecond = minRemainderTwoFirst;
      minRemainderTwoFirst = currentNumber;
    } else if (currentNumber < minRemainderTwoSecond) {
      minRemainderTwoSecond = currentNumber;
    }
  }
}
```

### Step 3：若總和可被 3 整除，直接回傳

```typescript
// 若總和本身可被 3 整除，無須移除任何數
const remainder = totalSum % 3;
if (remainder === 0) {
  return totalSum;
}
```

### Step 4：根據 remainder 推導最小移除量

若 `sum % 3 === 1`

- 移除一個餘 1 的最小數
- 或移除兩個餘 2 的最小數總合

若 `sum % 3 === 2`

- 移除一個餘 2 的最小數
- 或移除兩個餘 1 的最小數總合

選最小的作為最佳移除量。

```typescript
let minimumToSubtract = Number.MAX_SAFE_INTEGER;

if (remainder === 1) {
  // 選項 1：移除餘數為 1 的最小值
  if (minRemainderOneFirst !== Number.MAX_SAFE_INTEGER) {
    minimumToSubtract = minRemainderOneFirst;
  }

  // 選項 2：移除餘數為 2 的最小兩個值
  if (minRemainderTwoSecond !== Number.MAX_SAFE_INTEGER) {
    const removeTwoRemainderTwo =
      minRemainderTwoFirst + minRemainderTwoSecond;

    if (removeTwoRemainderTwo < minimumToSubtract) {
      minimumToSubtract = removeTwoRemainderTwo;
    }
  }
} else {
  // remainder === 2

  // 選項 1：移除餘數為 2 的最小值
  if (minRemainderTwoFirst !== Number.MAX_SAFE_INTEGER) {
    minimumToSubtract = minRemainderTwoFirst;
  }

  // 選項 2：移除餘數為 1 的最小兩個值
  if (minRemainderOneSecond !== Number.MAX_SAFE_INTEGER) {
    const removeTwoRemainderOne =
      minRemainderOneFirst + minRemainderOneSecond;

    if (removeTwoRemainderOne < minimumToSubtract) {
      minimumToSubtract = removeTwoRemainderOne;
    }
  }
}
```

### Step 5：若仍無合法移除方式，只能回傳 0

```typescript
// 若無合法移除組合，則無法讓總和 divisible by 3
if (minimumToSubtract === Number.MAX_SAFE_INTEGER) {
  return 0;
}
```

### Step 6：回傳最終最大可行總和

```typescript
// 回傳最終最大、且可被 3 整除的總和
return totalSum - minimumToSubtract;
```

## 時間複雜度

- 單趟掃描陣列，更新總和與最小候選值皆為 $O(1)$
- 不需要排序或額外資料結構
- 總時間複雜度為 $O(n)$。

> $O(n)$

## 空間複雜度

- 只使用固定數量的變數統計最小值
- 無需額外陣列或額外儲存空間
- 總空間複雜度為 $O(1)$。

> $O(1)$
