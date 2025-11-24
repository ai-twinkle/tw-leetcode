# 1502. Can Make Arithmetic Progression From Sequence

A sequence of numbers is called an arithmetic progression if the difference between any two consecutive elements is the same.

Given an array of numbers `arr`, return `true` if the array can be rearranged to form an arithmetic progression. 
Otherwise, return `false`.

**Constraints:**

- `2 <= arr.length <= 1000`
- `-10^6 <= arr[i] <= 10^6`

## 基礎思路

一個序列能否重新排列成等差數列，取決於以下性質：

- **等差定義**：排序後相鄰兩數之差必須一致。
- **排序後檢查即可**：無論原本順序如何，只要重新排序後能呈現固定差值，就一定能重組成等差序列。
- **差值唯一性**：將陣列由小到大排序後，計算第一段差值 `d = arr[1] - arr[0]`，若後續所有相鄰差值皆等於 `d`，則答案為 `true`。

由於只需要排序並線性檢查一次，因此整體效率能滿足題目要求。

## 解題步驟

### Step 1：處理小尺寸陣列

若長度為 2 或更小，必定能形成等差數列，直接回傳 `true`。

```typescript
const arrayLength = arr.length;

// 長度 <= 2 必定能形成等差數列
if (arrayLength <= 2) {
  return true;
}
```

### Step 2：排序陣列以檢查相鄰差值

將陣列進行原地排序，從最小到最大排列，使相鄰差值可被正確檢查。

```typescript
// 就地排序
arr.sort((first, second) => {
  return first - second;
});
```

### Step 3：計算等差差值

取前兩個元素的差值，作為後續比較的標準差。

```typescript
// 計算共同差值
const commonDifference = arr[1] - arr[0];
```

### Step 4：主迴圈 — 檢查所有相鄰差值是否相同

遍歷從 index = 2 開始的所有元素，只要任意一段差值不同，即無法形成等差數列。

```typescript
for (let index = 2; index < arrayLength; index++) {
  // 若任意相鄰差值不同於共同差值，則無法形成等差數列
  if (arr[index] - arr[index - 1] !== commonDifference) {
    return false;
  }
}
```

### Step 5：全部差值一致則返回 true

若迴圈順利結束，代表所有差值都相同。

```typescript
return true;
```

## 時間複雜度

- 排序花費 $O(n \log n)$；
- 檢查差值為線性時間 $O(n)$；
- 總時間複雜度為 $O(n \log n)$。

> $O(n \log n)$

## 空間複雜度

- 排序使用原地排序（in-place），額外空間為常數；
- 其他輔助變數亦為常數級。
- 總空間複雜度為 $O(1)$。

> $O(1)$
