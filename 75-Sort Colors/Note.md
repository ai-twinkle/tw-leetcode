# 75. Sort Colors

Given an array `nums` with `n` objects colored red, white, or blue, sort them in-place so that objects of the same color are adjacent, with the colors in the order red, white, and blue.

We will use the integers `0`, `1`, and `2` to represent the color red, white, and blue, respectively.

You must solve this problem without using the library's sort function.

**Constraints:**

- `n == nums.length`
- `1 <= n <= 300`
- `nums[i]` is either `0`, `1`, or `2`.

## 基礎思路

題目給定一個由三種顏色（紅、白、藍）組成的陣列，以數字 0、1、2 分別表示這些顏色，要求我們將陣列原地排序，使得相同顏色相鄰，並且按照紅（0）、白（1）、藍（2）的順序排列。

由於題目限制我們不能使用函式庫提供的排序函式，因此應當優先考慮以下策略：

1. **統計各個顏色的出現次數**：
   由於只有三種顏色，透過一次遍歷即可計算各顏色出現的次數。
2. **原地重新填入數字**：
   根據統計的顏色次數，依序填回 0、1、2，實現原地排序。

此方法即為經典的 **計數排序（Counting Sort）** 思路，適用於範圍有限的排序問題。

## 解題步驟

### Step 1: 初始化變數，統計顏色數量

首先，定義變數：

- `lengthOfArray` 紀錄原始陣列的長度。
- `zeroCount` 用來統計紅色（0）的數量。
- `oneCount` 用來統計白色（1）的數量。

```typescript
const lengthOfArray = nums.length;
let zeroCount = 0;
let oneCount = 0;
```

接著透過一次遍歷，統計 0 與 1 的數量（2 的數量可直接從總數推導，不需額外統計）：

```typescript
for (let index = 0; index < lengthOfArray; index++) {
  const currentValue = nums[index];
  if (currentValue === 0) {
    zeroCount++;
  } else if (currentValue === 1) {
    oneCount++;
  }
  // 若為 2，則直接略過，因為稍後可透過推導得知其數量
}
```

### Step 2: 計算分段位置，準備原地填入

根據上一步計算的數量，我們可決定：

- `firstPartitionEnd`：紅色區間（0）的結束位置。
- `secondPartitionEnd`：白色區間（1）的結束位置。

```typescript
const firstPartitionEnd = zeroCount;
const secondPartitionEnd = zeroCount + oneCount;
```

### Step 3: 原地填回數字以完成排序

最後，根據上述分界點，透過原地填入的方式完成排序：

- `[0, firstPartitionEnd)` 區間填入 0（紅色）
- `[firstPartitionEnd, secondPartitionEnd)` 區間填入 1（白色）
- `[secondPartitionEnd, lengthOfArray)` 區間填入 2（藍色）

```typescript
nums.fill(0, 0, firstPartitionEnd); // 填入紅色
nums.fill(1, firstPartitionEnd, secondPartitionEnd); // 填入白色
nums.fill(2, secondPartitionEnd, lengthOfArray); // 填入藍色
```

## 時間複雜度

- **第一次遍歷**：僅需遍歷所有元素一次，複雜度為 $O(n)$。
- **原地填回**：使用 `.fill()` 填入所有元素一次，複雜度為 $O(n)$。
- 總時間複雜度為 $O(n)$。

> $O(n)$

## 空間複雜度

- **額外變數**：僅使用常數個計數與區間變數，不受輸入規模影響，空間複雜度為 $O(1)$。
- 排序過程完全在原陣列操作，不需要額外陣列。
- 總空間複雜度為 $O(1)$。

> $O(1)$
