# 2040. Kth Smallest Product of Two Sorted Arrays

Given two sorted 0-indexed integer arrays `nums1` and `nums2` as well as an integer `k`, 
return the $k^{th}$ (1-based) smallest product of `nums1[i] * nums2[j]` where `0 <= i < nums1.length` and `0 <= j < nums2.length`.

**Constraints:**

- `1 <= nums1.length, nums2.length <= 5 * 10^4`
- `-10^5 <= nums1[i], nums2[j] <= 10^5`
- `1 <= k <= nums1.length * nums2.length`
- `nums1` and `nums2` are sorted.

## 基礎思路

這道題的核心問題是從兩個已排序的陣列 `nums1` 與 `nums2` 中，快速地找到第 $k$ 小的乘積值。
直接將所有可能乘積計算出來再排序雖然可行，但由於陣列長度可能達到 $5\times10^4$，暴力法顯然無法接受。
因此，需要有效率地尋找答案。

考慮到以下兩個關鍵特性：

1. 兩個陣列皆為已排序，因此各自的負數和正數區段是連續的，能利用這點快速統計不同乘積類型。
2. 如果給定一個「候選答案」（目標乘積），則可用雙指標快速統計所有小於等於此目標乘積的組合數量，這種計數方式能控制在線性時間內完成。

基於上述觀察，我們將透過 **二分搜尋** 的方式，不斷地調整「候選答案」，直到精準定位出第 $k$ 小的乘積：

- **二分搜尋的範圍**：設置在所有可能乘積的上下界。
- **計數方法**：利用雙指標遍歷四種可能的乘積組合：(負x負)、(正x正)、(負x正)、(正x負)，快速累計小於等於候選值的乘積個數。
- 根據統計結果與目標數量 $k$ 比較，逐步縮小搜尋範圍直到找到準確答案。

## 解題步驟

### Step 1：陣列長度與負數計數初始化

首先紀錄兩個陣列的長度，並且透過掃描各自陣列開頭區域，快速找出各自包含負數的個數：

```typescript
const lengthOfFirstArray = nums1.length;
const lengthOfSecondArray = nums2.length;

// 分別計算每個陣列負數元素數量
let negativeCountFirstArray = 0;
while (negativeCountFirstArray < lengthOfFirstArray && nums1[negativeCountFirstArray] < 0) {
  negativeCountFirstArray++;
}

let negativeCountSecondArray = 0;
while (negativeCountSecondArray < lengthOfSecondArray && nums2[negativeCountSecondArray] < 0) {
  negativeCountSecondArray++;
}
```

### Step 2：設置二分搜尋上下界

接著設定乘積搜尋的上下界，以確保所有可能的乘積都會涵蓋在搜尋範圍內：

```typescript
let leftProduct = -1e10;
let rightProduct = 1e10;
```

### Step 3：執行二分搜尋與計數

使用二分搜尋尋找第 $k$ 小的乘積，每次二分時都使用雙指標快速統計小於等於候選乘積 (`midProduct`) 的個數：

```typescript
while (leftProduct <= rightProduct) {
  const midProduct = Math.floor((leftProduct + rightProduct) / 2);
  let productCount = 0;

  // Case 1: 負 x 負 = 正 (由小到大)
  let indexFirst = 0;
  let indexSecond = negativeCountSecondArray - 1;
  while (indexFirst < negativeCountFirstArray && indexSecond >= 0) {
    if (nums1[indexFirst] * nums2[indexSecond] > midProduct) {
      indexFirst++;
    } else {
      productCount += negativeCountFirstArray - indexFirst;
      indexSecond--;
    }
  }

  // Case 2: 正 x 正 = 正 (由小到大)
  indexFirst = negativeCountFirstArray;
  indexSecond = lengthOfSecondArray - 1;
  while (indexFirst < lengthOfFirstArray && indexSecond >= negativeCountSecondArray) {
    if (nums1[indexFirst] * nums2[indexSecond] > midProduct) {
      indexSecond--;
    } else {
      productCount += indexSecond - negativeCountSecondArray + 1;
      indexFirst++;
    }
  }

  // Case 3: 負 x 正 = 負 (由小到大)
  indexFirst = 0;
  indexSecond = negativeCountSecondArray;
  while (indexFirst < negativeCountFirstArray && indexSecond < lengthOfSecondArray) {
    if (nums1[indexFirst] * nums2[indexSecond] > midProduct) {
      indexSecond++;
    } else {
      productCount += lengthOfSecondArray - indexSecond;
      indexFirst++;
    }
  }

  // Case 4: 正 x 負 = 負 (由小到大)
  indexFirst = negativeCountFirstArray;
  indexSecond = 0;
  while (indexFirst < lengthOfFirstArray && indexSecond < negativeCountSecondArray) {
    if (nums1[indexFirst] * nums2[indexSecond] > midProduct) {
      indexFirst++;
    } else {
      productCount += lengthOfFirstArray - indexFirst;
      indexSecond++;
    }
  }

  // 根據計數結果調整二分搜尋區間
  if (productCount < k) {
    leftProduct = midProduct + 1;
  } else {
    rightProduct = midProduct - 1;
  }
}
```

### Step 4：返回搜尋結果

當二分搜尋結束時，`leftProduct` 即為所求的第 $k$ 小乘積：

```typescript
return leftProduct;
```

## 時間複雜度

- 每次二分搜尋內使用雙指標遍歷兩個陣列，總計 $O(n_1 + n_2)$，其中 $n_1, n_2$ 為陣列長度。
- 二分搜尋次數取決於乘積區間範圍，約為 $\log(2\times10^{10})\approx35$ 次。
- 總時間複雜度為 $O((n_1 + n_2)\log C)$ 其中 $C$ 表示乘積的最大範圍。

> $O((n_1 + n_2)\log C)$

## 空間複雜度

- 使用的輔助變數與指標均為固定數量，無需額外動態空間配置。
- 總空間複雜度為 $O(1)$。

> $O(1)$
