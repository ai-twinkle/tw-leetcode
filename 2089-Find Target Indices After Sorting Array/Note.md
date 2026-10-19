# 2089. Find Target Indices After Sorting Array

You are given a 0-indexed integer array `nums` and a target element target.

A target index is an index i such that `nums[i] == target`.

Return a list of the target indices of `nums` after sorting `nums` in non-decreasing order. 
If there are no target indices, return an empty list. 
The returned list must be sorted in increasing order.

**Constraints:**

- `1 <= nums.length <= 100`
- `1 <= nums[i], target <= 100`

## 基礎思路

本題要求回傳陣列排序後，所有等於目標值的元素所在索引，且結果需遞增排列。由於陣列長度不大，直接排序後掃描即可解題；但只要觀察排序後的結構，就能完全省略排序。

在思考解法時，可掌握以下核心觀察：

- **排序後相同的值必定連續出現**：
  在非遞減排序中，所有等於目標值的元素會集中成一段連續區間，因此答案必為一段連續的索引。

- **區間起點由「嚴格小於目標值的元素數量」決定**：
  排序後，所有比目標值小的元素都會排在目標值之前，因此目標值區段的第一個索引恰好等於這些較小元素的個數。

- **區間長度由「等於目標值的元素數量」決定**：
  目標值出現幾次，就會佔據幾個連續位置。

- **元素的實際順序無關緊要**：
  只需統計數量即可推得答案，不需真正移動任何元素。

依據以上特性，可以採用以下策略：

- **以一次線性掃描，同時統計小於目標值與等於目標值的元素個數**。
- **若目標值不存在，直接回傳空結果**。
- **否則從較小元素的個數開始，連續產生與目標值出現次數相同數量的索引**，即為排序後的目標索引。

此策略以計數取代排序，讓整體在線性時間內完成，並自然滿足結果遞增的要求。

## 解題步驟

### Step 1：初始化計數器

分別準備兩個計數器：一個統計嚴格小於目標值的元素數量，另一個統計等於目標值的元素數量。

```typescript
let countLess = 0;
let countEqual = 0;
```

### Step 2：單次掃描統計較小值與相等值的數量

逐一檢視陣列中的每個元素：若小於目標值，則累加較小值計數；若等於目標值，則累加相等值計數。大於目標值的元素不影響答案，直接略過。

```typescript
// 單次掃描：統計嚴格小於目標值與等於目標值的元素數量（利於無分支最佳化）
for (let index = 0, length = nums.length; index < length; index++) {
  const value = nums[index];

  if (value < target) {
    countLess++;
  } else if (value === target) {
    countEqual++;
  }
}
```

### Step 3：目標值不存在時直接回傳空陣列

若相等值的數量為 0，代表排序後不會有任何位置存放目標值，直接回傳空陣列。

```typescript
// 目標值不存在，因此排序後不會有任何位置存放它
if (countEqual === 0) {
  return [];
}
```

### Step 4：配置結果陣列並填入連續的索引區段

排序後目標值區段的起點為 `countLess`，長度為 `countEqual`。先一次配置剛好大小的陣列，再依序填入 `countLess`、`countLess + 1`、……，即可得到遞增排列的目標索引。

```typescript
// 一次配置剛好長度的結果陣列，再填入連續的索引區段
const targetIndexList: number[] = new Array(countEqual);

for (let offset = 0; offset < countEqual; offset++) {
  targetIndexList[offset] = countLess + offset;
}
```

### Step 5：回傳結果

結果陣列已填入所有目標索引，且天然為遞增順序，直接回傳。

```typescript
return targetIndexList;
```

## 時間複雜度

- 統計階段對陣列進行一次線性掃描，需 $O(n)$；
- 填入結果的迴圈執行次數等於目標值出現次數 $k$，且 $k \le n$；
- 總時間複雜度為 $O(n)$。

> $O(n)$

## 空間複雜度

- 計數過程僅使用固定數量的變數；
- 結果陣列長度為目標值出現次數 $k$；
- 總空間複雜度為 $O(k)$。

> $O(k)$
