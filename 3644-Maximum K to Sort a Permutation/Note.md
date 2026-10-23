# 3644. Maximum K to Sort a Permutation

You are given an integer array nums of length `n`, 
where nums is a permutation of the numbers in the range `[0..n - 1]`.

You may swap elements at indices `i` and `j` only if `nums[i] AND nums[j] == k`, 
where `AND` denotes the bitwise AND operation and `k` is a non-negative integer.

Return the maximum value of `k` such that the array can be sorted in non-decreasing order using any number of such swaps. 
If `nums` is already sorted, return 0.

**Constraints:**

- `1 <= n == nums.length <= 10^5`
- `0 <= nums[i] <= n - 1`
- `nums` is a permutation of integers from `0` to `n - 1`.

## 基礎思路

本題給定一個由 `0` 到 `n - 1` 組成的排列，只有當兩個元素的位元 AND 恰好等於某個固定值時，才能交換這兩個元素。
我們要找出能讓陣列排序完成的最大固定值；若陣列原本就已排序，則回傳 0。

在思考解法時，可掌握以下核心觀察：

- **已在正確位置的元素不需移動**：
  排列排序後，每個值都應位於與其數值相同的位置。已就位的元素不必參與任何交換，因此不會對答案形成限制。

- **每個錯位元素都必須參與至少一次交換**：
  錯位元素要回到正確位置，一定要與其他元素交換。每次交換都要求兩者的 AND 恰為該固定值，所以該固定值必須是每個錯位元素的位元子集。

- **答案的上界是所有錯位元素的 AND**：
  一個數若要同時是多個數的位元子集，最大只能是這些數的位元 AND，因此答案不可能超過此值。

- **此上界一定可以達成**：
  設此 AND 值為某數。由於輸入是排列，這個數本身也存在於陣列中，而它與任一錯位元素的 AND 恰好等於它自己。因此它可以作為中繼點，與所有錯位元素交換，逐一把它們送回正確位置，最後自己也回到原位。

- **AND 累積值只會單調遞減**：
  一旦累積結果變為 0，後續任何數都無法再改變它，可以提早結束。

依據以上特性，可以採用以下策略：

- **只掃描一次陣列，跳過已就位的元素**。
- **對所有錯位元素持續累積位元 AND**，若中途歸零則直接回傳 0。
- **若完全沒有錯位元素，代表陣列已排序，回傳 0；否則回傳累積結果**。

此策略只需一次線性掃描，就能同時求出答案的上界並確認其可達。

## 解題步驟

### Step 1：取得長度並初始化 AND 累積值

先取得陣列長度，並把累積值初始化為全為 1 的位元值 `-1`。它是位元 AND 的單位元素，與任何數做 AND 都會得到該數本身。

```typescript
const length = nums.length;

// -1 為全 1 位元的單位元素，作為累積位元 AND 的初始值
let misplacedAnd = -1;
```

### Step 2：遍歷陣列並跳過已在正確位置的元素

逐一檢查每個位置上的值。若值等於其索引，代表它已在排序後的位置上，不需要參與交換，直接略過。

```typescript
for (let index = 0; index < length; index++) {
  const value = nums[index];

  // 已位於排序後正確位置的值永遠不需要被交換
  if (value === index) {
    continue;
  }

  // ...
}
```

### Step 3：累積錯位元素的 AND，並在歸零時提早結束

把每個錯位元素併入 AND 累積值。由於 AND 只會讓位元減少，結果一旦為 0 就不會再改變，因此可以直接回傳 0。

```typescript
for (let index = 0; index < length; index++) {
  // Step 2：取得當前值並跳過已就位元素

  misplacedAnd &= value;

  // 0 是答案的下限，剩餘的值皆無法再改變結果
  if (misplacedAnd === 0) {
    return 0;
  }
}
```

### Step 4：處理陣列原本已排序的情況

若累積值仍是初始的 `-1`，代表沒有任何錯位元素，陣列原本就已排序，依題意回傳 0。

```typescript
// 單位元素未被改動，表示沒有任何元素錯位
if (misplacedAnd === -1) {
  return 0;
}
```

### Step 5：回傳所有錯位元素的 AND 作為答案

此時累積值就是所有錯位元素的位元 AND，也就是能完成排序的最大固定值，直接回傳。

```typescript
return misplacedAnd;
```

## 時間複雜度

- 陣列只掃描一次，每個元素做常數次比較與位元運算；
- 最壞情況下需檢查全部 $n$ 個元素。
- 總時間複雜度為 $O(n)$。

> $O(n)$

## 空間複雜度

- 只使用固定數量的變數；
- 不需要額外的陣列或動態空間。
- 總空間複雜度為 $O(1)$。

> $O(1)$
