# 2657. Find the Prefix Common Array of Two Arrays

You are given two 0-indexed integer permutations A and B of length n.

A prefix common array of A and B is an array C such that C[i] is equal to the count of numbers that are present at or before the index i in both A and B.

Return the prefix common array of A and B.

A sequence of n integers is called a permutation if it contains all integers from 1 to n exactly once.

## 基礎思路
所謂的 prefix common array，是指在兩個陣列中，從起始位置到索引 $i$ 為止，兩個陣列中共有的元素數量。
直觀地說，對於任意數字 $k$，如果它是兩個陣列的共同元素，那麼它的影響將從其在兩個陣列中最後出現的索引開始，計入 prefix common array 的計數。
我們可以透過在這些索引位置上增加計數來記錄有多少個元素是從該索引位置後變成共同元素的。 
隨後累積這些計數值即可得到每個索引位置對應的 prefix common array 的值。

## 解題步驟

### Step 1: 計算每個索引位置的有多少個元素是從該索引位置後變成共同元素

```typescript
// 紀錄每個索引位置
const prefixCommonCount = new Array(arrayLength).fill(0);

// 由於 A, B, prefixCommonCount 長度皆為 n，因此我們可以透過迴圈遍歷所有元素
for (let currentIndex = 0; currentIndex < arrayLength; currentIndex++) {
  // 找到元素在 B 中的索引位置
  const indexInArrayB = arrayB.indexOf(arrayA[currentIndex]);

  // 如果元素不在 B 中，則跳過
  if (indexInArrayB === -1) {
    continue;
  }

  // 找尋最後出現的索引位置 (即當前索引位置或是在 B 中的索引位置)
  const maxIndex = Math.max(currentIndex, indexInArrayB);
  
  // 將該索引位置計數值加一
  prefixCommonCount[maxIndex]++;
}
```
此時的 `prefixCommonCount` 陣列為在索引位置 `i` 有多少個元素是從該索引位置後變成共同元素的。
但是題目要求的是從起始位置到索引 `i` 為止，兩個陣列中共有的元素數量，因此我們需要將這些計數值進行累積。

### Step 2: 累積計數值

```typescript
// 計算 prefix sum
for (let currentIndex = 1; currentIndex < arrayLength; currentIndex++) {
  prefixCommonCount[currentIndex] += prefixCommonCount[currentIndex - 1];
}
```

## 時間複雜度
由於我們需要遍歷兩個陣列，來檢查每個元素是否為共同元素，因此時間複雜度為 $O(n \cdot n)$。

> $O(n \cdot n)$

## 空間複雜度
我們需要額外的空間來儲存 prefix common array 的計數值，因此空間複雜度為 $O(n)$。
