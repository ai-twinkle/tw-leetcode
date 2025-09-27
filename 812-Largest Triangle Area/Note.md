# 812. Largest Triangle Area

Given an array of points on the X-Y plane `points` where `points[i] = [x_i, y_i]`, return the area of the largest triangle that can be formed by any three different points. 
Answers within `10^-5` of the actual answer will be accepted.

**Constraints:**

- `3 <= points.length <= 50`
- `-50 <= x_i, y_i <= 50`
- All the given points are unique.

## 基礎思路

本題要求在二維平面上一組點中，找出**任選三點**所能構成的**最大三角形面積**。

在思考解法時，需注意：

- **三角形只會出現在凸包上**：若某點位於凸包內部，它不可能與其他兩點構成最大面積的三角形，因此可先取**凸包**以縮小搜尋範圍。
- **最大面積與幾何單調性**：在固定兩個頂點時，第三個頂點沿著凸包移動時，對應的面積呈現「先增後減」的單峰性；這允許使用 **旋轉卡尺（Rotating Calipers）** 在凸包上以接近線性的方式尋找最佳第三點。
- **計算穩定性與效率**：面積可用向量叉積（或鞋帶公式）計算；先將點排序並構造凸包（如單調鏈法），再用旋轉卡尺於凸包頂點上枚舉，整體效率良好。

為達成目標，可採用以下策略：

- **座標預處理**：整理座標資料以利快速存取與幾何運算。
- **構造凸包**：先依座標排序，使用單調鏈法建立下/上凸包，得到逆時針有序的凸包頂點。
- **旋轉卡尺尋優**：在凸包上以兩層指標枚舉邊，第三指標單調前進，維持當前最大面積。
- **面積計算**：以叉積求出「兩倍面積」，最後再除以 2 得到實際面積。

## 解題步驟

### Step 1：早退出條件 —— 點數少於 3 無法成三角形

若點數小於 3，沒有任何三角形可形成，直接回傳 0。

```typescript
const totalPointCount = points.length;

// 1. 早退出：若點數少於 3，無法形成三角形
if (totalPointCount < 3) {
  return 0;
}
```

### Step 2：將座標拷貝到 TypedArray，加速數值存取

以 `Float64Array` 儲存 `x`、`y`，提升後續幾何計算的存取效率。

```typescript
// 2. 將座標複製到 TypedArray 以加速數值讀取
const xCoordinates = new Float64Array(totalPointCount);
const yCoordinates = new Float64Array(totalPointCount);
for (let pointIndex = 0; pointIndex < totalPointCount; pointIndex++) {
  const currentPoint = points[pointIndex];
  xCoordinates[pointIndex] = currentPoint[0];
  yCoordinates[pointIndex] = currentPoint[1];
}
```

### Step 3：按 (x, 再 y) 對索引排序，作為凸包建構前置

先建立索引陣列並依座標排序，供單調鏈法使用。

```typescript
// 3. 依 (x 再 y) 對點索引排序，供凸包建構使用
const sortedIndices: number[] = new Array(totalPointCount);
for (let pointIndex = 0; pointIndex < totalPointCount; pointIndex++) {
  sortedIndices[pointIndex] = pointIndex;
}
sortedIndices.sort((firstIndex, secondIndex) => {
  const deltaX = xCoordinates[firstIndex] - xCoordinates[secondIndex];
  if (deltaX !== 0) {
    return deltaX;
  }
  return yCoordinates[firstIndex] - yCoordinates[secondIndex];
});
```

### Step 4：工具函式——計算叉積以判斷轉向

以叉積（向量面積）判斷三點的轉向：正為逆時針，負為順時針，零為共線。

```typescript
/**
 * 計算叉積 (OA × OB) 以判斷轉向。
 *
 * @param {number} originIndex - 原點 O 的索引。
 * @param {number} aIndex - 點 A 的索引。
 * @param {number} bIndex - 點 B 的索引。
 * @return {number} 若 O→A→B 為逆時針回傳正值；順時針為負；共線為 0。
 */
function computeCrossProduct(originIndex: number, aIndex: number, bIndex: number): number {
  const vectorAX = xCoordinates[aIndex] - xCoordinates[originIndex];
  const vectorAY = yCoordinates[aIndex] - yCoordinates[originIndex];
  const vectorBX = xCoordinates[bIndex] - xCoordinates[originIndex];
  const vectorBY = yCoordinates[bIndex] - yCoordinates[originIndex];
  return vectorAX * vectorBY - vectorAY * vectorBX;
}
```

### Step 5：建立下凸包（單調鏈法）

從左至右掃描，維持凸性；當出現非逆時針轉向時，彈出最後一點。

```typescript
// 4. 建構下凸包
const convexHull: number[] = [];
for (let index = 0; index < totalPointCount; index++) {
  const currentIndex = sortedIndices[index];
  while (convexHull.length >= 2) {
    const lastIndex = convexHull[convexHull.length - 1];
    const secondLastIndex = convexHull[convexHull.length - 2];
    if (computeCrossProduct(secondLastIndex, lastIndex, currentIndex) <= 0) {
      convexHull.pop();
    } else {
      break;
    }
  }
  convexHull.push(currentIndex);
}
```

