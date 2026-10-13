# 3727. Maximum Alternating Sum of Squares

You are given an integer array `nums`. 
You may rearrange the elements in any order.

The alternating score of an array arr is defined as:

- `score = arr[0]^2 - arr[1]^2 + arr[2]^2 - arr[3]^2 + ...`

Return an integer denoting the maximum possible alternating score of `nums` after rearranging its elements.

**Constraints:**

- `1 <= nums.length <= 10^5`
- `-4 * 10^4 <= nums[i] <= 4 * 10^4`

## 基礎思路

本題要求將陣列任意重排後，使「偶數位置取平方相加、奇數位置取平方相減」的交錯分數最大。陣列長度最大可達 $10^5$，因此需要接近線性的作法。

在思考解法時，可掌握以下核心觀察：

- **重排後只剩「正負位置數量」是固定的**：
  元素可以任意擺放，交錯規則唯一的限制是取正號的位置共有 $\lceil n / 2 \rceil$ 個，其餘位置取負號。

- **平方運算消除了原本的正負號**：
  每個元素只以平方值參與計算，因此只需考慮絕對值大小，原始符號毫無影響。

- **最佳分配為「大的平方放正號，小的平方放負號」**：
  若某個較小平方位於正號、較大平方位於負號，將兩者交換必定使分數變大，因此最佳解必然把最大的 $\lceil n / 2 \rceil$ 個平方值放在正號位置。

- **答案可改寫為「兩倍的較大組總和減去全體總和」**：
  分數等於較大組總和減去較小組總和，而較小組總和等於全體總和減去較大組總和，因此只需求出全體平方和與較大組平方和。

- **只需挑出較大的一半，不需要完整排序**：
  我們只關心哪些元素屬於較大組，組內順序無關緊要，因此可以用選擇演算法取代排序。

- **數值範圍有限，可改用計數**：
  絕對值至多約 $4 \times 10^4$，當輸入規模很大時，依絕對值分桶計數，再由大到小取用，會比比較式的選擇更有效率。

依據以上特性，可以採用以下策略：

- **先處理只有一個元素的特例，並計算正號位置的數量**。
- **輸入規模較小時**，先算出所有平方值與總和，再以三數取中搭配 Hoare 分割的快速選擇，把最大的一半集中到尾端，最後加總得到答案。
- **輸入規模較大時**，依絕對值分桶計數並累計總平方和，再由大到小走訪桶子，直到填滿所有正號位置為止。

此策略在兩種規模下都能以接近線性的成本求得最佳交錯分數。

## 解題步驟

### Step 1：預先定義數值範圍與策略切換門檻

先定義兩個常數：絕對值分桶所需的範圍大小，以及改用快速選擇的長度上限。

```typescript
const ABSOLUTE_VALUE_LIMIT = 40001;
const QUICKSELECT_LENGTH_LIMIT = 16384;
```

### Step 2：取得長度並處理單一元素的特例

只有一個元素時，它必定位於正號位置，直接回傳其平方即可。

```typescript
const length = nums.length;

// 單一元素必定位於加號位置。
if (length === 1) {
  return nums[0] * nums[0];
}
```

### Step 3：計算正號位置的數量

正號位置是所有偶數索引，共有 $\lceil n / 2 \rceil$ 個，以位移運算 `(length + 1) >> 1` 求出。

```typescript
// 加號位置為偶數索引，因此共有 ceil(length / 2) 個。
const positiveSlotCount = (length + 1) >> 1;
```

### Step 4：小規模輸入——計算所有平方值與總平方和

輸入長度不超過門檻時，走快速選擇的路線。先把每個元素的平方存入 `Int32Array`，同時累加全體平方和。

```typescript
if (length <= QUICKSELECT_LENGTH_LIMIT) {
  // 平方值不超過 1.6e9，因此 Int32Array 可完整容納而不會截斷。
  const squares = new Int32Array(length);
  let totalSquareSum = 0;
  for (let index = 0; index < length; index++) {
    const value = nums[index];
    const square = value * value;
    squares[index] = square;
    totalSquareSum += square;
  }

  // ...
}
```

### Step 5：設定快速選擇的分界與區間，並以三數取中選出樞紐

快速選擇的目標是讓從 `splitIndex` 起的尾端恰好是最大的 `positiveSlotCount` 個平方值。每一輪先取區間首、中、尾三個值的中位數作為樞紐，避免已排序或反向排序的輸入退化。

```typescript
if (length <= QUICKSELECT_LENGTH_LIMIT) {
  // Step 4：計算平方值與總平方和

  // 快速選擇只需將較大的一組集中在尾端，不需完整排序。
  const splitIndex = length - positiveSlotCount;
  let low = 0;
  let high = length - 1;
  while (low < high) {
    // 三數取中選擇樞紐，可讓已排序與反向排序的輸入維持線性。
    const middle = (low + high) >> 1;
    const first = squares[low];
    const second = squares[middle];
    const third = squares[high];
    let pivot: number;
    if (first < second) {
      pivot = second < third ? second : first < third ? third : first;
    } else {
      pivot = first < third ? first : second < third ? third : second;
    }

    // ...
  }

  // ...
}
```

