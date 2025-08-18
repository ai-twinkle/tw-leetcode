# 594. Longest Harmonious Subsequence

We define a harmonious array as an array where the difference between its maximum value and its minimum value is exactly 1.

Given an integer array nums, return the length of its longest harmonious subsequence among all its possible subsequences.

**Constraints:**

- `1 <= nums.length <= 2 * 10^4`
- `-10^9 <= nums[i] <= 10^9`

## 基礎思路

本題要找出最長的和諧子序列，和諧子序列的定義是子序列中的最大值與最小值之差恰好為 1。

因此，高階策略是先將整個陣列排序，這樣做有一個很大的好處：具有相同數值或相鄰數值的元素都會聚集在一起，方便透過滑動視窗（雙指標法）快速找到最大值與最小值差為 1 的最長連續區段（即所求的最長和諧子序列）。

透過雙指標的移動，我們能以線性掃描方式快速找到最長的和諧區段，避免枚舉所有子序列的高昂成本。

## 解題步驟

### Step 1：處理特殊情況

首先檢查輸入的陣列元素數量是否小於 2，因為少於兩個元素的陣列無法構成和諧子序列，直接回傳 0：

```typescript
const totalItemsCount = nums.length;
if (totalItemsCount < 2) {
  return 0;
}
```

### Step 2：排序陣列

將原陣列複製成 `Int32Array`，透過原生方法排序，這樣能有效提高排序速度：

```typescript
// 1. 複製到 32 位元型別陣列，並使用原生程式碼排序
const sortedItems = new Int32Array(nums);
sortedItems.sort();
```

### Step 3：透過雙指標掃描尋找最長和諧子序列

接著設定兩個指標：

- 左指標 `leftPointer` 指向目前視窗最小值。
- 右指標 `rightPointer` 從左往右掃描視窗的最大值。

透過以下步驟維持視窗內的最大值和最小值差值 ≤ 1，並紀錄差值恰好為 1 時的最長視窗長度：

```typescript
let maximumHarmoniousSubsequenceLength = 0; // 儲存找到的最長和諧子序列長度
let leftPointer = 0;                        // 左指標初始化

for (let rightPointer = 0; rightPointer < totalItemsCount; rightPointer++) {
  // 當視窗內最大值與最小值差值大於 1 時，左指標需向右移動縮小視窗
  while (sortedItems[rightPointer] - sortedItems[leftPointer] > 1) {
    leftPointer++;
  }

  // 當差值正好為 1 時，更新當前最大和諧子序列長度
  if (sortedItems[rightPointer] - sortedItems[leftPointer] === 1) {
    const currentWindowLength = rightPointer - leftPointer + 1;
    if (currentWindowLength > maximumHarmoniousSubsequenceLength) {
      maximumHarmoniousSubsequenceLength = currentWindowLength;
    }
  }
}
```

### Step 4：回傳結果

最終回傳紀錄的最長和諧子序列長度：

```typescript
return maximumHarmoniousSubsequenceLength;
```

## 時間複雜度

- 陣列排序階段為 $O(n \log n)$。
- 後續的滑動視窗掃描只需掃描一次，因此為 $O(n)$。
- 總時間複雜度為 $O(n \log n)$。

> $O(n \log n)$

## 空間複雜度

- 使用了額外的 `Int32Array` 儲存排序後的資料，長度與輸入資料一致，因此需要額外 $O(n)$ 空間。
- 除此之外僅使用少數固定輔助變數，不會增加其他額外的空間複雜度。
- 總空間複雜度為 $O(n)$。

> $O(n)$
