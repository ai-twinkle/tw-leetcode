# 3432. Count Partitions with Even Sum Difference

You are given an integer array nums of length `n`.

A partition is defined as an index `i` where `0 <= i < n - 1`, splitting the array into two non-empty subarrays such that:

- Left subarray contains indices `[0, i]`.
- Right subarray contains indices `[i + 1, n - 1]`.

Return the number of partitions where the difference between the sum of the left and right subarrays is even.

**Constraints:**

- `2 <= n == nums.length <= 100`
- `1 <= nums[i] <= 100`

## 基礎思路

本題要求找出所有合法的切分位置，使左右兩段子陣列的總和差值為偶數。由於差值是否為偶數，完全取決於左右兩段總和的奇偶性關係，因此可將問題轉化為更簡潔的觀察：

* **奇偶性由總和決定，而非數值大小**
  左、右子陣列總和之差為偶數，意味著兩者必須同為奇數或同為偶數。

* **左右總和之和恰為全陣列總和**
  設左子陣列總和為 `L`、右子陣列總和為 `R`，則 `L + R = T`（全陣列總和）。
  若要 `L - R` 為偶數，即 `L` 與 `R` 奇偶相同，表示 `T` 必為偶數。

* **若 T 為奇數，不可能存在合法切分**
  因為奇數無法由兩個同奇偶性的整數相加而得。

* **若 T 為偶數，所有切分位置皆有效**
  一旦 T 為偶數，無論切在何處（只要左右皆非空），左右子陣列總和奇偶性必然相同，因此所有 `0..n-2` 的切分都成立。

因此整體策略為：

* **先檢查總和是否為偶數**；若為奇數，答案必為 0。
* **若為偶數，所有合法切分（n−1 個）均可計入答案**。

此方法能將問題化為奇偶性判斷，大幅簡化運算。

## 解題步驟

### Step 1：計算整體總和

透過單次迴圈累加陣列中所有元素，以取得全陣列總和。

```typescript
const length = nums.length;

// 單次遍歷陣列以計算總和
let totalSum = 0;
for (let index = 0; index < length; index++) {
  totalSum += nums[index];
}
```

### Step 2：檢查總和奇偶性，若為奇數則無任何有效切分

若總和為奇數，則左右兩邊不可能同奇偶，差值必為奇數，因此需直接回傳 0。

```typescript
// 若總和為奇數，則不存在差值為偶數的切分
if ((totalSum & 1) !== 0) {
  return 0;
}
```

### Step 3：總和為偶數時，所有切分皆有效，回傳切分數量

總和為偶數表示任意切點皆能形成偶數差值，因此切分數為 `length - 1`。

```typescript
// 若總和為偶數，所有切分點皆有效
return length - 1;
```

## 時間複雜度

- 單次掃描陣列計算總和。
- 其餘操作皆為常數時間。
- 總時間複雜度為 $O(n)$。

> $O(n)$

## 空間複雜度

- 僅使用固定數量變數。
- 無額外陣列或動態空間。
- 總空間複雜度為 $O(1)$。

> $O(1)$
