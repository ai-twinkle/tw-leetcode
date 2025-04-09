# 3375. Minimum Operations to Make Array Values Equal to K

You are given an integer array `nums` and an integer `k`.

An integer `h` is called valid if all values in the array that are strictly greater than `h` are identical.

For example, if `nums = [10, 8, 10, 8]`, 
a valid integer is `h = 9` because all `nums[i] > 9` are equal to `10`, 
but `5` is not a valid integer.

You are allowed to perform the following operation on `nums`:

- Select an integer `h` that is valid for the current values in `nums`.
- For each index i where `nums[i] > h`, set `nums[i]` to `h`.

Return the minimum number of operations required to make every element in `nums` equal to `k`. 
If it is impossible to make all elements equal to `k`, return -1.

## 基礎思路

本題要求透過有限次的操作，使陣列中所有元素的值都等於給定的數值 `k`，每次操作的限制為：

- 選擇一個合法的整數 `h`，將所有大於 `h` 的元素設為 `h`。
- 合法整數 `h` 必須滿足：陣列中所有嚴格大於 `h` 的數值完全相同。

我們可透過分析題目發現以下重要特點：

1. 若陣列中存在任何元素小於 `k`，則不可能透過操作將該元素提升至 `k`，因此直接返回 `-1`。
2. 為了使所有元素最後等於 `k`，我們必須逐步降低大於 `k` 的元素，最終使所有數值降至剛好等於 `k`。
3. 每次操作可將某些嚴格大於 `k` 的數值一次性降低到一個合法的整數 `h`，此過程中，每次選擇的 `h` 實際上就是將比 `h` 大的最大元素逐步降至等於次大的元素，直到所有元素降至等於 `k`。

因此，本題的最佳解法便是：

- 統計陣列中所有大於 `k` 的元素數值共有幾種。
- 將每一種不同的數值依序降到較小的數值，每一次操作即可處理一種數值。
- 最終需要的操作次數即為陣列中大於 `k` 的**不同數值個數**。

## 解題步驟

### Step 1：初始化與資料結構

我們使用一個 `Set` 來記錄所有嚴格大於 `k` 的元素，以統計需要的操作次數。

```typescript
// 初始化Set，追蹤所有大於k的不同數值
const seen = new Set<number>();
```

### Step 2：遍歷陣列並檢查元素

逐一檢查陣列中的每個數字：

- 若發現有數值小於 `k`，表示無法完成任務，直接返回 `-1`。
- 若數值大於 `k` 且尚未記錄在Set中，則將其加入Set，表示這個數值未來需要進行一次降級操作。

實際程式碼：

```typescript
for (let i = 0; i < nums.length; i++) {
  const num = nums[i];

  // 檢查是否有數值小於k
  if (num < k) {
    return -1; // 存在數值小於k，不可能完成任務
  }

  // 若數值大於k且尚未出現過，加入Set
  if (num > k && !seen.has(num)) {
    seen.add(num);
  }
}
```

### Step 3：計算並返回最少操作次數

經過遍歷後，`seen` 裡記錄的元素數量，即為需要將大於 `k` 的不同數值逐步降到 `k` 的次數，也就是答案：

```typescript
// 最終返回大於k的數值種類，即為操作次數
return seen.size;
```

## 時間複雜度

- **遍歷整個陣列一次**，每次操作為常數時間（Set加入和查詢均為 $O(1)$）。
- 總時間複雜度為 $O(n)$。

> $O(n)$

## 空間複雜度

- 使用Set最多可能記錄全部元素（最差情況每個元素都不同且大於k），因此額外空間最多為 $O(n)$。
- 其他額外變數僅佔常數空間，$O(1)$。
- 總空間複雜度為 $O(n)$。

> $O(n)$
