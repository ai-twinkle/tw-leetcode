# 1399. Count Largest Group

You are given an integer `n`.

Each number from `1` to `n` is grouped according to the sum of its digits.

Return the number of groups that have the largest size.

## 基礎思路

題目要求將整數範圍 $1 \dots n$ 根據「數字和」（digit sum）分組，並返回「擁有最大群組大小」的群組數量。由於題目範圍限制為 $1 \le n \le 10^4$，我們可以採用**預計算（Precomputation）搭配動態規劃（Dynamic Programming）及查表法**來優化查詢效率：

### 主要步驟：

1. **預計算數字和**  
   使用動態規劃快速得到每個數字的 digit sum：
   $$
   \text{digitSumArray}[x] = \text{digitSumArray}\left(\lfloor x/10 \rfloor\right) + (x \bmod 10)
   $$

2. **確認最大數字和範圍**  
   找出所有 digit sum 中的最大值，以便分配合適大小的陣列空間。

3. **動態維護最大群組數量**  
   再次遍歷 $1 \dots n$，透過輔助陣列紀錄各個數字和的出現次數，動態更新並儲存每個前綴範圍的最大群組數量。

4. **快速查詢**  
   對於任意輸入 $n$，直接透過事先計算好的緩存陣列以 $O(1)$ 查詢。

## 解題步驟

### Step 1：宣告常數與緩存結構

初始化最大值常數與兩個主要的快取陣列：

- `digitSumArray`：儲存每個整數的數字和。
- `largestGroupCountCache`：儲存每個整數範圍內最大群組的數量。

```typescript
const MAX_INPUT_VALUE = 10000;
const digitSumArray = new Uint8Array(MAX_INPUT_VALUE + 1);
const largestGroupCountCache = new Uint16Array(MAX_INPUT_VALUE + 1);
```

### Step 2：預計算每個數字的數字和

利用動態規劃關係式填充數字和陣列：

```typescript
for (let value = 1; value <= MAX_INPUT_VALUE; value++) {
  // 取出數字的最後一位與剩餘的部分
  const quotient = (value / 10) | 0;             // 等價於 Math.floor(value / 10)
  const lastDigit = value - quotient * 10;       // 等價於 value % 10，但更有效率
  digitSumArray[value] = digitSumArray[quotient] + lastDigit;
}
```

### Step 3：找出可能的最大數字和

遍歷 digitSumArray，確認 digit sum 的最大可能值，用以初始化後續陣列：

```typescript
let observedMaxDigitSum = 0;
for (let value = 1; value <= MAX_INPUT_VALUE; value++) {
  const sum = digitSumArray[value];
  if (sum > observedMaxDigitSum) {
    observedMaxDigitSum = sum; // 記錄最大值
  }
}
```

### Step 4：填充 `largestGroupCountCache` 快取

透過立即執行函式（IIFE）進行單次填充：

```typescript
(function () {
  const groupSizeBySum = new Uint16Array(observedMaxDigitSum + 1);
  let currentLargestSize = 0;     // 目前最大群組的大小
  let currentCountOfLargest = 0;  // 目前具有最大群組大小的群組數量

  for (let value = 1; value <= MAX_INPUT_VALUE; value++) {
    const sum = digitSumArray[value];
    const newSize = ++groupSizeBySum[sum]; // 將此數字和的群組大小+1

    if (newSize > currentLargestSize) {
      // 發現更大的群組大小，更新最大值並重設計數
      currentLargestSize = newSize;
      currentCountOfLargest = 1;
    } else if (newSize === currentLargestSize) {
      // 又找到一個與當前最大大小相同的群組
      currentCountOfLargest++;
    }

    // 快取當前範圍 [1, value] 中最大的群組數量
    largestGroupCountCache[value] = currentCountOfLargest;
  }
})();
```

### Step 5：實作查詢函數 `countLargestGroup`

定義一個邊界檢查後，直接查詢快取的函數：

```typescript
function countLargestGroup(n: number): number {
  if (n < 1 || n > MAX_INPUT_VALUE) {
    throw new RangeError(`Argument 'n' must be between 1 and ${MAX_INPUT_VALUE}.`);
  }
  return largestGroupCountCache[n]; // O(1) 查詢
}
```

## 時間複雜度

- **預計算階段**：
    - 計算 digit sum：$O(n)$
    - 找出最大 digit sum：$O(n)$
    - 填充最大群組快取：$O(n)$
- **查詢階段**：
    - 直接查詢：$O(1)$

- 總時間複雜度為：$O(n)$，其中 $1 \le n \le 10^4$

> $O(n)$

## 空間複雜度

- **digitSumArray** 陣列：$O(n)$
- **largestGroupCountCache** 陣列：$O(n)$
- **groupSizeBySum** 陣列（輔助）：最多為最大 digit sum 長度，可視為 $O(n)$。

整體空間複雜度為：

> $O(n)$
