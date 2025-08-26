# 3000. Maximum Area of Longest Diagonal Rectangle

You are given a 2D 0-indexed integer array `dimensions`.

For all indices `i`, `0 <= i < dimensions.length`, `dimensions[i][0]` represents the length and `dimensions[i][1]` represents the width of the rectangle `i`.

Return the area of the rectangle having the longest diagonal. If there are multiple rectangles with the longest diagonal, 
return the area of the rectangle having the maximum area.

**Constraints:**

- `1 <= dimensions.length <= 100`
- `dimensions[i].length == 2`
- `1 <= dimensions[i][0], dimensions[i][1] <= 100`

## 基礎思路

題目給定一組矩形，每個矩形的長與寬分別記錄在 `dimensions[i][0]` 與 `dimensions[i][1]`。
我們的任務是找出「對角線最長」的矩形，並回傳它的面積。
若有多個矩形的對角線同樣長，則選擇其中面積最大的。

- 對角線長度透過畢氏定理：$d = \sqrt{l^2 + w^2}$。
- 由於我們只需要比較大小，因此直接比較平方 $l^2 + w^2$ 即可，避免不必要的開根號計算。
- 在遍歷過程中，我們要同時追蹤：

    1. 目前遇到的最大對角線平方值；
    2. 在此對角線條件下的最大面積。
- 遍歷結束後，答案即為最大對角線對應的矩形面積。

## 解題步驟

### Step 1：初始化變數

建立兩個變數：

- `maximumDiagonalSquare`：紀錄當前最大對角線平方值，初始為 0。
- `maximumArea`：紀錄對應的最大面積，初始為 0。

```typescript
let maximumDiagonalSquare = 0;
let maximumArea = 0;
```

### Step 2：使用 for 迴圈遍歷與更新

在一個迴圈中處理所有矩形：

- 取出長與寬。
- 計算對角線平方與面積。
- 若對角線平方更大，更新紀錄；若相等，則比較面積大小。

```typescript
for (let i = 0; i < dimensions.length; i++) {
  const length = dimensions[i][0];
  const width = dimensions[i][1];

  const diagonalSquare = length * length + width * width;
  const area = length * width;

  if (diagonalSquare > maximumDiagonalSquare) {
    maximumDiagonalSquare = diagonalSquare;
    maximumArea = area;
  } else if (diagonalSquare === maximumDiagonalSquare) {
    if (area > maximumArea) {
      maximumArea = area;
    }
  }
}
```

### Step 3：回傳最終答案

迴圈結束後，回傳 `maximumArea` 作為最終結果。

```typescript
return maximumArea;
```

## 時間複雜度

- 遍歷所有 $n$ 個矩形，每次運算僅需常數時間。
- 總時間複雜度為 $O(n)$。

> $O(n)$

## 空間複雜度

- 僅使用常數數量變數儲存狀態。
- 總空間複雜度為 $O(1)$。

> $O(1)$
