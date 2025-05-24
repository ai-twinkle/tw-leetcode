# 2537. Count the Number of Good Subarrays

Given an integer array `nums` and an integer `k`, return the number of good subarrays of `nums`.

A subarray `arr` is good if there are at least `k` pairs of indices `(i, j)` such that `i < j` and `arr[i] == arr[j]`.

A subarray is a contiguous non-empty sequence of elements within an array.

## 基礎思路

題目要求找出所有連續子陣列，其中至少存在 `k` 組滿足條件 `(i, j)`（其中 `i < j` 且 `arr[i] == arr[j]`）的「好子陣列」。  

為了有效率地計算每個子陣列中滿足條件的配對數量，我們利用「滑動窗口」技巧與「頻率計數器」來動態維護當前窗口內的元素出現頻率，同時累加出現過的配對數量。

我們可以將問題分為兩種情況來處理：

1. 當 `k === 0` 時，任何子陣列都滿足條件，直接利用數學公式計算所有子陣列數量。(雖然題目中 `k` 不會為 0，但這是為了完整性)
2. 當 `k > 0` 時，使用雙指針（左指標與右指標）不斷擴大窗口，並在窗口內累加「好配對」的數量，一旦窗口內配對數達到 `k`，再進行收縮窗口，統計從該位置起所有能滿足條件的子陣列。

**Constraints:**

- `1 <= nums.length <= 10^5`
- `1 <= nums[i], k <= 10^9`

## 解題步驟

### Step 1：初始化與特例判斷

首先，我們取得陣列的長度 `totalNumbers`。  
當 `k` 為 0 時，由於每個子陣列都滿足條件，我們可以直接用數學公式計算所有子陣列的數量：

$$
\text{總子陣列數量} = \frac{n \times (n + 1)}{2}
$$

在程式中，使用右位移運算符 `>> 1` 來實現除以 2 的操作。

```typescript
const totalNumbers = nums.length;
if (k === 0) {
  // 當 k 為 0 時，每個子陣列皆為好子陣列，直接返回所有子陣列的數量。
  return (totalNumbers * (totalNumbers + 1)) >> 1;
}
```

### Step 2：宣告變數與資料結構

我們宣告以下變數：
- `currentPairCount`：記錄當前滑動窗口內的好配對數。
- `goodSubarrayCount`：累加滿足條件的好子陣列數量。
- `leftPointer`：滑動窗口左邊界指標。

另外，我們利用 `Map` 來作為頻率計數器，追蹤窗口中各個數字的出現次數。

```typescript
let currentPairCount = 0;       // 當前窗口中的好配對數量
let goodSubarrayCount = 0;      // 最終統計的好子陣列數量
let leftPointer = 0;

// 使用 Map 記錄窗口中各數字的出現頻率
const frequencyCounter = new Map<number, number>();
```

### Step 3：滑動窗口遍歷與統計

#### Step 3.1：右指標遍歷與滑動窗口擴展

利用 `for` 迴圈讓右指標 `rightPointer` 從 0 遍歷到 `totalNumbers - 1`。  
對於每個新的元素 `nums[rightPointer]`：
- 取得當前數字在窗口內的出現次數 `currentFrequency`（預設為 0）。
- 更新好配對數 `currentPairCount`，因為當前數字與窗口中先前相同數字形成了 `currentFrequency` 個新配對。
- 更新頻率計數器中該數字的計數值（加 1）。

```typescript
for (let rightPointer = 0; rightPointer < totalNumbers; rightPointer++) {
  const currentNumber = nums[rightPointer];
  const currentFrequency = frequencyCounter.get(currentNumber) || 0;
  // 每遇到一個相同數字，會和窗口中所有相同數字形成好配對
  currentPairCount += currentFrequency;
  // 更新當前數字的出現次數
  frequencyCounter.set(currentNumber, currentFrequency + 1);

  // ...
}
```

#### Step 3.2：滑動窗口收縮並統計好子陣列

當窗口內的好配對數 `currentPairCount` 大於等於 `k` 時，代表從當前 `leftPointer` 到 `rightPointer` 所形成的窗口已滿足條件：
- 由於窗口固定右邊界，當前窗口及其向右延伸形成的所有子陣列都為好子陣列，因此累加 `totalNumbers - rightPointer` 到 `goodSubarrayCount`。

接著，為了嘗試縮小窗口（以便找到更多符合條件的子陣列），將左邊的元素移除：
- 從頻率計數器中取得左邊數字 `leftNumber` 的計數值 `leftFrequency`。
- 將該數字出現次數減 1，並更新頻率計數器。
- 移除左邊元素後，窗口中的好配對數會減少 `leftFrequency - 1`（因為這個被移除的數字原本與其他相同數字構成 `leftFrequency - 1` 組配對）。
- 將 `leftPointer` 向右移動一格。

```typescript
for (let rightPointer = 0; rightPointer < totalNumbers; rightPointer++) {
  // 3.1：右指標遍歷與滑動窗口擴展

  // 當窗口內好配對數達到或超過 k 時，嘗試收縮窗口
  while (currentPairCount >= k) {
    // 從 rightPointer 到陣列末尾的所有子陣列都滿足條件，累加計數
    goodSubarrayCount += totalNumbers - rightPointer;

    const leftNumber = nums[leftPointer];
    const leftFrequency = frequencyCounter.get(leftNumber)!;
    // 移除窗口左側的一個 leftNumber
    frequencyCounter.set(leftNumber, leftFrequency - 1);
    // 移除 leftNumber 導致窗口內的好配對數減少 (leftFrequency - 1)
    currentPairCount -= (leftFrequency - 1);
    leftPointer++;
  }
}
```

### Step 4：返回最終結果

當所有可能的右指標遍歷完畢後，累計的 `goodSubarrayCount` 即為符合條件的好子陣列總數，最後回傳該值。

```typescript
return goodSubarrayCount;
```


## 時間複雜度

- **外層迴圈**：右指標遍歷整個陣列，複雜度為 $O(n)$。
- **內層 while 迴圈**：每個元素僅被左指標移動一次，累計下來的時間複雜度也是 $O(n)$。
- 總時間複雜度為 $O(n)$。

> $O(n)$

## 空間複雜度

- **頻率計數器**：使用 Map 來記錄各個數字的頻率，最壞情況需要 $O(n)$ 的空間。
- 其他變數只佔用常數空間。
- 總空間複雜度為 $O(n)$。

> $O(n)$
