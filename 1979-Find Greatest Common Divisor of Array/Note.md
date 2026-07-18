# 1979. Find Greatest Common Divisor of Array

Given an integer array `nums`, 
return the greatest common divisor of the smallest number and largest number in `nums`.

The greatest common divisor of two numbers is the largest positive integer that evenly divides both numbers.

**Constraints:**

- `2 <= nums.length <= 1000`
- `1 <= nums[i] <= 1000`

## 基礎思路

本題要求找出陣列中「最小值」與「最大值」的最大公因數（GCD）。整體任務可以拆解為兩個獨立的子問題，分別處理後再結合。

在思考解法時，可掌握以下核心觀察：

- **只需關注兩個極值**：
  題目僅要求最小值與最大值的最大公因數，因此陣列中其餘元素對答案沒有影響，無須排序整個陣列，只要在一次遍歷中同時追蹤兩端即可。

- **極值追蹤可合併於單次掃描**：
  最小值與最大值可在同一輪走訪中一併更新，避免分開呼叫多次比較函式而增加額外開銷。

- **最大公因數具備遞迴收斂特性**：
  兩數的最大公因數等於「較大數除以較小數的餘數」與「較小數」的最大公因數，透過不斷取餘數即可快速收斂至結果。

依據以上特性，可以採用以下策略：

- **以單次線性掃描同時取得最小值與最大值**，將兩個極值的搜尋合併，減少走訪次數。
- **對兩個極值套用輾轉相除法（Euclidean algorithm）**，反覆以餘數替換較小數，直到餘數為零，最終所得即為最大公因數。

此策略能以線性時間完成極值搜尋，並以對數級別的除法運算求得最大公因數，簡潔且高效。

## 解題步驟

### Step 1：初始化極值變數與長度

先以陣列首個元素同時初始化最小值與最大值，並記錄陣列長度以供後續走訪使用。

```typescript
let minimum = nums[0];
let maximum = nums[0];
const length = nums.length;
```

### Step 2：單次遍歷同時追蹤最小值與最大值

從第二個元素開始走訪，於同一輪中更新兩端極值：
若當前值小於目前最小值則更新最小值，否則檢查是否大於目前最大值以更新最大值。

```typescript
// 單次遍歷同時追蹤兩個極值，避免呼叫 Math.min/max 的額外開銷
for (let index = 1; index < length; index++) {
  const value = nums[index];
  if (value < minimum) {
    minimum = value;
  } else if (value > maximum) {
    maximum = value;
  }
}
```

### Step 3：以輾轉相除法求兩極值的最大公因數

對最小值與最大值套用輾轉相除法：
每一輪取「較大數除以較小數的餘數」，再將較小數移為較大數、餘數移為較小數，直到較小數為零。

```typescript
// 對兩個極值套用輾轉相除法
while (minimum !== 0) {
  const remainder = maximum % minimum;
  maximum = minimum;
  minimum = remainder;
}
```

### Step 4：回傳最大公因數

當迴圈結束（`minimum` 為 0）時，`maximum` 即保存了兩極值的最大公因數，直接回傳。

```typescript
return maximum;
```

## 時間複雜度

- 尋找最小值與最大值需進行一次線性掃描，花費 $O(n)$；
- 輾轉相除法的迭代次數與數值大小呈對數關係，花費 $O(\log(\max))$；
- 兩者相加，前者為主導項。
- 總時間複雜度為 $O(n)$。

> $O(n)$

## 空間複雜度

- 僅使用固定數量的變數（最小值、最大值、餘數等）；
- 無任何額外陣列或動態配置的空間。
- 總空間複雜度為 $O(1)$。

> $O(1)$
