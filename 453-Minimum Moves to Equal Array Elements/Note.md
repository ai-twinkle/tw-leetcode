# 453. Minimum Moves to Equal Array Elements

Given an integer array `nums` of size `n`, 
return the minimum number of moves required to make all array elements equal.

In one move, you can increment `n - 1` elements of the array by `1`.

**Constraints:**

- `n == nums.length`
- `1 <= nums.length <= 10^5`
- `-10^9 <= nums[i] <= 10^9`
- The answer is guaranteed to fit in a 32-bit integer.

## 基礎思路

本題要求以最少的操作次數使陣列中所有元素相等，每次操作可將其中 `n - 1` 個元素各加 `1`。
若直接模擬操作過程，次數可能極大，因此需要從操作的本質切入，轉換成可直接計算的形式。

在思考解法時，可掌握以下核心觀察：

- **操作具有相對等價性**：
  「讓 `n - 1` 個元素各加 1」與「讓剩下的 1 個元素減 1」，對元素之間的相對差距效果完全相同。
- 題目只要求所有元素相等，不在意最終數值，因此可以把每次操作視為「將某一個元素減 1」。

- **最終目標值必為最小值**：
  在「每次只能讓一個元素減 1」的觀點下，讓所有元素相等的最省方式，就是把每個元素都降到目前的最小值。若目標低於最小值，所有元素都得多付出額外步數。

- **總操作次數可直接由統計量求得**：
  每個元素需要的步數等於它與最小值的差，加總後即為總和減去「元素個數乘以最小值」，不需逐步模擬。

依據以上特性，可以採用以下策略：

- **以單次線性掃描同時取得總和與最小值**，避免多次遍歷。
- **套用「總和減去元素個數乘以最小值」的公式**，直接算出最少操作次數。

此策略把模擬問題化為統計量的計算，能在線性時間內求得答案。

## 解題步驟

### Step 1：初始化長度、最小值與總和

先取得陣列長度，以第一個元素作為最小值的初始候選，並把總和的累加器設為 0，供後續單次掃描使用。

```typescript
const length = nums.length;
let minimumValue = nums[0];
let totalSum = 0;
```

### Step 2：單次掃描同時累加總和並追蹤最小值

走訪陣列中的每個元素，把它累加進 `totalSum`，若比目前的 `minimumValue` 更小就更新最小值。一次掃描就能取得計算答案所需的兩個統計量。

```typescript
// 單次掃描：同時累加總和並追蹤最小值
for (let index = 0; index < length; index++) {
  const value = nums[index];
  totalSum += value;
  if (value < minimumValue) {
    minimumValue = value;
  }
}
```

### Step 3：套用公式計算並回傳最少操作次數

每個元素都要降到最小值，所需步數為它與最小值的差，總和即為 `totalSum - length * minimumValue`，直接回傳。

```typescript
// 每個元素都必須降至最小值，因此操作次數 = 總和 - n * 最小值
return totalSum - length * minimumValue;
```

## 時間複雜度

- 只需走訪陣列一次，每個元素做常數次運算；
- 最後的公式計算為常數時間。
- 總時間複雜度為 $O(n)$。

> $O(n)$

## 空間複雜度

- 只使用固定數量的變數；
- 沒有額外的陣列或動態空間。
- 總空間複雜度為 $O(1)$。

> $O(1)$
