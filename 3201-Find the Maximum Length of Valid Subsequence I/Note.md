# 3201. Find the Maximum Length of Valid Subsequence I

You are given an integer array `nums`.
A subsequence `sub` of `nums` with length `x` is called valid if it satisfies:

- `(sub[0] + sub[1]) % 2 == (sub[1] + sub[2]) % 2 == ... == (sub[x - 2] + sub[x - 1]) % 2.`

Return the length of the longest valid subsequence of `nums`.

A subsequence is an array that can be derived from another array by deleting some or no elements without changing the order of the remaining elements.

**Constraints:**

- `2 <= nums.length <= 2 * 10^5`
- `1 <= nums[i] <= 10^7`

## 基礎思路

本題的核心在於找出一個最長的子序列，滿足每對相鄰元素 $(sub[i-1], sub[i])$ 的「和」模 $2$ 結果都一致。這等同於子序列所有相鄰數對的「奇偶性規律」需一致。經觀察，有兩種可能使得這個條件成立：

1. **全同奇偶序列**：所有數都為奇數，或所有數都為偶數（這時所有 $(a+b)%2$ 都為偶數）。
2. **交錯奇偶序列**：奇、偶數交錯出現，且每對和的奇偶性皆為 $1$（這時所有 $(a+b)%2$ 都為奇數）。

因此，本題可拆成兩種解法分別求解：

- **同奇偶最大子序列長度**（全部取偶數或全部取奇數）
- **奇偶交錯最大子序列長度**（類似找最長 zig-zag 子序列）

最終答案則取這兩種情況的最大值。

## 解題步驟

### Step 1：初始化變數

首先先準備好相關變數以記錄計算狀態：

```typescript
const n = nums.length;

// 用來計算全為偶數或全為奇數的子序列長度
let evenCount = 0;  // 記錄偶數的數量
let oddCount = 0;   // 記錄奇數的數量

// 用來動態規劃紀錄奇偶交錯子序列的狀態
let bestEndEven = 0;  // 目前遇到的最大以偶數結尾的交錯子序列長度
let bestEndOdd = 0;   // 目前遇到的最大以奇數結尾的交錯子序列長度
```

### Step 2：遍歷每個元素並更新狀態

逐一檢查每個元素，並依據奇偶性分別更新對應統計及動態規劃狀態：

```typescript
for (let i = 0; i < n; ++i) {
  // 以位元運算檢查 nums[i] 是否為偶數
  const isEven = (nums[i] & 1) === 0; // isEven 為 true 代表偶數

  if (isEven) {
    evenCount++; // 遇到偶數就累加

    // 此偶數可接在任何「以奇數結尾」的交錯序列之後，形成更長的交錯序列
    const extendLength = bestEndOdd + 1;
    if (extendLength > bestEndEven) {
      bestEndEven = extendLength; // 若能變長就更新
    }
  } else {
    oddCount++; // 遇到奇數就累加

    // 此奇數可接在任何「以偶數結尾」的交錯序列之後
    const extendLength = bestEndEven + 1;
    if (extendLength > bestEndOdd) {
      bestEndOdd = extendLength; // 若能變長就更新
    }
  }
}
```

### Step 3：取兩種情境最大值作為答案

最後，我們需要比較「全同奇偶」和「奇偶交錯」兩種情境的最大長度，輸出答案：

```typescript
// 全同奇偶子序列長度取最大
const bestSameParity = evenCount > oddCount ? evenCount : oddCount;

// 奇偶交錯子序列長度取最大
const bestAlternating = bestEndEven > bestEndOdd ? bestEndEven : bestEndOdd;

// 回傳兩者的最大值
return bestSameParity > bestAlternating ? bestSameParity : bestAlternating;
```

## 時間複雜度

- 只需遍歷一次陣列，每步操作皆為 $O(1)$。
- 總時間複雜度為 $O(n)$。

> $O(n)$

## 空間複雜度

- 只使用了數個計數與狀態變數，額外空間開銷為常數。
- 總空間複雜度為 $O(1)$。

> $O(1)$
