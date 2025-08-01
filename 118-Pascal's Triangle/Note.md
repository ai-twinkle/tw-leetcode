# 118. Pascal's Triangle

Given an integer `numRows`, return the first `numRows` of Pascal's triangle.

In Pascal's triangle, each number is the sum of the two numbers directly above it as shown:

```
      1
    1   1
  1   2   1
1   3   3   1
```

**Constraints:**

- `1 <= numRows <= 30`

## 基礎思路

Pascal 三角形的每一個數字，都是由上一行中「左上」與「右上」兩個數字相加得到。

因此，我們可以透過以下步驟來構造 Pascal 三角形：

- 從已知的第一行 `[1]` 開始。
- 每一行的最左邊和最右邊固定為 `1`。
- 透過迴圈逐步從「上一行」推導出「下一行」，直到得到所需的 `numRows` 行。

透過這種方式，就能依序構造出完整的 Pascal 三角形。

## 解題步驟

### Step 1：初始化 Pascal 三角形，並加入第一行

先建立一個陣列 `triangle` 來儲存每一行的結果，並且將第一行 `[1]` 放入，作為後續生成其他行的基礎：

```typescript
const triangle: number[][] = [[1]]; // 初始化 Pascal 三角形並加入第一行 [1]
```

### Step 2：從第二行開始，逐行生成 Pascal 三角形

透過迴圈，從第二行（索引為 `1`）開始依序構造每一行：

```typescript
for (let rowIndex = 1; rowIndex < numRows; rowIndex++) { // 從第二行開始，直到生成 numRows 行
  const previousRow = triangle[rowIndex - 1];             // 取得上一行作為計算基礎
  const currentRow: number[] = new Array(rowIndex + 1);   // 建立新的行，長度為「行數+1」
  
  currentRow[0] = 1;                                      // 每一行的最左邊固定為 1

  // 計算當前行中間位置的每個值
  for (let colIndex = 1; colIndex < rowIndex; colIndex++) {
    currentRow[colIndex] = previousRow[colIndex - 1] + previousRow[colIndex]; // 上一行相鄰兩數之和
  }

  currentRow[rowIndex] = 1;                               // 每一行的最右邊固定為 1
  triangle.push(currentRow);                              // 將當前計算完成的一行放入 triangle 中
}
```

### Step 3：回傳最終的 Pascal 三角形

當所有行數都生成完畢後，將完整的 Pascal 三角形回傳：

```typescript
return triangle; // 回傳包含 numRows 行的 Pascal 三角形
```

## 時間複雜度

- 需要遍歷整個 Pascal 三角形，共有 $\frac{n(n+1)}{2}$ 個元素。
- 每個元素計算過程皆為 $O(1)$，因此整體複雜度為 $O(n^2)$。
- 總時間複雜度為 $O(n^2)$。

> $O(n^2)$

## 空間複雜度

- 儲存結果的 `triangle` 陣列需要存放所有 Pascal 三角形元素，約 $\frac{n(n+1)}{2}$ 個元素，因此佔據空間 $O(n^2)$。
- 其他輔助變數僅需常數級空間。
- 總空間複雜度為 $O(n^2)$。

> $O(n^2)$
