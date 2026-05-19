# 2540. Minimum Common Value

Given two integer arrays `nums1` and `nums2`, sorted in non-decreasing order, return the minimum integer common to both arrays. 
If there is no common integer amongst `nums1` and `nums2`, return `-1`.

Note that an integer is said to be common to `nums1` and `nums2` if both arrays have at least one occurrence of that integer.

**Constraints:**

- `1 <= nums1.length, nums2.length <= 10^5`
- `1 <= nums1[i], nums2[j] <= 10^9`
- Both `nums1` and `nums2` are sorted in non-decreasing order.

## 基礎思路

本題要求在兩個已排序（非遞減）的整數陣列中，找出同時存在於兩者中的最小整數；若不存在共同元素，則回傳 `-1`。由於兩個陣列皆已排序，我們可以利用此性質避免暴力比對的高成本。

在思考解法時，可掌握以下核心觀察：

- **兩陣列皆為非遞減排序**：
  共同元素若存在，必然能透過順序掃描的方式找到，無須額外排序或集合結構。

- **最小共同元素具有單調性**：
  從兩陣列的最左端開始向右推進，第一個遇到的相等值即為最小共同整數，可直接回傳。

- **值域不重疊則必無共同元素**：
  若其中一個陣列的最小值大於另一陣列的最大值，則兩者完全沒有交集，可立即終止。

- **較小值的指標應前進**：
  在任一輪比較中，較小值不可能再出現在另一陣列剩餘段落的相等位置，因此推進該指標可逐步逼近可能的交集點。

依據以上特性，可以採用以下策略：

- **先以邊界值判斷兩陣列值域是否重疊**，若不重疊則直接回傳 `-1`。
- **使用雙指標同時掃描兩陣列**，每次比較兩端當前值，遇到相等即為答案。
- **當值不相等時，前進較小值對應的指標**，直到任一陣列被走完。

此策略能在線性時間內穩定地找到最小共同整數，且無須額外輔助空間。

## 解題步驟

### Step 1：快取陣列長度以減少重複屬性查詢

在進入主要流程前，先將兩個陣列長度存入區域變數，避免在迴圈中重複查詢 `.length` 屬性。

```typescript
// 將陣列長度快取於區域變數，以避免在迴圈中重複進行屬性查詢
const length1 = nums1.length;
const length2 = nums2.length;
```

### Step 2：以邊界值快速判斷值域是否重疊

由於兩陣列皆為非遞減排序，若其中一個陣列的首元素大於另一個陣列的末元素，代表兩者的值域完全沒有交集，可直接回傳 `-1`。

```typescript
// 提前終止：若兩陣列的值域不重疊，則不可能存在共同元素
if (nums1[0] > nums2[length2 - 1] || nums2[0] > nums1[length1 - 1]) {
  return -1;
}
```

### Step 3：初始化雙指標

分別為兩個陣列建立起始指標，皆從索引 0 出發，準備同步推進。

```typescript
// 兩個指標同時在兩個陣列中向前推進
let pointer1 = 0;
let pointer2 = 0;
```

### Step 4：同步比較雙指標的當前值，遇到相等即回傳

進入 `while` 迴圈，只要兩個指標都未越界即持續比較。
每輪先取出兩指標當前值；若相等，由於兩陣列皆為升序排序，此值必為最小共同整數，可立即回傳。

```typescript
while (pointer1 < length1 && pointer2 < length2) {
  const value1 = nums1[pointer1];
  const value2 = nums2[pointer2];

  // 找到相等值：因兩陣列皆為升序，此即為最小共同元素
  if (value1 === value2) {
    return value1;
  }

  // ...
}
```

### Step 5：當值不相等時，推進較小值對應的指標

若兩值不相等，較小者不可能在另一陣列剩餘段落中再被匹配，故推進該指標；否則推進另一側指標，直到某一陣列被掃描完畢。

```typescript
while (pointer1 < length1 && pointer2 < length2) {
  // Step 4：比較雙指標當前值並處理相等情況

  // 將指向較小值的指標前進，以追趕另一側
  if (value1 < value2) {
    pointer1++;
  } else {
    pointer2++;
  }
}
```

### Step 6：未找到共同元素時回傳 -1

當任一陣列已被掃描完畢仍未發現相等值，代表兩者沒有共同整數，回傳 `-1`。

```typescript
// 任一陣列耗盡後仍未發現共同元素
return -1;
```

## 時間複雜度

- 雙指標各自最多前進 $n$ 與 $m$ 步，整個掃描為線性過程；
- 邊界判斷與單次比較皆為常數時間。
- 總時間複雜度為 $O(n + m)$。

> $O(n + m)$

## 空間複雜度

- 僅使用固定數量的指標與長度快取變數；
- 無任何額外陣列或動態結構。
- 總空間複雜度為 $O(1)$。

> $O(1)$
