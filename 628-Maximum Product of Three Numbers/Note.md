# 628. Maximum Product of Three Numbers

Given an integer array `nums`, 
find three numbers whose product is maximum and return the maximum product.

**Constraints:**

- `3 <= nums.length <= 10^4`
- `-1000 <= nums[i] <= 1000`

## 基礎思路

本題要求從一個整數陣列中挑出三個數字，使其乘積最大，並回傳此最大乘積。由於陣列中同時包含正數與負數，最大乘積不一定來自數值最大的三個數字。

在思考解法時，可掌握以下核心觀察：

- **負數的乘積可能為正**：
  兩個負數相乘會得到正數，因此若陣列中存在絕對值較大的負數，兩個最小的負數搭配一個最大的正數，可能產生比三個最大正數更大的乘積。

- **最大乘積僅有兩種可能來源**：
  其一為三個最大值的乘積；其二為兩個最小值（可能為負）與最大值的乘積。除此之外的組合皆不可能勝出。

- **無須完整排序即可求解**：
  由於只關心少數幾個極值，僅需在一次線性掃描中追蹤三個最大值與兩個最小值，即可避免排序帶來的額外開銷。

依據以上特性，可以採用以下策略：

- **單次遍歷陣列**，同步維護三個最大值與兩個最小值。
- **每次更新極值時，將被擠下的舊值向後遞補**，以保持極值排序的正確性。
- **最終比較兩種候選乘積並取較大者回傳**。

此策略能在線性時間內完成求解，效率良好且邏輯簡潔。

## 解題步驟

### Step 1：初始化極值追蹤變數

先宣告三個最大值與兩個最小值的追蹤變數；最大值初始化為負無限大，最小值初始化為正無限大，以確保任何實際數值都能正確更新它們。

```typescript
// 追蹤三個最大值與兩個最小值，於單次遍歷中完成以避免 O(n log n) 排序
let max1 = -Infinity;
let max2 = -Infinity;
let max3 = -Infinity;
let min1 = Infinity;
let min2 = Infinity;

const length = nums.length;
```

### Step 2：遍歷陣列並更新三個最大值

透過迴圈逐一取出每個數值；當某數值大於目前的最大值時，將原本的最大值逐級向下遞補，藉此維持三個最大值的正確排序。

```typescript
for (let index = 0; index < length; index++) {
  const value = nums[index];

  // 更新三個最大值，將被擠下的舊值向下遞補
  if (value > max1) {
    max3 = max2;
    max2 = max1;
    max1 = value;
  } else if (value > max2) {
    max3 = max2;
    max2 = value;
  } else if (value > max3) {
    max3 = value;
  }

  // ...
}
```

### Step 3：於同一輪迴圈中更新兩個最小值

在同一次遍歷中，同步比較目前數值是否小於已知的最小值；若是，則將被擠下的舊值向上遞補，以維持兩個最小值的正確排序。

```typescript
for (let index = 0; index < length; index++) {
  // Step 2：更新三個最大值

  // 更新兩個最小值，將被擠下的舊值向上遞補
  if (value < min1) {
    min2 = min1;
    min1 = value;
  } else if (value < min2) {
    min2 = value;
  }
}
```

### Step 4：計算兩種候選乘積

遍歷結束後，分別計算兩種可能的最大乘積：一為三個最大值相乘；二為兩個最小值（可能為負）與最大值相乘。

```typescript
// 最大乘積來自三個最大值，或兩個最小的負數乘以最大值
const productOfLargest = max1 * max2 * max3;
const productOfSmallestPair = min1 * min2 * max1;
```

### Step 5：回傳較大的乘積

比較兩種候選乘積，取其中較大者作為最終答案回傳。

```typescript
return productOfLargest > productOfSmallestPair ? productOfLargest : productOfSmallestPair;
```

## 時間複雜度

- 僅需單次遍歷陣列，長度為 `n`；
- 每個元素的比較與更新皆為常數時間操作。
- 總時間複雜度為 $O(n)$。

> $O(n)$

## 空間複雜度

- 僅使用固定數量的極值追蹤變數；
- 無任何額外陣列或動態配置的空間。
- 總空間複雜度為 $O(1)$。

> $O(1)$
