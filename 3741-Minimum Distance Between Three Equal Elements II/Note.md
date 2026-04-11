# 3740. Minimum Distance Between Three Equal Elements I

You are given an integer array `nums`.

A tuple `(i, j, k)` of 3 distinct indices is good if `nums[i] == nums[j] == nums[k]`.

The distance of a good tuple is `abs(i - j) + abs(j - k) + abs(k - i)`, 
where `abs(x)` denotes the absolute value of `x`.

Return an integer denoting the minimum possible distance of a good tuple. 
If no good tuples exist, return `-1`.

**Constraints:**

- `1 <= n == nums.length <= 10^5`
- `1 <= nums[i] <= n`

## 基礎思路

本題要求找出所有「良好三元組」中距離最小的一組，其中三個索引對應的值必須相等。在思考解法前，可先對距離公式進行化簡，以發現關鍵結構。

在思考解法時，可掌握以下核心觀察：

- **距離公式可化簡為兩端距離的兩倍**：
  對於嚴格遞增的索引 `i < j < k`，距離展開後恰好等於 `2 * (k - i)`，中間索引不影響結果。因此只需關注最外側兩個索引的差值。

- **最小化距離等同於最大化索引緊密程度**：
  由於距離只取決於最左與最右的索引，最佳解必然來自同值的三個「最連續」出現位置，即任何值的最近三次出現。

- **僅需維護每個值的最近兩個歷史索引**：
  在由左至右掃描時，每當遇到某值的第三次出現，即可與前兩次構成一個候選三元組。此時最優解就是以此三次位置計算出的距離，無需回溯更早的出現位置。

- **滑動雙槽窗口即可追蹤最近兩次索引**：
  每次遇到某個值時，將舊的「最近」移至「次近」，再以當前索引更新「最近」，始終只保留兩個記憶槽位。

依據以上特性，可以採用以下策略：

- **為每個值分別維護最近與次近的出現索引**，以雙槽陣列表示。
- **每掃描到一個新位置，若次近索引已有效，則立即計算候選距離並與當前最佳值比較**。
- **更新完最小值後，向前滑動該值的窗口**，丟棄最早的索引，保留最近的兩個。

此策略僅需一次線性掃描，即可得到所有良好三元組中的最小距離，效率極高。

## 解題步驟

### Step 1：初始化索引追蹤陣列與最小距離

為每個值（值域為 `1..n`）分別準備兩個追蹤陣列，分別記錄其最近與次近的出現索引，初始皆設為 `-1` 表示尚未出現；同時設定最小距離初始值為 `-1`，表示目前尚未找到任何良好三元組。

```typescript
const length = nums.length;

// 追蹤每個值最近兩次出現的索引（值範圍為 1..n）
const mostRecentIndex = new Int32Array(length + 1).fill(-1);
const secondMostRecentIndex = new Int32Array(length + 1).fill(-1);

let minimumDist = -1;
```

### Step 2：逐一讀取當前位置的值及其前兩次出現索引

從左至右掃描整個陣列，對每個位置取出對應的值，並從兩個追蹤陣列中讀出該值的最近與次近索引，供後續判斷使用。

```typescript
for (let currentIndex = 0; currentIndex < length; currentIndex++) {
  const value = nums[currentIndex];
  const previousIndex = mostRecentIndex[value];
  const olderIndex = secondMostRecentIndex[value];

  // ...
}
```

### Step 3：若次近索引有效，計算候選距離並更新最小值

當次近索引不為 `-1`，表示此值已出現三次，構成一個良好三元組。由於 `olderIndex < previousIndex < currentIndex`，距離化簡後為 `2 * (currentIndex - olderIndex)`，即只需考量最外側兩端的差值。若此距離優於目前最小值，則更新之。

```typescript
for (let currentIndex = 0; currentIndex < length; currentIndex++) {
  // Step 2：讀取當前值與前兩次出現索引

  if (olderIndex !== -1) {
    // 連續三元組：olderIndex < previousIndex < currentIndex
    // 距離化簡為 2 * (currentIndex - olderIndex)
    const distance = 2 * (currentIndex - olderIndex);

    if (minimumDist === -1 || distance < minimumDist) {
      minimumDist = distance;
    }
  }

  // ...
}
```

### Step 4：更新滑動窗口，丟棄最早索引並記錄當前位置

計算完畢後，將「最近」索引移入「次近」槽位，再以目前的索引覆蓋「最近」槽位，維持窗口始終保存最新的兩次出現位置，供下一次出現時使用。

```typescript
for (let currentIndex = 0; currentIndex < length; currentIndex++) {
  // Step 2：讀取當前值與前兩次出現索引

  // Step 3：若找到第三次出現，計算距離並更新最小值

  // 將此值的兩槽窗口向前滑動
  secondMostRecentIndex[value] = previousIndex;
  mostRecentIndex[value] = currentIndex;
}
```

### Step 5：回傳最終結果

掃描結束後，回傳所記錄的最小距離；若從未找到任何良好三元組，則回傳初始值 `-1`。

```typescript
return minimumDist;
```

## 時間複雜度

- 整個陣列僅掃描一次，每個元素的操作皆為常數時間；
- 初始化兩個長度為 `n + 1` 的陣列，耗時 $O(n)$。
- 總時間複雜度為 $O(n)$。

> $O(n)$

## 空間複雜度

- 使用兩個長度為 `n + 1` 的整數陣列追蹤索引；
- 其餘變數皆為純量，不佔額外空間。
- 總空間複雜度為 $O(n)$。

> $O(n)$
