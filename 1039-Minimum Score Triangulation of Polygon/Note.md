# 1039. Minimum Score Triangulation of Polygon

You have a convex `n`-sided polygon where each vertex has an integer value. 
You are given an integer array `values` where `values[i]` is the value of the $i^th$ vertex in clockwise order.

Polygon triangulation is a process where you divide a polygon into a set of triangles and the vertices of each triangle must also be vertices of the original polygon. 
Note that no other shapes other than triangles are allowed in the division. 
This process will result in `n - 2` triangles.

You will triangulate the polygon. 
For each triangle, the weight of that triangle is the product of the values at its vertices. 
The total score of the triangulation is the sum of these weights over all `n - 2` triangles.

Return the minimum possible score that you can achieve with some triangulation of the polygon.

**Constraints:**

- `n == values.length`
- `3 <= n <= 50`
- `1 <= values[i] <= 100`

## 基礎思路

本題要我們對一個凸多邊形進行三角剖分，並使所有形成三角形的權重和最小化。每個三角形的權重為其三個頂點的值相乘。由於一個 $n$ 邊形必定會被劃分為 $n - 2$ 個三角形，因此問題可轉化為：**如何選擇劃分順序，使得總和最小**。

在思考解法時，我們需要特別注意幾個重點：

- **基本情況**：若多邊形僅為三角形，則唯一的分數即為三點乘積；
- **子問題結構**：在選定某個「中間頂點」後，會形成一個三角形，並將問題分割為兩個更小的子多邊形；
- **重疊子問題**：不同的劃分可能共享相同的子多邊形結果，因此適合使用動態規劃記錄；
- **最優子結構**：每個子多邊形的最小分數可由所有可能的劃分點取最小值而得。

為了解決這個問題，我們可以採取以下策略：

- **動態規劃（區間 DP）**：對於每一段子多邊形 `(i, j)`，嘗試以不同的中點 `k` 劃分，計算對應的三角形分數與子問題最小值，取最小者作為結果；
- **遞增區間長度處理**：由小到大處理子多邊形，確保在計算大區間時，小區間已被計算完成；
- **記憶化表格**：使用二維 DP 表儲存每個 `(i, j)` 的最佳分數，避免重複計算；
- **最佳化細節**：利用一維陣列模擬二維表格並預先計算行起點，降低索引計算開銷。

## 解題步驟

### Step 1：處理基本情況（三角形）

若輸入為三角形，則直接回傳三點乘積，因為無需再分割。

```typescript
// 若多邊形僅有三個頂點，直接回傳三點乘積
if (numberOfVertices === 3) {
  return values[0] * values[1] * values[2];
}
```

### Step 2：準備頂點數據

將輸入的頂點值複製到緊湊型態陣列中，便於後續存取。

```typescript
// 將頂點值複製到緊湊型 TypedArray
const vertexValues = new Uint16Array(numberOfVertices);
for (let index = 0; index < numberOfVertices; index++) {
  vertexValues[index] = values[index];
}
```

### Step 3：初始化 DP 表與索引加速

建立平坦化的一維 DP 表 `minimumScoreTable`，並計算每行起點索引，避免重複乘法。

```typescript
// 建立一維 DP 表：dp[i * n + j] 儲存子多邊形 (i, j) 的最小分數
const minimumScoreTable = new Uint32Array(numberOfVertices * numberOfVertices);

// 預先計算每一行的起始索引
const rowStartIndex = new Int32Array(numberOfVertices);
for (let index = 0; index < numberOfVertices; index++) {
  rowStartIndex[index] = index * numberOfVertices;
}
```

### Step 4：設定初始化值

使用大數作為初始比較基準，確保後續能被更新。

```typescript
// 初始化最大哨兵值
const maximumSentinelValue = 0x3f3f3f3f;
```

### Step 5：動態規劃遞增處理區間長度

由區間長度 2 開始遞增處理，每次考慮 `(i, j)` 子多邊形的最佳劃分。

```typescript
// 依區間長度遞增計算 DP
for (let segmentLength = 2; segmentLength < numberOfVertices; segmentLength++) {
  for (let leftIndex = 0; leftIndex + segmentLength < numberOfVertices; leftIndex++) {
    const rightIndex = leftIndex + segmentLength;

    // 預先計算兩端點的乘積
    const endpointProduct = vertexValues[leftIndex] * vertexValues[rightIndex];

    let bestScore = maximumSentinelValue;

    // ...
  }
}
```

### Step 6：嘗試所有中點分割

對每個可能的中點 `middleIndex`，計算左子多邊形、右子多邊形與當前三角形的分數，取最小值更新。

```typescript
for (let segmentLength = 2; segmentLength < numberOfVertices; segmentLength++) {
  for (let leftIndex = 0; leftIndex + segmentLength < numberOfVertices; leftIndex++) {
    // Step 5：動態規劃遞增處理區間長度
  
    // 嘗試每個中點作為三角形的第三個頂點
    for (let middleIndex = leftIndex + 1; middleIndex < rightIndex; middleIndex++) {
      const leftSubScore =
        minimumScoreTable[rowStartIndex[leftIndex] + middleIndex];
      const rightSubScore =
        minimumScoreTable[rowStartIndex[middleIndex] + rightIndex];
      const triangleScore =
        endpointProduct * vertexValues[middleIndex];

      const candidateScore = leftSubScore + rightSubScore + triangleScore;
      if (candidateScore < bestScore) {
        bestScore = candidateScore;
      }
    }

    // 儲存子多邊形 (i, j) 的最佳分數
    minimumScoreTable[rowStartIndex[leftIndex] + rightIndex] = bestScore;
  }
}
```

### Step 7：回傳最終結果

結果為完整多邊形 `(0, n - 1)` 的最佳分數。

```typescript
// 回傳整個多邊形的最小分數
return minimumScoreTable[rowStartIndex[0] + (numberOfVertices - 1)];
```

## 時間複雜度

- 外層迴圈控制區間長度 $O(n)$；
- 中層迴圈控制左端點 $O(n)$；
- 內層嘗試中點劃分 $O(n)$；
- 總時間複雜度為 $O(n^3)$。

> $O(n^3)$

## 空間複雜度

- 使用一維 DP 表與索引輔助陣列，皆為 $O(n^2)$；
- 其餘僅常數額外空間。
- 總空間複雜度為 $O(n^2)$。

> $O(n^2)$
