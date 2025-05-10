# 2918. Minimum Equal Sum of Two Arrays After Replacing Zeros

You are given two arrays `nums1` and `nums2` consisting of positive integers.

You have to replace all the `0`'s in both arrays with strictly positive integers such that the sum of elements of both arrays becomes equal.

Return the minimum equal sum you can obtain, or `-1` if it is impossible.

**Constraints:**

- `1 <= nums1.length, nums2.length <= 10^5`
- `0 <= nums1[i], nums2[i] <= 10^6`

## 基礎思路

題目給定兩個包含正整數及 `0` 的陣列 `nums1` 與 `nums2`，要求將所有的 `0` 替換成嚴格正整數，使得兩個陣列的元素總和相等，並使該相等總和盡可能小。

要達成這個目標，我們需觀察以下三個要點：

1. **最小替換策略**
   為了讓總和盡可能地小，我們將所有的 `0` 都替換為最小的嚴格正整數 `1`。
   替換後，我們可分別得到兩個陣列的最小可能總和，分別記為：

   $$
   \text{minimalSum1},\; \text{minimalSum2}
   $$

2. **確定目標總和**
   兩個陣列的總和要相等，因此目標總和至少需達到兩個最小總和中的較大者，即：

   $$
   \text{target} = \max(\text{minimalSum1},\;\text{minimalSum2})
   $$

3. **檢查是否可行**
   在決定目標總和後，如果任一個陣列沒有任何 `0`，表示我們無法透過替換增加該陣列的總和。
   若此時該陣列的總和仍小於目標值，即無法達成題目的要求，答案即為 `-1`。

最後，我們只需遍歷兩個陣列各一次，紀錄非零元素的總和及零的數量，即可快速求解。

## 解題步驟

### Step 1：追蹤非零元素總和與零的數量

初始化所需變數，紀錄非零元素總和及零元素個數：

```typescript
// 1. 追蹤每個陣列中非零元素的總和以及 0 的數量
let sumWithoutZeros1 = 0;
let sumWithoutZeros2 = 0;
let zeroCount1 = 0;
let zeroCount2 = 0;
```

### Step 2：第一次遍歷 `nums1`

第一次遍歷陣列 `nums1`，統計非零元素總和與 `0` 的個數：

```typescript
// 2. 第一次遍歷 nums1，累加非零值並統計 0 的數量
for (let i = 0, n = nums1.length; i < n; ++i) {
  const v = nums1[i];
  if (v === 0) {
    zeroCount1++;
  } else {
    sumWithoutZeros1 += v;
  }
}
```

### Step 3：第二次遍歷 `nums2`

第二次遍歷陣列 `nums2`，執行相同的操作：

```typescript
// 3. 第二次遍歷 nums2，執行相同的累加與 0 統計邏輯
for (let i = 0, n = nums2.length; i < n; ++i) {
  const v = nums2[i];
  if (v === 0) {
    zeroCount2++;
  } else {
    sumWithoutZeros2 += v;
  }
}
```

### Step 4：計算最小可達成的總和

將所有的 `0` 都替換為 `1`，計算出兩個陣列各自最小可能的總和：

```typescript
// 4. 將每個 0 替換為 1，計算替換後的最小總和
const minimalSum1 = sumWithoutZeros1 + zeroCount1;
const minimalSum2 = sumWithoutZeros2 + zeroCount2;
```

### Step 5：選擇共同的目標總和

從兩個最小總和中選擇較大的作為最小可能的目標總和：

```typescript
// 5. 選擇兩者中的較大者作為最小可達成的相等總和目標
const target = minimalSum1 > minimalSum2 ? minimalSum1 : minimalSum2;
```

### Step 6：不可行性檢查

檢查此目標是否可行，若不可能則立即回傳 `-1`：

```typescript
// 6. 不可行性檢查：
//    如果某陣列沒有 0，且其非零總和 < 目標值，則無法提升至該目標
if (
  (zeroCount1 === 0 && target > sumWithoutZeros1) ||
  (zeroCount2 === 0 && target > sumWithoutZeros2)
) {
  return -1;
}
```

### Step 7：回傳結果

若通過檢查，表示目標可達成，直接回傳該目標：

```typescript
// 7. 否則，該目標即為最小可達成的相等總和
return target;
```

## 時間複雜度

- 兩次遍歷長度分別為 $n$ 和 $m$ 的陣列，時間為 $O(n)$ 與 $O(m)$。
- 總時間複雜度為 $O(n + m)$。

> $O(n + m)$

## 空間複雜度

- 只使用常數個輔助變數，空間複雜度為 $O(1)$。
- 總空間複雜度為 $O(1)$。

> $O(1)$
