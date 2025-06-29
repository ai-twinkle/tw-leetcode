# 1498. Number of Subsequences That Satisfy the Given Sum Condition

You are given an array of integers `nums` and an integer `target`.

Return the number of non-empty subsequences of `nums` such that the sum of the minimum and maximum element on it is less or equal to `target`. 
Since the answer may be too large, return it modulo `10^9 + 7`.

**Constraints:**

- `1 <= nums.length <= 10^5`
- `1 <= nums[i] <= 10^6`
- `1 <= target <= 10^6`

## 基礎思路

本題的核心目標是要找出「所有非空子序列」，使得子序列中的最小值與最大值之和不超過指定的數字 `target`。由於直接枚舉所有子序列的組合過於耗時，因此我們考慮以下策略：

- **排序陣列**：首先將數字陣列排序，方便以「雙指標」的方式定位最小值與最大值。
- **使用雙指標法**：透過雙指標（左指標為最小值，右指標為最大值）來迅速判斷子序列是否滿足「最小值 + 最大值 ≤ target」的條件：

    - 當總和超過 `target`，代表右指標所指的數字太大，應將右指標向左移動。
    - 若總和不超過 `target`，代表以左指標為最小值的情況下，右指標以內的所有數字都可以任意搭配，因此可以一次性累加所有可能子序列的數量，隨後將左指標右移。
- **預先計算冪次（快取）**：由於需要頻繁計算 $2^i$，因此事先建立快取陣列，降低計算冪次時的重複開銷，達成整體高效能解法。

## 解題步驟

### Step 1：建立快速冪次的快取陣列

在程式載入時，先預先計算所有可能用到的冪次：

```typescript
const MODULUS = 1_000_000_007;
const MAX_INPUT_LENGTH = 100_000;

// 建立 2 的次方快取，用來快速取得 2^i mod MODULUS
const powerOfTwoCache = new Uint32Array(MAX_INPUT_LENGTH);
powerOfTwoCache[0] = 1;
for (let i = 1; i < MAX_INPUT_LENGTH; i++) {
  // 左移相當於乘以2，超過MODULUS則修正以避免使用慢速的取模運算
  const doubled = powerOfTwoCache[i - 1] << 1;
  powerOfTwoCache[i] = doubled >= MODULUS ? doubled - MODULUS : doubled;
}
```

### Step 2：複製並排序原始數字陣列

將原始輸入的陣列複製後排序，方便雙指標計算：

```typescript
// 使用 Int32Array 避免排序函式額外的比較開銷
const sortedNumbers = new Int32Array(nums);
sortedNumbers.sort();
```

### Step 3：使用雙指標法來計算有效子序列數量

初始化雙指標與結果計數器：

```typescript
let leftIndex = 0;                          // 左指標指向目前最小值
let rightIndex = sortedNumbers.length - 1;  // 右指標指向目前最大值
let resultCount = 0;                        // 統計符合條件的子序列數量
```

接著進行雙指標掃描：

```typescript
while (leftIndex <= rightIndex) {
  const currentSum = sortedNumbers[leftIndex] + sortedNumbers[rightIndex];

  if (currentSum > target) {
    // 若總和超過 target，表示目前最大值太大，需要減小範圍
    rightIndex--;
    continue;
  }

  // 此時[leftIndex, rightIndex]區間內的元素皆可自由選取與leftIndex搭配成子序列
  const span = rightIndex - leftIndex;
  resultCount += powerOfTwoCache[span];

  // 若resultCount超過MODULUS，快速調整
  if (resultCount >= MODULUS) {
    resultCount -= MODULUS;
  }

  // 左指標右移，尋找下一個最小值的子序列
  leftIndex++;
}
```

### Step 4：回傳最終結果

```typescript
return resultCount;
```

## 時間複雜度

- 排序操作耗時為 $O(n \log n)$。
- 雙指標遍歷僅需 $O(n)$ 時間。
- 總時間複雜度為 $O(n \log n)$。

> $O(n \log n)$

## 空間複雜度

- 建立排序後陣列需要額外的空間，耗費 $O(n)$。
- 預先計算的冪次快取為固定大小，視作常數空間。
- 總空間複雜度為 $O(n)$。

> $O(n)$
