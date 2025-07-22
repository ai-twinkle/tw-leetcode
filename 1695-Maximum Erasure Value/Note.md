# 1695. Maximum Erasure Value

You are given an array of positive integers `nums` and want to erase a subarray containing unique elements. 
The score you get by erasing the subarray is equal to the sum of its elements.

Return the maximum score you can get by erasing exactly one subarray.

An array `b` is called to be a subarray of `a` if it forms a contiguous subsequence of `a`, that is, if it is equal to `a[l],a[l+1],...,a[r]` for some `(l,r)`.

**Constraints:**

- `1 <= nums.length <= 10^5`
- `1 <= nums[i] <= 10^4`

## 基礎思路

本題的核心目標是從給定的陣列中，找到一段子陣列，使其滿足元素皆為獨特（不重複）且總和最大。
因此我們可考慮透過雙指標法（Sliding Window）來解題：

- 我們使用兩個指標來界定子陣列的範圍，分別為左指標 (`leftIndex`) 與右指標 (`rightIndex`)。
- 當右指標向右移動並遇到重複元素時，為確保子陣列的元素皆獨特，左指標應不斷向右移動並移除子陣列中的元素，直到重複元素被排除為止。
- 每次調整子陣列範圍後，都應計算目前子陣列的元素總和，並更新全局最大值。

透過此方式，能有效確保找到「無重複元素且元素總和最大」的子陣列。

## 解題步驟

### Step 1：初始化所需變數

我們先初始化以下幾個變數：

```typescript
// 透過 Uint8Array 記錄範圍 1~10000 中的數字是否已存在於子陣列中
const presenceMap = new Uint8Array(10001);
const arrayLength = nums.length;

let maxScore = 0;      // 紀錄目前為止找到的最大子陣列總和
let windowSum = 0;     // 當前子陣列的總和
let leftIndex = 0;     // 子陣列左指標

// 快取 nums 陣列以加快存取速度
const values = nums;
```

### Step 2：透過雙指標進行滑動窗口

我們使用右指標從陣列左邊開始逐一向右遍歷：

- 當元素重複出現，透過左指標迅速移除元素直到解決重複問題。
- 每次更新子陣列內容後，同步更新子陣列總和與歷史最大值。

```typescript
for (let rightIndex = 0; rightIndex < arrayLength; rightIndex++) {
  const currentValue = values[rightIndex];

  // 當遇到當前元素已存在於子陣列中時，需縮減左邊界，直到重複元素被排除
  if (presenceMap[currentValue]) {
    do {
      const removedValue = values[leftIndex++];
      presenceMap[removedValue] = 0;  // 移除該元素於 presenceMap 的記錄
      windowSum -= removedValue;      // 子陣列總和同步減去移除的元素
    } while (presenceMap[currentValue]);
  }

  // 將目前元素納入子陣列，更新相關紀錄
  presenceMap[currentValue] = 1;
  windowSum += currentValue;

  // 更新最大總和
  maxScore = windowSum > maxScore ? windowSum : maxScore;
}
```

### Step 3：回傳最終答案

滑動窗口結束後，我們會取得符合題目要求的最大總和：

```typescript
return maxScore;
```

## 時間複雜度

- 雙指標法中每個元素最多僅被左右兩個指標各訪問一次。
- 單次查表與更新的操作皆為 $O(1)$。
- 總時間複雜度為 $O(n)$。

> $O(n)$

## 空間複雜度

- 使用了固定大小的 `presenceMap`（大小為 $10^4+1$）以及固定數量的輔助變數。
- 無動態擴展的資料結構，因此空間複雜度固定。
- 總空間複雜度為 $O(1)$。

> $O(1)$
