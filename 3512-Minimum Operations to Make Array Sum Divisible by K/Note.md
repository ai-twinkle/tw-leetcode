# 3512. Minimum Operations to Make Array Sum Divisible by K

You are given an integer array `nums` and an integer `k`. 
You can perform the following operation any number of times:

Select an index `i` and replace `nums[i]` with `nums[i] - 1`.
Return the minimum number of operations required to make the sum of the array divisible by `k`.

**Constraints:**

- `1 <= nums.length <= 1000`
- `1 <= nums[i] <= 1000`
- `1 <= k <= 100`

## 基礎思路

本題的目標是讓整個陣列的總和能被 `k` 整除，而可進行的操作只有一種：
**任意選擇一個元素，並將其減 1。**

核心觀察如下：

* **每次操作都會使總和減少 1**
  無論選擇哪個索引，整體總和都只會減少 1，因此問題可視為：
  *需將總和往下調整到最接近且不超過的 k 倍數。*

* **可被 k 整除等同於餘數為 0**
  若 `sum % k = 0`，則不需任何操作。

* **若餘數為 r，則只需執行 r 次減法即可**
  因為：

  ```
  sum - r ≡ 0 (mod k)
  ```

  將總和減去餘數即可達成整除，且這是最少操作。

* **不需考慮減少哪個元素**
  因為操作對象不影響總和外的任何條件，完全沒有額外約束。

因此，本題不需要複雜資料結構，也不需要動態規劃，只需計算總和的餘數即可直接得出答案。

## 解題步驟

### Step 1：以簡單迴圈累加陣列總和

透過基礎 for-loop 逐一累加所有元素，避免使用高階函式造成額外開銷。

```typescript
// 使用簡單的 for 迴圈累加總和，以避免回呼產生的額外負擔
let totalSum = 0;
for (let index = 0; index < nums.length; index++) {
  totalSum += nums[index];
}
```

### Step 2：計算總和對 k 的餘數

透過 `%` 運算取得總和與最近下方 k 倍數的距離。

```typescript
// 計算總和距離下一個不超過的 k 的倍數還差多少
const remainder = totalSum % k;
```

### Step 3：若已能整除，直接回傳 0

若餘數為 0，代表總和已被 k 整除，不需任何操作。

```typescript
// 若已可整除，則不需任何操作
if (remainder === 0) {
  return 0;
}
```

### Step 4：否則回傳餘數作為最少操作數

若餘數不為 0，將總和減到最近的可整除值所需的操作次數即為餘數。

```typescript
// 若無法整除，最少操作數等於餘數
return remainder;
```

## 時間複雜度

- 需掃描整個陣列一次以累加總和。
- 其餘操作皆為常數時間。
- 總時間複雜度為 $O(n)$。

> $O(n)$

## 空間複雜度

- 僅使用固定數量的變數。
- 無新增額外陣列或資料結構。
- 總空間複雜度為 $O(1)$。

> $O(1)$
