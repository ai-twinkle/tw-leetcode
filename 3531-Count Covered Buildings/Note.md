# 3531. Count Covered Buildings

You are given a positive integer `n`, representing an `n x n` city. 
You are also given a 2D grid `buildings`, where `buildings[i] = [x, y]` denotes a unique building located at coordinates `[x, y]`.

A building is covered if there is at least one building in all four directions: left, right, above, and below.

Return the number of covered buildings.

**Constraints:**

- `2 <= n <= 10^5`
- `1 <= buildings.length <= 10^5`
- `buildings[i] = [x, y]`
- `1 <= x, y <= n`
- All coordinates of `buildings` are unique.

## 基礎思路

題目要求找出在一座 `n x n` 城市網格中，被「上下左右四個方向皆有建築包夾」的建築數量。
若一棟建築在：

* 同一列（y 相同）中 **左側存在建築**（x 更小）
* 右側存在建築（x 更大）
* 同一行（x 相同）中 **上方存在建築**（y 更小）
* 下方存在建築（y 更大）

則稱其為 **covered building**。

在分析本題時，有幾個重要觀察：

* **同列與同行的極值決定方向是否有建築**
  若想得知 `(x, y)` 左側是否有建築，只需知道同一列 y 中是否存在最小 x 小於該建築。
  同理可檢查右側、上方、下方。

* **不需要排序或建立 map**
  因為 x、y 範圍高達 `10^5`，可直接以 x 與 y 作為 index 放入 TypedArray 中，效率與記憶體布局良好。

* **兩趟掃描即可完成**

    * 第 1 趟先統計每列、每行的 min / max 位置
    * 第 2 趟逐一檢查是否嚴格位於四個方向的 min / max 之間

整體流程時間複雜度為線性，完全適用於 `buildings.length <= 10^5` 的限制。

## 解題步驟

### Step 1：初始化行列極值表

建立 4 個陣列存放每列的最小/最大 x、每行的最小/最大 y。
最小值需初始化為一個比所有合法座標都大的 sentinel（n + 1）。

```typescript
// 使用 TypedArray 提升效能與記憶體區塊連續性
const maxRow = new Int32Array(n + 1);
const minRow = new Int32Array(n + 1);
const maxCol = new Int32Array(n + 1);
const minCol = new Int32Array(n + 1);

// 將 min 陣列初始化為 large sentinel 值（n + 1）
for (let index = 1; index <= n; index++) {
  minRow[index] = n + 1;
  minCol[index] = n + 1;
}

const totalBuildings = buildings.length;
```

### Step 2：第一次掃描建築 — 建立每列 / 每行的極值資訊

掃描所有建築，對每一列 y 取得 minX / maxX，
對每一行 x 取得 minY / maxY。
這樣後續就能快速判斷建築是否被包夾。

```typescript
// 第一次掃描：記錄每列與每行上的最小 / 最大座標
for (let index = 0; index < totalBuildings; index++) {
  const currentBuilding = buildings[index];
  const x = currentBuilding[0];
  const y = currentBuilding[1];

  // 更新該列 y 的 x 範圍（左右方向用）
  if (x > maxRow[y]) {
    maxRow[y] = x;
  }
  if (x < minRow[y]) {
    minRow[y] = x;
  }

  // 更新該行 x 的 y 範圍（上下方向用）
  if (y > maxCol[x]) {
    maxCol[x] = y;
  }
  if (y < minCol[x]) {
    minCol[x] = y;
  }
}
```

### Step 3：第二次掃描建築 — 判定是否四向皆存在建築

在同一個最外層迴圈中，檢查是否：

* 左側存在建築：`x > minRow[y]`
* 右側存在建築：`x < maxRow[y]`
* 上側存在建築：`y > minCol[x]`
* 下側存在建築：`y < maxCol[x]`

若四項皆成立，即可判定此建築為 covered。

```typescript
// 第二次掃描：判斷是否在四個方向皆有其他建築
let coveredCount = 0;

for (let index = 0; index < totalBuildings; index++) {
  const currentBuilding = buildings[index];
  const x = currentBuilding[0];
  const y = currentBuilding[1];

  // 若建築嚴格位於該列與該行的極值之間，代表四向都有建築
  if (x > minRow[y] && x < maxRow[y] && y > minCol[x] && y < maxCol[x]) {
    coveredCount++;
  }
}

return coveredCount;
```

## 時間複雜度

- 初始化四個長度 `n` 的極值陣列需花費 $O(n)$。
- 第一次掃描所有建築紀錄極值需花費 $O(m)$，其中 $m$ 為建築數量。
- 第二次掃描所有建築判斷是否被包夾需花費 $O(m)$。
- 總時間複雜度為 $O(n + m)$。

> $O(n + m)$

## 空間複雜度

- 使用四個長度為 `n + 1` 的 TypedArray，共佔用 $O(n)$。
- 額外變數皆為常數空間。
- 總空間複雜度為 $O(n)$。

> $O(n)$