### Step 6：建立上凸包（單調鏈法）

逆向掃描補齊上半部，持續維持凸性。

```typescript
// 5. 建構上凸包
const lowerHullSize = convexHull.length;
for (let index = totalPointCount - 2; index >= 0; index--) {
  const currentIndex = sortedIndices[index];
  while (convexHull.length > lowerHullSize) {
    const lastIndex = convexHull[convexHull.length - 1];
    const secondLastIndex = convexHull[convexHull.length - 2];
    if (computeCrossProduct(secondLastIndex, lastIndex, currentIndex) <= 0) {
      convexHull.pop();
    } else {
      break;
    }
  }
  convexHull.push(currentIndex);
}
```

### Step 7：去除收尾重複點並檢查凸包頂點數

單調鏈會在尾端重覆起點一次，需去除；若頂點少於 3，無三角形可形成。

```typescript
// 6. 若尾端重複加入起點，移除之
if (convexHull.length > 1) {
  convexHull.pop();
}

const hullVertexCount = convexHull.length;

// 7. 凸包頂點少於 3，無法形成三角形
if (hullVertexCount < 3) {
  return 0;
}
```

### Step 8：將凸包座標拷貝到 TypedArray，並複製一圈以便環狀訪問

為了旋轉卡尺處理方便，將凸包座標展開為兩圈，省去取模運算。

```typescript
// 8. 將凸包座標拷貝到 TypedArray，並複製一圈以支援環狀索引
const hullXCoordinates = new Float64Array(hullVertexCount * 2);
const hullYCoordinates = new Float64Array(hullVertexCount * 2);
for (let vertexIndex = 0; vertexIndex < hullVertexCount; vertexIndex++) {
  const originalIndex = convexHull[vertexIndex];
  const x = xCoordinates[originalIndex];
  const y = yCoordinates[originalIndex];
  hullXCoordinates[vertexIndex] = x;
  hullYCoordinates[vertexIndex] = y;
  hullXCoordinates[vertexIndex + hullVertexCount] = x;
  hullYCoordinates[vertexIndex + hullVertexCount] = y;
}
```

### Step 9：工具函式——以叉積計算「兩倍三角形面積」

固定頂點 `i`，以 `j`、`k` 形成兩向量，叉積即為兩倍面積；凸包為逆時針，結果非負。

```typescript
/**
 * 以凸包頂點索引計算三角形的兩倍面積。
 *
 * @param {number} i - 第一個頂點索引。
 * @param {number} j - 第二個頂點索引。
 * @param {number} k - 第三個頂點索引。
 * @return {number} 三角形兩倍面積（因凸包為逆時針，非負）。
 */
function computeTwiceTriangleArea(i: number, j: number, k: number): number {
  const baseX = hullXCoordinates[i];
  const baseY = hullYCoordinates[i];
  const vectorJX = hullXCoordinates[j] - baseX;
  const vectorJY = hullYCoordinates[j] - baseY;
  const vectorKX = hullXCoordinates[k] - baseX;
  const vectorKY = hullYCoordinates[k] - baseY;
  return vectorJX * vectorKY - vectorJY * vectorKX;
}
```

### Step 10：旋轉卡尺於凸包上尋找最大三角形（O(h²)）

枚舉邊 `(i, j)`，第三點 `k` 單調前進以最大化面積，持續更新答案。

```typescript
// 9. 使用旋轉卡尺在 O(h^2) 內找最大三角形
let maximumTwiceArea = 0;
for (let i = 0; i < hullVertexCount; i++) {
  let k = i + 2;
  for (let j = i + 1; j < i + hullVertexCount - 1; j++) {
    while (k + 1 < i + hullVertexCount) {
      const currentArea = computeTwiceTriangleArea(i, j, k);
      const nextArea = computeTwiceTriangleArea(i, j, k + 1);
      if (nextArea > currentArea) {
        k++;
      } else {
        break;
      }
    }
    const area = computeTwiceTriangleArea(i, j, k);
    if (area > maximumTwiceArea) {
      maximumTwiceArea = area;
    }
  }
}
```

### Step 11：將兩倍面積轉為實際面積並回傳

最終答案為 `maximumTwiceArea / 2`。

```typescript
// 10. 由兩倍面積轉為實際三角形面積並回傳
return maximumTwiceArea * 0.5;
```

## 時間複雜度

- 構造凸包（單調鏈 + 排序）：$O(n \log n)$，其中 $n$ 為點的數量。
- 旋轉卡尺枚舉最大三角形：$O(h^2)$，其中 $h$ 為凸包頂點數，且 $h \le n$。
- 其餘步驟（拷貝座標、常數時間計算）皆不超過上述主項。
- 總時間複雜度為 $O(n \log n + h^2)$。

> $O(n \log n + h^2)$

## 空間複雜度

- 儲存原始座標與凸包座標的陣列、索引與工作結構，整體與點數同階。
- 不含輸入的額外空間主要為若干陣列與堆疊，量級為 $O(n)$。
- 總空間複雜度為 $O(n)$。

> $O(n)$
