# 4. Median of Two Sorted Arrays

Given two sorted arrays `nums1` and `nums2` of size `m` and `n` respectively, return the median of the two sorted arrays.

The overall run time complexity should be $O(log (m+n))$.

**Constraints:**

- `nums1.length == m`
- `nums2.length == n`
- `0 <= m <= 1000`
- `0 <= n <= 1000`
- `1 <= m + n <= 2000`
- `-10^6 <= nums1[i], nums2[i] <= 10^6`

## 基礎思路

本題要在兩個**已排序**的陣列中找到「合併後」的中位數，且時間複雜度必須是 $O(\log(m+n))$。
若用直接合併再取中位數，時間會是 $O(m+n)$，不符合要求，因此必須用「二分搜尋」來做。

關鍵想法是：

* 想像我們在兩個排序陣列 `nums1`、`nums2` 上各切一刀，把它們分成左右兩邊，
* 若能找到一個切法，使得：

    * 左半部元素總數恰好是整體長度的一半（或多一個，用於奇數長度），
    * 且 **左半部最大的元素 ≤ 右半部最小的元素**，
      那麼**整體的中位數就只跟這四個邊界元素有關**。
* 為了讓二分搜尋效率最高，我們只在「較短的陣列」上做切割，另一個陣列的切割點可由總長度推回來。
* 每一次二分，我們：

    * 假設短陣列切在 `partitionFirstArray`，
    * 長陣列自然而然切在 `halfLength - partitionFirstArray`，
    * 取出四個邊界值（兩邊左最大與右最小），檢查是否滿足「左 ≤ 右」條件。
* 若短陣列左半邊太大，就向左縮小切割；反之往右擴大切割，直到找到合法切割點。

這樣一來，我們只在短陣列長度範圍內做二分搜尋，因此可以保證時間複雜度為
$O(\log(\min(m,n))) \subseteq O(\log(m+n))$。

## 解題步驟

### Step 1：確保第一個陣列較短

先確保 `firstArray` 是較短的那個陣列，這樣二分搜尋的搜尋空間會最小，效率最好。
若一開始 `nums1` 比 `nums2` 長，就交換兩者以及其長度。

```typescript
// 確保 firstArray 是較短的陣列，以減少二分搜尋範圍
let firstArray = nums1;
let secondArray = nums2;

let lengthFirstArray = firstArray.length;
let lengthSecondArray = secondArray.length;

if (lengthFirstArray > lengthSecondArray) {
  const temporaryArray = firstArray;
  firstArray = secondArray;
  secondArray = temporaryArray;

  const temporaryLength = lengthFirstArray;
  lengthFirstArray = lengthSecondArray;
  lengthSecondArray = temporaryLength;
}
```

### Step 2：計算總長度與左半部長度，並設定哨兵值與搜尋區間

計算兩陣列合併後的總長度，並決定左半部應包含多少元素 `halfLength`。
同時設定「非常小」與「非常大」的哨兵值，避免在邊界處使用 `Infinity`，
並初始化二分搜尋的左右邊界。

```typescript
const totalLength = lengthFirstArray + lengthSecondArray;
const halfLength = (totalLength + 1) >> 1; // 左半部元素數量

// 哨兵值設定（避免使用 Infinity 提升比較效率）
const minimumSentinel = -1_000_001;
const maximumSentinel = 1_000_001;

let lowIndex = 0;
let highIndex = lengthFirstArray;
```

### Step 3：建立二分搜尋骨架 — 嘗試各種切割位置

使用 `while (lowIndex <= highIndex)` 對較短陣列進行二分搜尋。
每一輪先計算短陣列的切割點 `partitionFirstArray`，
再推得長陣列的切割點 `partitionSecondArray`。

```typescript
// 二分搜尋以找到正確切割
while (lowIndex <= highIndex) {
  const partitionFirstArray = (lowIndex + highIndex) >> 1;
  const partitionSecondArray = halfLength - partitionFirstArray;

  // ...
}
```

### Step 4：在迴圈中計算兩陣列的四個邊界值（越界時用哨兵補位）

在同一個 `while` 迴圈中，對每一組切割計算：

* `leftMaxFirstArray`：短陣列左半部的最大值
* `rightMinFirstArray`：短陣列右半部的最小值
* `leftMaxSecondArray`：長陣列左半部的最大值
* `rightMinSecondArray`：長陣列右半部的最小值

當切割點在邊界（例如切在最左、最右）時，使用哨兵值當作「不存在一側」的代表。

```typescript
while (lowIndex <= highIndex) {
  // Step 3：計算兩陣列切割點

  // 計算切割後左右邊界值（越界時使用哨兵值）
  const leftMaxFirstArray = partitionFirstArray > 0
    ? firstArray[partitionFirstArray - 1]
    : minimumSentinel;

  const rightMinFirstArray = partitionFirstArray < lengthFirstArray
    ? firstArray[partitionFirstArray]
    : maximumSentinel;

  const leftMaxSecondArray = partitionSecondArray > 0
    ? secondArray[partitionSecondArray - 1]
    : minimumSentinel;

  const rightMinSecondArray = partitionSecondArray < lengthSecondArray
    ? secondArray[partitionSecondArray]
    : maximumSentinel;

  // ...
}
```

### Step 5：檢查此切割是否合法，若合法直接計算中位數

```typescript
while (lowIndex <= highIndex) {
  // Step 3：計算兩陣列切割點
  
  // Step 4：取得切割邊界值

  // 判斷是否為合法切割
  if (leftMaxFirstArray <= rightMinSecondArray && leftMaxSecondArray <= rightMinFirstArray) {
    // 偶數長度：取左半最大與右半最小的平均
    if ((totalLength & 1) === 0) {
      const leftMax = leftMaxFirstArray > leftMaxSecondArray ? leftMaxFirstArray : leftMaxSecondArray;
      const rightMin = rightMinFirstArray < rightMinSecondArray ? rightMinFirstArray : rightMinSecondArray;
      return (leftMax + rightMin) * 0.5;
    }

    // 奇數長度：左半最大即為中位數
    return leftMaxFirstArray > leftMaxSecondArray ? leftMaxFirstArray : leftMaxSecondArray;
  }

  // ...
}
```

### Step 6：若切割不合法，依關係調整二分搜尋範圍

```typescript
while (lowIndex <= highIndex) {
  // Step 3：計算兩陣列切割點
  
  // Step 4：取得切割邊界值
  
  // Step 5：判斷合法切割

  // 若短陣列左半過大，需往左移動
  if (leftMaxFirstArray > rightMinSecondArray) {
    highIndex = partitionFirstArray - 1;
  }
  // 否則往右移動
  else {
    lowIndex = partitionFirstArray + 1;
  }
}
```

### Step 7：回傳（理論上不會到達）

```typescript
// 理論上不會到達這裡
return 0;
```

## 時間複雜度

- 僅在較短陣列上進行二分搜尋，搜尋範圍大小為 $\min(m, n)$；
- 每一步二分操作都只做常數次比較與索引存取；
- 總時間複雜度為 $O(\log(\min(m, n)))$。

> $O(\log(\min(m, n)))$

## 空間複雜度

- 僅使用數個額外變數與哨兵值來輔助計算；
- 不需額外與輸入大小成比例的記憶體；
- 總空間複雜度為 $O(1)$。

> $O(1)$
