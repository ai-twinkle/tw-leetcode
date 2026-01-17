# 3047. Find the Largest Area of Square Inside Two Rectangles

There exist `n` rectangles in a 2D plane with edges parallel to the x and y axis. 
You are given two 2D integer arrays `bottomLeft` and `topRight` 
where `bottomLeft[i] = [a_i, b_i]` and `topRight[i] = [c_i, d_i]` represent the bottom-left and top-right coordinates 
of the $i^{th}$ rectangle, respectively.

You need to find the maximum area of a square that can fit inside the intersecting region of at least two rectangles. 
Return `0` if such a square does not exist.

**Constraints:**

- `n == bottomLeft.length == topRight.length`
- `2 <= n <= 10^3`
- `bottomLeft[i].length == topRight[i].length == 2`
- `1 <= bottomLeft[i][0], bottomLeft[i][1] <= 10^7`
- `1 <= topRight[i][0], topRight[i][1] <= 10^7`
- `bottomLeft[i][0] < topRight[i][0]`
- `bottomLeft[i][1] < topRight[i][1]`

## 基礎思路

本題要找「至少兩個矩形的交集區域」中，能放入的**最大正方形面積**。
對任意兩個矩形而言，它們的交集（若存在）仍是一個軸對齊矩形，其交集寬度為兩者 x 範圍的重疊、交集高度為 y 範圍的重疊。若交集寬或高 ≤ 0，代表沒有交集。

一個正方形能放進交集矩形的最大邊長，取決於交集矩形的短邊，因此最大可放正方形邊長為：

* `side = min(overlapWidth, overlapHeight)`（且必須 > 0）

題目要求的是「至少兩個矩形」的交集，因此只要考慮**所有矩形兩兩配對**，對每一對計算交集後能放入的最大正方形邊長，取其中最大值即可。

為了提升常數效率，可將座標集中存放以降低存取開銷；另外在計算交集時，若交集寬度已不可能超過目前最佳邊長，就可提早略過高度計算，減少不必要運算。

## 解題步驟

### Step 1：讀取矩形數量並建立座標打包空間

先取得矩形數量，並準備一個連續的整數陣列用來存放每個矩形的四個座標值（leftX、bottomY、rightX、topY）。

```typescript
const rectangleCount = bottomLeft.length;

// 將所有座標打包到同一個 TypedArray，降低多陣列的額外成本並提升快取區域性
const packed = new Int32Array(rectangleCount << 2);
```

### Step 2：遍歷輸入並將每個矩形座標寫入打包陣列

把每個矩形的四個值依序寫入 `packed`，方便後續用固定偏移快速取值。

```typescript
for (let index = 0; index < rectangleCount; index++) {
  const bottomLeftPoint = bottomLeft[index];
  const topRightPoint = topRight[index];
  const base = index << 2;
  packed[base] = bottomLeftPoint[0]; // 左邊界 X
  packed[base + 1] = bottomLeftPoint[1]; // 下邊界 Y
  packed[base + 2] = topRightPoint[0]; // 右邊界 X
  packed[base + 3] = topRightPoint[1]; // 上邊界 Y
}
```

### Step 3：初始化目前最佳正方形邊長

用 `bestSideLength` 紀錄目前找到的最大可放正方形邊長，初始為 0。

```typescript
let bestSideLength = 0;
```

### Step 4：建立兩兩配對的外層迴圈骨架

外層固定第一個矩形 `first`，並預先取出其座標，供內層多次使用。

```typescript
for (let first = 0; first < rectangleCount; first++) {
  const firstBase = first << 2;
  const firstLeftX = packed[firstBase];
  const firstBottomY = packed[firstBase + 1];
  const firstRightX = packed[firstBase + 2];
  const firstTopY = packed[firstBase + 3];

  // ...
}
```

### Step 5：內層配對第二個矩形，先計算交集寬度並做剪枝

對每個 `second`，先計算交集寬度。若交集寬度已無法超過目前最佳邊長，就直接跳過，避免再算高度。

```typescript
for (let first = 0; first < rectangleCount; first++) {
  // Step 4：建立外層迴圈骨架並取出第一個矩形座標

  for (let second = first + 1; second < rectangleCount; second++) {
    const secondBase = second << 2;

    const secondLeftX = packed[secondBase];
    const secondRightX = packed[secondBase + 2];

    // 先計算交集寬度；若不可能超過 bestSideLength，就跳過高度計算
    const overlapWidth =
      (firstRightX <= secondRightX ? firstRightX : secondRightX) -
      (firstLeftX >= secondLeftX ? firstLeftX : secondLeftX);

    if (overlapWidth <= bestSideLength) {
      continue;
    }

    // ...
  }
}
```

### Step 6：計算交集高度，並再次剪枝

若交集高度也無法超過目前最佳邊長，同樣可以略過後續更新。

```typescript
for (let first = 0; first < rectangleCount; first++) {
  // Step 4：建立外層迴圈骨架並取出第一個矩形座標

  for (let second = first + 1; second < rectangleCount; second++) {
    // Step 5：先計算交集寬度並剪枝

    const secondBottomY = packed[secondBase + 1];
    const secondTopY = packed[secondBase + 3];

    const overlapHeight =
      (firstTopY <= secondTopY ? firstTopY : secondTopY) -
      (firstBottomY >= secondBottomY ? firstBottomY : secondBottomY);

    if (overlapHeight <= bestSideLength) {
      continue;
    }

    // ...
  }
}
```

### Step 7：以較小的交集邊作為候選正方形邊長並更新最佳解

交集內可放正方形的最大邊長由短邊決定，因此取 `min(overlapWidth, overlapHeight)` 作為候選，若更大則更新。

```typescript
for (let first = 0; first < rectangleCount; first++) {
  // Step 4：建立外層迴圈骨架並取出第一個矩形座標

  for (let second = first + 1; second < rectangleCount; second++) {
    // Step 5：先計算交集寬度並剪枝

    // Step 6：計算交集高度並剪枝

    // 候選邊長由交集較短邊決定
    const candidateSideLength = overlapWidth <= overlapHeight ? overlapWidth : overlapHeight;
    if (candidateSideLength > bestSideLength) {
      bestSideLength = candidateSideLength;
    }
  }
}
```

### Step 8：回傳最大面積

最佳邊長平方即為最大可放正方形面積；若從未更新則仍為 0。

```typescript
return bestSideLength * bestSideLength;
```

## 時間複雜度

- 打包座標的迴圈執行 `n` 次，為 $O(n)$。
- 兩兩配對檢查：外層 `first` 執行 `n` 次、內層 `second` 對每個 `first` 執行 `n-1-first` 次，總配對數為 $\frac{n(n-1)}{2}$，每一對只做常數次運算，為 $O(n^2)$。
- 總時間複雜度為 $O(n^2)$。

> $O(n^2)$

## 空間複雜度

- `packed` 為長度 `4n` 的 `Int32Array`，使用 $O(n)$ 額外空間。
- 其餘變數皆為常數空間。
- 總空間複雜度為 $O(n)$。

> $O(n)$
