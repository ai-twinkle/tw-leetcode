# 2425. Bitwise XOR of All Pairings

You are given two 0-indexed arrays, nums1 and nums2, consisting of non-negative integers. 
There exists another array, nums3, which contains the bitwise XOR of all pairings of integers between nums1 and nums2 
(every integer in nums1 is paired with every integer in nums2 exactly once).

Return the bitwise XOR of all integers in nums3.

## 基礎思路
1. 交換律和結合律：
   $$
   A⊕B=B⊕A
   $$
   $$
   A⊕(B⊕C)=(A⊕B)⊕C
   $$
2. 自反性：
   $$
   A⊕A=0
   $$
   $$
   A⊕0=A
   $$

3. 令 num1 = $[A1, A2, A3, ..., An]$, num2 = $[B1, B2, B3, ..., Bm]$，
   則回傳值為：
   $$
   (A1⊕B1)⊕(A1⊕B2)⊕...⊕(An⊕Bm)
   $$
4. 根據交換率與結合率，上式可以簡化為：
   $$
   A1⊕A1⊕...⊕An⊕An⊕B1⊕B1⊕...⊕Bm⊕Bm
   $$
   其中 A 元素出現 m 次，B 元素出現 n 次。
5. 我們事實上只需在 m 是奇數時計算 A 的 XOR 值，n 是奇數時計算 B 的 XOR 值，其餘情況下 XOR 值為 0。
   這大幅簡化了計算過程。


## 解題步驟

### Step 1: 若 nums2 長度為奇數，則計算 nums1 的 XOR 值

```typescript
let result = 0;

if (nums2.length % 2 === 1) {
  for (const num of nums1) {
    result ^= num;
  }
}
```

### Step 2: 若 nums1 長度為奇數，則接續計算 nums2 的 XOR 值

```typescript
if (nums1.length % 2 === 1) {
  for (const num of nums2) {
    result ^= num;
  }
}
```
    

## 時間複雜度
最差情況下，時間複雜度為 O(n + m)，其中 n 為 nums1 長度，m 為 nums2 長度。

> $O(n + m)$

## 空間複雜度
由於僅使用常數暫存空間，空間複雜度為 O(1)。
