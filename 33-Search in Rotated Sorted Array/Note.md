# 33. Search in Rotated Sorted Array

There is an integer array `nums` sorted in ascending order (with distinct values).

Prior to being passed to your function, 
`nums` is possibly left rotated at an unknown index `k` (`1 <= k < nums.length`) such that the resulting array is `[nums[k], nums[k+1], ..., nums[n-1], nums[0], nums[1], ..., nums[k-1]]` (0-indexed). 
For example, `[0,1,2,4,5,6,7]` might be left rotated by 3 indices and become `[4,5,6,7,0,1,2]`.

Given the array `nums` after the possible rotation and an integer target, 
return the index of `target` if it is in `nums`, or `-1` if it is not in `nums`.

You must write an algorithm with `O(log n)` runtime complexity.

**Constraints:**

- `1 <= nums.length <= 5000`
- `-10^4 <= nums[i] <= 10^4`
- All values of `nums` are unique.
- `nums` is an ascending array that is possibly rotated.
- `-10^4 <= target <= 10^4`

## 基礎思路

本題給定一個原本以升序排列、但可能在某個未知位置被左旋轉過的整數陣列，要求在 $O(\log n)$ 的時間內找到目標值的索引。
由於必須符合對數時間複雜度，明顯需要採用二分搜尋的變形版本。

在思考解法時，可掌握以下核心觀察：

- **旋轉後的陣列具有「兩段升序」的特性**：
  原始陣列雖然被旋轉過，但仍可拆解為兩個各自升序的子段，且左段任一元素皆大於右段任一元素。

- **以中點切分後，至少有一半必定是完整升序**：
  在任意一次二分過程中，比較中點與左端點即可判斷左半段或右半段是否為升序，這提供了縮小搜尋範圍的依據。

- **目標值是否落於升序段內可被精確判斷**：
  當某一半確定為升序時，只需比較目標值是否位於該段端點所構成的區間中，即可決定要往哪一半繼續搜尋。

- **未旋轉的情況可走更輕量的路徑**：
  若整段陣列首尾即呈升序，代表並未發生實質旋轉，可直接套用標準二分搜尋，省去判斷升序段的額外比較。

依據以上特性，可以採用以下策略：

- **先以端點關係快速分流為「未旋轉」與「已旋轉」兩種情境**，未旋轉時直接執行標準二分搜尋。
- **已旋轉時則於每次二分中判斷哪一半為升序段**，再依目標值是否落於該升序段內，決定捨棄哪一半。
- **持續縮減搜尋區間直至找到目標或區間耗盡**，整體仍保持對數時間複雜度。

此策略能在所有旋轉情境下穩定維持 $O(\log n)$ 的查找效能。

## 解題步驟

### Step 1：取得陣列長度並處理單一元素的快速路徑

先取得陣列長度，若僅有一個元素，直接比較該元素與目標值即可決定回傳結果，無須進入後續二分流程。

```typescript
const length = nums.length;

// 快速路徑：陣列僅含單一元素
if (length === 1) {
  return nums[0] === target ? 0 : -1;
}
```

### Step 2：初始化二分搜尋的左右邊界

宣告 `left` 與 `right` 作為二分搜尋的指標，分別指向陣列的首尾位置，作為後續搜尋區間的起點與終點。

```typescript
let left = 0;
let right = length - 1;
```

### Step 3：判斷陣列是否未經實質旋轉

當首元素小於等於尾元素時，代表整段陣列仍呈升序，並未被有效旋轉。
此時無需處理旋轉造成的分段情形，可直接走標準二分搜尋路徑。

```typescript
// 快速路徑：若目標值落於整體值域外的判斷
// 旋轉後升序陣列的最小／最大值仍位於端點附近，
// 但若陣列未旋轉，可直接以兩端點比較進行快速判斷
if (nums[left] <= nums[right]) {
  // 陣列未旋轉，直接進行標準二分搜尋
  while (left <= right) {
    const middle = (left + right) >> 1;
    const middleValue = nums[middle];

    if (middleValue === target) {
      return middle;
    }

    if (middleValue < target) {
      left = middle + 1;
    } else {
      right = middle - 1;
    }
  }
  return -1;
}
```

### Step 4：在已旋轉的情境中取得中點並檢查是否命中目標

進入旋轉版本的二分搜尋後，每一輪先計算中點位置並取出中點值；
若中點值恰好等於目標，可立刻回傳該索引，結束搜尋。

```typescript
// 已旋轉情境：執行改良版的二分搜尋
while (left <= right) {
  const middle = (left + right) >> 1;
  const middleValue = nums[middle];

  if (middleValue === target) {
    return middle;
  }

  // ...
}
```

### Step 5：判斷左半段是否為升序，並依目標值縮減區間

藉由比較左端點與中點值決定左半段 `[left..middle]` 是否為升序段；
若為升序，則依目標值是否落於該段範圍內，決定搜尋區間應往左或往右收斂。

```typescript
while (left <= right) {
  // Step 4：取得中點並檢查是否命中目標

  // 透過比較中點與左端點，判斷哪一半為升序段
  if (nums[left] <= middleValue) {
    // 左半段 [left..middle] 為升序排列
    if (nums[left] <= target && target < middleValue) {
      // 目標落在升序的左半段內
      right = middle - 1;
    } else {
      // 目標必定位於右半段
      left = middle + 1;
    }
  } else {
    // ...
  }
}
```

### Step 6：若左半段非升序，則右半段必為升序，依此縮減區間

當左半段不滿足升序條件時，代表右半段 `[middle..right]` 必為升序段；
此時同樣依目標值是否落於該升序段範圍內，決定下一輪搜尋區間。

```typescript
while (left <= right) {
  // Step 4：取得中點並檢查是否命中目標

  // 透過比較中點與左端點，判斷哪一半為升序段
  if (nums[left] <= middleValue) {
    // Step 5：依目標值縮減區間
  } else {
    // 右半段 [middle..right] 為升序排列
    if (middleValue < target && target <= nums[right]) {
      // 目標落在升序的右半段內
      left = middle + 1;
    } else {
      // 目標必定位於左半段
      right = middle - 1;
    }
  }
}
```

### Step 7：搜尋結束仍未命中時回傳 -1

當搜尋區間耗盡（`left > right`）仍未找到目標，代表陣列中不存在該值，回傳 `-1` 表示查無結果。

```typescript
return -1;
```

## 時間複雜度

- 無論陣列是否旋轉，每一輪二分搜尋皆將搜尋區間折半；
- 每次迴圈內僅進行常數次比較與索引更新；
- 總時間複雜度為 $O(\log n)$。

> $O(\log n)$

## 空間複雜度

- 僅使用固定數量的指標與暫存變數，無遞迴呼叫；
- 無任何隨輸入規模增長的額外資料結構；
- 總空間複雜度為 $O(1)$。

> $O(1)$
