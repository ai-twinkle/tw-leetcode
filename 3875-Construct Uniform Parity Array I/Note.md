# 3875. Construct Uniform Parity Array I

You are given an array nums1 of `n` distinct integers.

You want to construct another array `nums2` of length `n` such that the elements in `nums2` are either all odd or all even.

For each index `i`, you must choose exactly one of the following (in any order):

- `nums2[i] = nums1[i]`
- `nums2[i] = nums1[i] - nums1[j]`, for an index `j != i`

Return `true` if it is possible to construct such an array, otherwise, return `false`.

**Constraints:**

- `1 <= n == nums1.length <= 100`
- `1 <= nums1[i] <= 100`
- `nums1` consists of distinct integers.

## 基礎思路

本題給定一個由相異整數組成的陣列，要求建構出一個等長的新陣列，使其所有元素的奇偶性一致（全為奇數或全為偶數）。每個位置可選擇沿用原值，或以原值減去另一個位置的值。表面上看似需要搜尋各種組合，但只要從奇偶性的角度切入，即可發現答案其實是恆定的。

在思考解法時，可掌握以下核心觀察：

- **只有奇偶性會影響結果**：
  題目的目標僅要求奇偶一致，數值本身的大小完全無關；因此整個問題可退化為對每個元素「奇或偶」的討論。

- **減法對奇偶性的作用是固定的**：
  偶數減奇數會變為奇數，奇數減奇數會變為偶數，而減去偶數則不改變原本的奇偶性。換言之，唯有「減去一個奇數」能翻轉奇偶性。

- **只要存在任一奇數，即可全部湊成奇數**：
  在此情況下，原本是奇數的位置直接沿用；原本是偶數的位置減去該奇數即可翻轉為奇數。由於兩者奇偶性相異，必為不同位置，索引互異的限制自然成立。

- **若完全沒有奇數，則所有元素本來就是偶數**：
  此時無須任何操作，直接沿用原值即已滿足全為偶數的條件。

- **單一元素的情況同樣成立**：
  只有一個元素時無法選擇其他索引，但沿用原值本身必定滿足奇偶一致。

依據以上特性，可以歸納出結論：

- **不論輸入內容為何，只要陣列非空，必定能建構出合法的結果**。
- 由於題目的約束已保證陣列長度至少為 1，因此答案恆為成立。

此結論使得整體實作退化為一個常數時間的判斷，無須任何搜尋或列舉。

## 解題步驟

### Step 1：依奇偶性推論直接回傳結果

由前述分析可知，只要陣列非空即必然可以完成建構，而題目約束已保證此前提，因此直接回傳成立即可。

```typescript
// 約束條件保證陣列非空，因此建構必定能成功。
return nums1.length >= 1;
```

## 時間複雜度

- 僅進行一次長度比較，不需遍歷任何元素；
- 所有操作皆為常數時間。
- 總時間複雜度為 $O(1)$。

> $O(1)$

## 空間複雜度

- 未配置任何額外的陣列或輔助結構；
- 僅回傳單一布林結果。
- 總空間複雜度為 $O(1)$。

> $O(1)$
