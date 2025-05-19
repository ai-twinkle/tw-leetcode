# 3024. Type of Triangle

You are given a 0-indexed integer array `nums` of size `3` which can form the sides of a triangle.

- A triangle is called equilateral if it has all sides of equal length.
- A triangle is called isosceles if it has exactly two sides of equal length.
- A triangle is called scalene if all its sides are of different lengths.

Return a string representing the type of triangle that can be formed or `"none"` if it cannot form a triangle.

**Constraints:**

- `nums.length == 3`
- `1 <= nums[i] <= 100`

## 基礎思路

本題給定一個長度為 $3$ 的整數陣列 `nums`，表示三角形的三個邊長。根據三角形的性質判斷其類型（等邊、等腰、不等邊），若無法構成三角形則回傳 `"none"`。

判斷步驟分為兩部分：

1. **三角形成立判斷**
   給定三邊長 $a, b, c$，若滿足：

   $$
   a + b > c \;\;\land\;\; a + c > b \;\;\land\;\; b + c > a
   $$

   則可構成三角形，否則不可。

2. **分類判斷**

    - **等邊三角形（equilateral）**：三邊長均相等
    - **等腰三角形（isosceles）**：僅兩邊長相等
    - **不等邊三角形（scalene）**：三邊長皆不相等

## 解題步驟

### Step 1：解構輸入並命名

首先將輸入陣列 `nums` 進行解構，分別賦值給三個有意義的變數名稱，利於後續判讀。

```typescript
const [firstSideLength, secondSideLength, thirdSideLength] = nums;
```

### Step 2：檢查三角形不等式

依照三角形不等式，任意兩邊之和必須大於第三邊。若不滿足，則直接回傳 `"none"`。

```typescript
if (firstSideLength + secondSideLength <= thirdSideLength ||
  firstSideLength + thirdSideLength <= secondSideLength ||
  secondSideLength + thirdSideLength <= firstSideLength) {
  return "none";
}
```

### Step 3：判斷等邊三角形

若三邊長完全相等，即可判斷為等邊三角形，直接回傳 `"equilateral"`。

```typescript
if (firstSideLength === secondSideLength &&
  secondSideLength === thirdSideLength) {
  return "equilateral";
}
```

### Step 4：判斷等腰三角形

若有任意兩邊長相等（但不是三邊都相等，已在上一步排除），則為等腰三角形，回傳 `"isosceles"`。

```typescript
if (firstSideLength === secondSideLength ||
  secondSideLength === thirdSideLength ||
  firstSideLength === thirdSideLength) {
  return "isosceles";
}
```

### Step 5：判斷不等邊三角形

若以上條件皆不成立，則三邊長皆不相等，即為不等邊三角形，回傳 `"scalene"`。

```typescript
return "scalene";
```

## 時間複雜度

- 每個判斷（解構、比較、加法）均為常數時間操作。
- 沒有任何迴圈或遞迴。
- 總時間複雜度為 $O(1)$。

> $O(1)$

## 空間複雜度

- 僅用到三個額外變數（對應三條邊長），不隨輸入增長。
- 無需額外資料結構。
- 總空間複雜度為 $O(1)$。

> $O(1)$
