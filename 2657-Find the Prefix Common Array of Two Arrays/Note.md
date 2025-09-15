# 2657. Find the Prefix Common Array of Two Arrays

You are given two 0-indexed integer permutations `A` and `B` of length `n`.

A prefix common array of `A` and `B` is an array `C` such that `C[i]` is equal to the count of numbers that are present at or before the index `i` in both `A` and `B`.

Return the prefix common array of `A` and `B`.

A sequence of `n` integers is called a permutation if it contains all integers from `1` to `n` exactly once.

**Constraints:**

- `1 <= A.length == B.length == n <= 50`
- `1 <= A[i], B[i] <= n`
- It is guaranteed that `A` and `B` are both a permutation of `n` integers.

## 基礎思路

本題的目標是計算兩個長度皆為 $n$ 的排列 `A` 和 `B`，在每個前綴長度下，同時出現在兩個陣列前綴的共同元素個數，並構造出 prefix common array。

我們可以從以下幾個方面來理解這個問題：

1. **共同元素的定義**

   我們要求的共同元素，必須「同時」出現在 `A` 和 `B` 的前綴（即 $A[0..i]$ 與 $B[0..i]$）內。
   每一個新元素的出現，只有當它在兩個陣列的前綴都已經出現過時，才會使共同元素計數增加。

2. **每個元素的「生效時機」**

   換句話說，對於每一個數字 $x$，它只有在我們遍歷到 $A$ 與 $B$ 中較後面的那個索引時，才會被同時收錄進共同元素集合。
   也就是說，$x$ 真正被算入共同元素，是在 $\max(\text{A中位置},\ \text{B中位置})$ 這個索引之後。

3. **計數方式**

   因此，我們可以對每個數字 $x$，先找出其在 `A` 和 `B` 中出現的位置，然後在 $\max(i, j)$ 這個索引上做一次計數標記，表示這個位置起才有多一個共同元素。
   最後，將這個標記陣列做一次前綴和（prefix sum），就能還原每個索引下的共同元素個數。

4. **優化與限制思考**

   由於 $n$ 最大僅 $50$，我們即使暴力尋找每個數字在 $B$ 中的位置，整體複雜度仍可接受。
   這讓我們可專注於正確理解計數邏輯，避免遺漏某些共同元素的「首次共同出現」時機。

## 解題步驟

### Step 1：初始化與資料結構

```typescript
const arrayLength = A.length;                        // 取得陣列長度 n
const prefixCommonCount = new Array(arrayLength).fill(0); // 紀錄每個索引位置從該位置後才開始計入的共同元素數量
```

### Step 2：標記每個元素在 A、B 中最後出現的索引

```typescript
for (let currentIndex = 0; currentIndex < arrayLength; currentIndex++) {
  // 在 B 中找到 A[i] 的索引位置
  const indexInArrayB = B.indexOf(A[currentIndex]);
  
  // （對於排列而言，indexOf 一定能找到，所以這裡檢查可省略，但為通用做法保留）
  if (indexInArrayB === -1) {
    continue;
  }
  
  // 元素真正對共同計數生效的最小索引
  const maxIndex = Math.max(currentIndex, indexInArrayB);
  // 從 maxIndex 開始，這個元素才算作共同元素
  prefixCommonCount[maxIndex]++;
}
```

### Step 3：累積計算 prefix common array

```typescript
for (let currentIndex = 1; currentIndex < arrayLength; currentIndex++) {
  // 累積前面所有位置標記的共同元素數
  prefixCommonCount[currentIndex] += prefixCommonCount[currentIndex - 1];
}
```

### Step 4：回傳結果

```typescript
return prefixCommonCount;
```

## 時間複雜度

- 外層迴圈跑 $n$ 次，每次呼叫 `indexOf` 要掃描長度為 $n$ 的陣列，為 $O(n)$，合計 $O(n \times n)$。
- 再加上一個長度為 $n$ 的累積迴圈 $O(n)$，但主項仍為 $O(n \times n)$。
- 總時間複雜度為 $O(n \times n)$。

> $O(n \times n)$

## 空間複雜度

- 使用一個長度為 $n$ 的輔助陣列 `prefixCommonCount`，額外空間為 $O(n)$。
- 其他變數僅佔用常數空間。
- 總空間複雜度為 $O(n)$。

> $O(n)$