### Step 6：以 Hoare 分割將區間依樞紐劃分

左右指標分別向內移動，跳過已在正確側的元素，遇到兩側都放錯的元素就交換。Hoare 分割會把與樞紐相等的值平均分到兩側，因此大量重複值時仍能維持線性。

```typescript
if (length <= QUICKSELECT_LENGTH_LIMIT) {
  // Step 4：計算平方值與總平方和

  // Step 5：設定分界與搜尋區間
  while (low < high) {
    // Step 5：以三數取中選擇樞紐

    // Hoare 分割會將重複值平均分配到兩側，因此相同值時仍維持 O(n)。
    let left = low;
    let right = high;
    while (left <= right) {
      while (squares[left] < pivot) {
        left++;
      }
      while (squares[right] > pivot) {
        right--;
      }
      if (left <= right) {
        const swapped = squares[left];
        squares[left] = squares[right];
        squares[right] = swapped;
        left++;
        right--;
      }
    }

    // ...
  }

  // ...
}
```

### Step 7：依分界位置縮小搜尋區間

分割完成後，只需繼續處理仍包含 `splitIndex` 的那一側。若分界落在左右指標之間，代表該位置已是樞紐值，劃分完成，結束迴圈。

```typescript
if (length <= QUICKSELECT_LENGTH_LIMIT) {
  // Step 4：計算平方值與總平方和

  // Step 5：設定分界與搜尋區間
  while (low < high) {
    // Step 5：以三數取中選擇樞紐

    // Step 6：以 Hoare 分割劃分區間

    // 只需深入仍包含分界位置的那一側。
    if (splitIndex <= right) {
      high = right;
    } else if (splitIndex >= left) {
      low = left;
    } else {
      break;
    }
  }

  // ...
}
```

### Step 8：加總較大組的平方值並回傳答案

快速選擇結束後，從 `splitIndex` 到結尾正是最大的一半平方值。將它們加總，再套用「兩倍較大組總和減去全體總和」即得答案。

```typescript
if (length <= QUICKSELECT_LENGTH_LIMIT) {
  // Step 4：計算平方值與總平方和

  // Step 5：設定分界、搜尋區間並選擇樞紐

  // Step 6：以 Hoare 分割劃分區間

  // Step 7：依分界位置縮小搜尋區間

  let largestSquareSum = 0;
  for (let index = splitIndex; index < length; index++) {
    largestSquareSum += squares[index];
  }
  return largestSquareSum * 2 - totalSquareSum;
}
```

### Step 9：大規模輸入——依絕對值分桶計數並累計總平方和

輸入規模較大時改用計數策略。將每個值取絕對值後放入對應的桶子計數，同時累加全體平方和，工作量受值域限制。

```typescript
// 大規模輸入：依絕對值分桶，使工作量受值域範圍限制。
const absoluteValueCounts = new Int32Array(ABSOLUTE_VALUE_LIMIT);
let totalSquareSum = 0;
for (let index = 0; index < length; index++) {
  let value = nums[index];
  if (value < 0) {
    value = -value;
  }
  absoluteValueCounts[value]++;
  totalSquareSum += value * value;
}
```

### Step 10：由大到小走訪桶子，填滿所有正號位置

從最大的絕對值往下走訪，每個非空桶子盡量取用，但不超過剩餘的正號位置數量；所有正號位置填滿時立即停止。

```typescript
// 由大到小走訪桶子，一旦所有加號位置填滿即停止。
let remainingSlots = positiveSlotCount;
let largestSquareSum = 0;
for (let value = ABSOLUTE_VALUE_LIMIT - 1; remainingSlots > 0; value--) {
  const count = absoluteValueCounts[value];
  if (count === 0) {
    continue;
  }
  const taken = count < remainingSlots ? count : remainingSlots;
  largestSquareSum += taken * value * value;
  remainingSlots -= taken;
}
```

### Step 11：計算並回傳最大交錯分數

以「兩倍較大組總和減去全體總和」得到最大交錯分數並回傳。

```typescript
return largestSquareSum * 2 - totalSquareSum;
```

## 時間複雜度

- 令 $n$ 為陣列長度，$k$ 為絕對值的可能範圍大小（約 $4 \times 10^4$）；
- 小規模路線：計算平方值為 $O(n)$；三數取中搭配 Hoare 分割的快速選擇平均為 $O(n)$；加總較大組為 $O(n)$；
- 大規模路線：分桶計數為 $O(n)$，由大到小走訪桶子最多 $O(k)$；
- 總時間複雜度為 $O(n + k)$。

> $O(n + k)$

## 空間複雜度

- 小規模路線需要長度為 $n$ 的平方值陣列，為 $O(n)$；
- 大規模路線需要大小為 $k$ 的計數陣列，為 $O(k)$；
- 其餘僅使用固定數量的變數；
- 總空間複雜度為 $O(n + k)$。

> $O(n + k)$
