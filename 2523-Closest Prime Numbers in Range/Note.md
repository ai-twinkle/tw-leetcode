# 2523. Closest Prime Numbers in Range

Given two positive integers `left` and `right`, find the two integers `num1` and `num2` such that:

- `left <= num1 < num2 <= right` .
- Both `num1` and `num2` are prime numbers.
- `num2 - num1` is the minimum amongst all other pairs satisfying the above conditions.

Return the positive integer array `ans = [num1, num2]`. 
If there are multiple pairs satisfying these conditions, return the one with the smallest `num1` value. 
If no such numbers exist, return `[-1, -1]`.

Constraints:

- `1 <= left <= right <= 10^6`

## 基礎思路

我們的解法核心在於先利用 Sieve of Eratosthenes 預先計算出所有的質數，再從中找出範圍內最接近的一對質數。
由於 right 的範圍可能非常大，直接逐一判斷會導致超時 (Time Limit Error)，因此我們採取一次性預處理質數集合，後續每次查詢時便可快速定位。

我們需要考慮以下幾種情況來做 early return：

- **包含 [2, 3]：**  
  如果查詢範圍內包含 2 和 3，就直接回傳 [2, 3]，因為這是已知最小且間距最短的質數組合。

- **無質數情況：**  
  如果在查詢範圍內沒有任何質數，則直接回傳 [-1, -1]。

- **遍歷最接近質數：**  
  從預先篩選出的質數中依序比較相鄰質數之間的差距：
    - 當遇到差距為 2 的情況時，立即回傳結果，因為除了 [2, 3] 以外，其他質數的間距都不可能小於 2。
    - 否則持續遍歷，並更新記錄下最小的差距。

此外，為了能夠快速定位查詢範圍內的質數，我們採用了 **二分搜尋** 技巧。
由於預處理得到的質數集合本身是有序的，透過二分搜尋，我們可以在 $O(\log n)$ 的時間複雜度內找到區間起始與結束的正確位置，這樣就不需要從頭掃描整個質數集合，從而大幅降低查詢時間。

> **Tips:**  
> - **Sieve of Eratosthenes** 的核心思想是從最小的質數開始，依次將其倍數標記為非質數，從而快速排除合數，找出整個數字範圍內的所有質數，這能夠顯著提升查詢效率。
> - **二分搜尋** 是一種高效的查找技巧，通過將查找範圍逐步縮小一半，最終找到目標值的位置，這樣可以在 $O(\log n)$ 的時間複雜度內完成查找。

## 解題步驟

### Step 1: 預先計算質數

首先，我們需要預先計算出查詢範圍內的所有質數，這樣才能在後續查詢時快速定位。

```typescript
// 題目限制的最大值
const MAX_LIMIT = 1e6;

// 建立一個 sieve array 來記錄質數，使用 Uint8Array 以提升效能。
// 每個索引代表該數字是否為質數 (1) 或非質數 (0)。
const primeFlags = new Uint8Array(MAX_LIMIT + 1).fill(1);
primeFlags[0] = primeFlags[1] = 0; // 0 與 1 不是質數，需標記為非質數。

// 該陣列將儲存所有在 [2, MAX_LIMIT] 範圍內找到的質數。
const primeNumbers: number[] = [];

// 使用 Sieve of Eratosthenes 標記非質數。
// 從 2 開始遍歷每個數字，直到 MAX_LIMIT 的平方根為止。
for (let currentNumber = 2; currentNumber * currentNumber <= MAX_LIMIT; currentNumber++) {
  if (primeFlags[currentNumber]) {
    // 從 currentNumber^2 開始，將所有 currentNumber 的倍數標記為非質數。
    for (let multiple = currentNumber * currentNumber; multiple <= MAX_LIMIT; multiple += currentNumber) {
      primeFlags[multiple] = 0;
    }
  }
}

// 收集所有質數，將其存入 primeNumbers 陣列中。
for (let currentNumber = 2; currentNumber <= MAX_LIMIT; currentNumber++) {
  if (primeFlags[currentNumber]) {
    primeNumbers.push(currentNumber);
  }
}
```

### Step 2: 第一種情況 - 包含 [2, 3]

如果查詢範圍內包含 2 和 3，就直接回傳 [2, 3]，因為這是已知最小且間距最短的質數組合。

