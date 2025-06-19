# 2294. Partition Array Such That Maximum Difference Is K

You are given an integer array `nums` and an integer `k`. 
You may partition `nums` into one or more subsequences such that each element in `nums` appears in exactly one of the subsequences.

Return the minimum number of subsequences needed such that the difference between the maximum and minimum values in each subsequence is at most `k`.

A subsequence is a sequence that can be derived from another sequence by deleting some or no elements without changing the order of the remaining elements.

**Constraints:**

- `1 <= nums.length <= 10^5`
- `0 <= nums[i] <= 10^5`
- `0 <= k <= 10^5`

## 基礎思路

本題要求將給定的整數陣列 `nums` 分割成數個子序列，使得每個子序列內元素的最大值與最小值之差不超過給定的數值 `k`，且希望子序列數量盡可能地少。

要滿足上述條件，直觀的想法是：

1. **排序並分組**：
   若陣列已排序，則相鄰元素若差值超過 `k`，必須開新子序列。
2. **值域映射**：
   若陣列中數字的範圍較小，可考慮用值域陣列來加速判斷差值的情形。

因此，我們可以採用以下步驟來解決問題：

- **先遍歷一次陣列找出最大最小值**，確定值域範圍。
- **使用值域映射記錄元素存在與否**，加速後續檢查。
- **從最小值到最大值逐一判斷差值是否超過 `k`**，貪心地分割子序列。

此貪心策略保證在排序後可達到最小子序列數量。

## 解題步驟

### Step 1：邊界情況判斷

首先處理特例，陣列元素數量為 0 或 1 的情況，這些情況的答案已顯而易見。

```typescript
const length = nums.length;
if (length <= 1) {
  // 若數量為0或1，子序列數等於數量本身
  return length;
}
```

### Step 2：尋找整個陣列的最大與最小值

為了後續的範圍檢查，需取得最大和最小的元素值。

```typescript
let minimumValue = nums[0];
let maximumValue = nums[0];
for (let i = 1; i < length; i++) {
  const value = nums[i];
  if (value < minimumValue) {
    minimumValue = value;
  } else if (value > maximumValue) {
    maximumValue = value;
  }
}
```

### Step 3：確認是否只需要一個子序列

如果整個陣列內的元素差距小於等於 `k`，則整個陣列只需一個子序列即可。

```typescript
if (maximumValue - minimumValue <= k) {
  return 1;
}
```

### Step 4：建立值域映射陣列

使用 Uint8Array 陣列標記陣列內的數字是否出現過，以便快速查詢。

```typescript
const presenceArray = new Uint8Array(maximumValue + 1);
for (let i = 0; i < length; i++) {
  presenceArray[nums[i]] = 1;
}
```

### Step 5：貪心地掃描值域以計算子序列數量

從最小值向最大值掃描，當遇到元素差距超過 `k` 時，便須增加一個新的子序列。

```typescript
let subsequenceCount = 1;
let currentSegmentStart = minimumValue;

for (let value = minimumValue; value <= maximumValue; value++) {
  if (presenceArray[value]) {
    // 若當前值與當前子序列起點差距超過 k，開新子序列
    if (value - currentSegmentStart > k) {
      subsequenceCount++;
      currentSegmentStart = value;
    }
  }
}

return subsequenceCount;
```

## 時間複雜度

- 找最大最小值、建立映射陣列皆須掃描陣列一次，為 $O(n)$。
- 掃描值域需要遍歷從最小值到最大值的區間，最差情況可能達值域範圍為 $U$。
- 總時間複雜度為 $O(n + U)$。

> $O(n + U)$

## 空間複雜度

- 使用一個值域大小的 `presenceArray`，空間使用為 $O(U)$。
- 其他輔助變數的空間為常數 $O(1)$。
- 總空間複雜度為 $O(U)$。

> $O(U)$
