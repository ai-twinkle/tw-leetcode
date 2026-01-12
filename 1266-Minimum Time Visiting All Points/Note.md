# 1266. Minimum Time Visiting All Points

On a 2D plane, there are `n` points with integer coordinates `points[i] = [x_i, y_i]`. 
Return the minimum time in seconds to visit all the points in the order given by `points`.

You can move according to these rules:

- In `1` second, you can either:
  - move vertically by one unit,
  - move horizontally by one unit, or
  - move diagonally `sqrt(2)` units (in other words, move one unit vertically then one unit horizontally in `1` second).
- You have to visit the points in the same order as they appear in the array.
- You are allowed to pass through points that appear later in the order, but these do not count as visits.

**Constraints:**

- `points.length == n`
- `1 <= n <= 100`
- `points[i].length == 2`
- `-1000 <= points[i][0], points[i][1] <= 1000`

## 基礎思路

本題要求依序拜訪平面上的多個整數座標點，並計算最短所需時間。每秒可以選擇水平移動 1、垂直移動 1，或同時水平與垂直各移動 1（對應一次對角移動）。

在思考兩點之間的最短時間時，有一個核心觀察：

* 從 `(x1, y1)` 移動到 `(x2, y2)` 時，水平距離為 `|x2 - x1|`，垂直距離為 `|y2 - y1|`。
* 對角移動每秒能同時減少水平與垂直距離各 1，因此能「同時消耗」兩個方向的距離。
* 先用對角移動消耗掉兩者較小的部分後，剩餘只能用單向移動補齊較大的那一邊。

因此，兩點間最短時間等於：

* `max(|dx|, |dy|)`（因為每秒最多同時消耗掉一個水平與一個垂直單位，總秒數受較大差值支配）

題目要求按順序拜訪所有點，所以總時間就是把每一段相鄰點的最短時間加總即可。

## 解題步驟

### Step 1：處理邊界情況與初始化總時間

若點數小於等於 1，不需要移動，直接回傳 0；否則初始化累計時間。

```typescript
const pointsLength = points.length;
if (pointsLength <= 1) {
  return 0;
}

let totalTime = 0;
```

### Step 2：初始化上一個點座標（降低重複索引成本）

先取出第 0 個點作為上一個位置，並把 x、y 拆成獨立變數，避免之後反覆做巢狀陣列索引。

```typescript
// 追蹤上一個座標以避免重複的巢狀陣列讀取
let previousPoint = points[0];
let previousX = previousPoint[0];
let previousY = previousPoint[1];
```

### Step 3：逐段遍歷相鄰點並取出當前座標

從第 1 個點開始，依序取出當前點的 x、y，準備計算與上一點的距離差。

```typescript
for (let index = 1; index < pointsLength; index++) {
  const currentPoint = points[index];
  const currentX = currentPoint[0];
  const currentY = currentPoint[1];

  // ...
}
```

### Step 4：計算水平與垂直距離的絕對值

以差值計算 `deltaX`、`deltaY`，並用條件判斷轉成絕對值，得到兩方向需要移動的單位數。

```typescript
for (let index = 1; index < pointsLength; index++) {
  // Step 3：逐段遍歷相鄰點並取出當前座標

  let deltaX = currentX - previousX;
  if (deltaX < 0) {
    deltaX = -deltaX;
  }

  let deltaY = currentY - previousY;
  if (deltaY < 0) {
    deltaY = -deltaY;
  }

  // ...
}
```

### Step 5：以 `max(deltaX, deltaY)` 累加此段最短時間

每秒最多能做一次對角移動（同時減少兩個方向各 1），因此這段的最短時間由較大的距離決定，也就是 `max(deltaX, deltaY)`，加到 `totalTime`。

```typescript
for (let index = 1; index < pointsLength; index++) {
  // Step 3：逐段遍歷相鄰點並取出當前座標

  // Step 4：計算水平與垂直距離的絕對值

  // 每秒可以做一次對角移動（同時減少兩個差值），因此時間為 max(deltaX, deltaY)
  if (deltaX >= deltaY) {
    totalTime += deltaX;
  } else {
    totalTime += deltaY;
  }

  // ...
}
```

### Step 6：更新上一點座標並繼續下一段

完成當前段的時間累加後，更新 `previousX`、`previousY`，讓下一輪使用當前點作為新起點。

```typescript
for (let index = 1; index < pointsLength; index++) {
  // Step 3：逐段遍歷相鄰點並取出當前座標

  // Step 4：計算水平與垂直距離的絕對值

  // Step 5：以 max(deltaX, deltaY) 累加此段最短時間

  previousX = currentX;
  previousY = currentY;
}
```

### Step 7：回傳總時間

所有相鄰點段落處理完後，回傳累積的最短總時間。

```typescript
return totalTime;
```

## 時間複雜度

- 主迴圈從 `index = 1` 到 `pointsLength - 1`，執行次數為 `n - 1`（令 `n = points.length`）。
- 每次迴圈內只包含固定數量的算術與比較操作，皆為常數時間。
- 總時間複雜度為 $O(n)$。

> $O(n)$

## 空間複雜度

- 只使用固定數量的變數（`totalTime`, `previousX`, `previousY`, `deltaX`, `deltaY` 等），不隨 `n` 成長。
- 未配置額外與輸入規模相關的資料結構。
- 總空間複雜度為 $O(1)$。

> $O(1)$