```typescript
if (rangeStart <= 2 && rangeEnd >= 3) {
  return [2, 3];
}
```

### Step 3: 建立 Helper Function

我們需要兩個 helper function 來協助查找範圍內的質數：
- `lowerBoundIndex`: 用於查找範圍內第一個不小於目標值的質數索引。
- `upperBoundIndex`: 用於查找範圍內第一個大於目標值的質數索引。

> Tips:
> 使用無符號右移運算符 `>>>` 來進行快速整數除以 2 的運算。

```typescript
function lowerBoundIndex(array: number[], target: number): number {
  let lowerIndex = 0;
  let upperIndex = array.length;
  while (lowerIndex < upperIndex) {
    const middleIndex = (lowerIndex + upperIndex) >>> 1;
    if (array[middleIndex] < target) {
      lowerIndex = middleIndex + 1;
    } else {
      upperIndex = middleIndex;
    }
  }
  return lowerIndex;
}

function upperBoundIndex(array: number[], target: number): number {
  let lowerIndex = 0;
  let upperIndex = array.length;
  while (lowerIndex < upperIndex) {
    const middleIndex = (lowerIndex + upperIndex) >>> 1;
    if (array[middleIndex] <= target) {
      lowerIndex = middleIndex + 1;
    } else {
      upperIndex = middleIndex;
    }
  }
  return lowerIndex;
}
```

### Step 4: 第二種情況 - 無質數情況

如果在查詢範圍內沒有任何質數，則直接回傳 [-1, -1]。

```typescript
const startIndex = lowerBoundIndex(primeNumbers, rangeStart);
let endIndex = upperBoundIndex(primeNumbers, rangeEnd) - 1;

// 如果範圍內沒有任何質數，直接回傳 [-1, -1]。
if (endIndex - startIndex < 1) {
  return [-1, -1];
}
```

### Step 5: 遍歷最接近質數，並考慮差距為 2 的情況

從預先篩選出的質數中依序比較相鄰質數之間的差距，並更新記錄下最小的差距。

```typescript
// 初始變數以記錄最小差距和最接近的質數對。
let minimumGap = Number.MAX_SAFE_INTEGER;
let closestPrimePair: number[] = [-1, -1];

// 遍歷範圍內的質數，找到差距最小的一對質數。
for (let currentIndex = startIndex; currentIndex < endIndex; currentIndex++) {
  // 當前質數對之間的差距。
  const currentGap = primeNumbers[currentIndex + 1] - primeNumbers[currentIndex];

  // 當找到更小的差距時，更新最小差距和最接近的質數對。
  if (currentGap < minimumGap) {
    minimumGap = currentGap;
    closestPrimePair = [primeNumbers[currentIndex], primeNumbers[currentIndex + 1]];

    // 如果差距為 2，直接回傳結果。
    if (currentGap === 2) {
      return closestPrimePair;
    }
  }
}
```

## 時間複雜度

- **Sieve of Eratosthenes** 預處理使用篩法找出所有質數的複雜度為 $O(n \log \log n)$ 其中 $ n = \text{MAX_LIMIT} $。
-  從篩選結果中遍歷所有數字來收集質數，複雜度為 $O(n)$
- **查詢部分（二分搜尋與遍歷）：**
    - 利用二分搜尋來定位範圍內質數的起始和結束索引，複雜度為 $O(\log p)$ 其中 $ p $ 為質數的總數（約 $ \frac{n}{\log n} $）。
    - 遍歷查詢範圍內的質數，最壞情況下複雜度為 $O(k)$ 其中 $ k $ 是查詢區間內的質數數量，最壞情況約為 $ O\left(\frac{n}{\log n}\right) $。
- 總預處理時間複雜度為 $O(n \log \log n)$ ，總查詢時間複雜度為 $O\left(\frac{n}{\log n}\right)$
- 總時間複雜度為 $O(n \log \log n) + O\left(\frac{n}{\log n}\right) = O(n \log \log n)$。

> $O(n \log \log n)$

## 空間複雜度

- **Sieve 陣列：** 使用一個大小為 $ n + 1 $ 的陣列，複雜度為 $O(n)$
- 儲存質數的陣列約包含 $ O\left(\frac{n}{\log n}\right) $ 個元素，但相對於 $ O(n) $ 來說可忽略不計。
- 總空間複雜度為 $O(n)$

> $O(n)$
