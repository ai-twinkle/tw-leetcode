# 462. Minimum Moves to Equal Array Elements II

Given an integer array `nums` of size `n`, 
return the minimum number of moves required to make all array elements equal.

In one move, you can increment or decrement an element of the array by `1`.

Test cases are designed so that the answer will fit in a 32-bit integer.

**Constraints:**

- `n == nums.length`
- `1 <= nums.length <= 10^5`
- `-10^9 <= nums[i] <= 10^9`

## 基礎思路

本題要求計算使陣列中所有元素相等所需的最少操作次數，每次操作可將某一元素加一或減一。
由於陣列長度最大可達 `10^5`，若逐一枚舉所有可能的目標值並計算總成本，計算量過大，因此需要找出最佳目標值的性質。

在思考解法時，可掌握以下核心觀察：

- **總成本等於各元素與目標值的距離總和**：
  每次操作只能改變一單位，因此將某元素調整到目標值的成本，恰為兩者差的絕對值；整體問題等價於最小化「絕對差總和」。

- **中位數是絕對差總和的最小化點**：
  若目標值往某方向移動，位於其兩側的元素數量決定成本的增減；只有當兩側元素數量平衡時，成本才無法再降低，而此平衡點正是中位數。

- **頭尾配對可直接得出最小成本**：
  對於排序後的最小值與最大值，任何介於兩者之間的目標值，使這對元素相等的成本恆為兩者之差；由外向內逐層配對時，每一對的區間都包含下一對，而中位數同時落在所有區間內，因此每對的最小成本都能同時達成。

- **無須實際求出中位數**：
  既然每一對的成本只取決於兩端差值，將所有配對的差值加總即為答案；若元素個數為奇數，正中央的元素本身即為目標，成本為零。

依據以上特性，可以採用以下策略：

- **先將資料排序**，使最小與最大的元素位於兩端。
- **以雙指標由兩端向中間收斂**，每次將當前最大值與最小值的差累加進總成本。
- **當兩指標相遇或交錯時結束**，累加結果即為最少操作次數。

此策略避免了枚舉目標值，只需排序加上一次線性掃描即可求得答案。

## 解題步驟

### Step 1：取得陣列長度

先記錄輸入陣列的長度，供後續設定右指標的初始位置使用。

```typescript
const length = nums.length;
```

### Step 2：複製為型別化陣列並排序

將輸入複製為 `Int32Array` 後排序，可使用原生的數值排序，省去自訂比較函式的額外開銷，並得到遞增有序的資料。

```typescript
// 複製為型別化陣列，使排序為原生數值排序，無比較函式的額外開銷
const sortedValues = Int32Array.from(nums);
sortedValues.sort();
```

### Step 3：初始化累計成本與雙指標

使用 `totalMoves` 累計總操作次數，並讓 `leftIndex` 與 `rightIndex` 分別指向排序後的最小值與最大值，準備由兩端向內配對。

```typescript
// 將最小值與最大值配對並逐步向內移動；每一對貢獻 (high - low)
let totalMoves = 0;
let leftIndex = 0;
let rightIndex = length - 1;
```

### Step 4：由兩端向內配對並累加差值

當左指標仍在右指標左側時，將當前最大值與最小值的差加入總成本，再同時將兩指標向內移動一格。元素個數為奇數時，正中央的元素不會被配對，因為它本身即為目標值，成本為零。

```typescript
while (leftIndex < rightIndex) {
  totalMoves += sortedValues[rightIndex] - sortedValues[leftIndex];
  leftIndex++;
  rightIndex--;
}
```

### Step 5：回傳最少操作次數

所有配對完成後，`totalMoves` 即為使所有元素相等的最少操作次數。

```typescript
return totalMoves;
```

## 時間複雜度

- 複製陣列需 $O(n)$；
- 排序需 $O(n \log n)$；
- 雙指標配對最多走訪 $n / 2$ 對，為 $O(n)$；
- 總時間複雜度為 $O(n \log n)$。

> $O(n \log n)$

## 空間複雜度

- 需要一個與輸入等長的型別化陣列存放排序結果，為 $O(n)$；
- 其餘僅使用固定數量的變數；
- 總空間複雜度為 $O(n)$。

> $O(n)$
