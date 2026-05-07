# 1861. Rotating the Box

You are given an `m x n` matrix of characters `boxGrid` representing a side-view of a box. 
Each cell of the box is one of the following:

- A stone `'#'`
- A stationary obstacle `'*'`
- Empty `'.'`

The box is rotated 90 degrees clockwise, causing some of the stones to fall due to gravity. 
Each stone falls down until it lands on an obstacle, another stone, or the bottom of the box. 
Gravity does not affect the obstacles' positions, 
and the inertia from the box's rotation does not affect the stones' horizontal positions.

It is guaranteed that each stone in `boxGrid` rests on an obstacle, another stone, or the bottom of the box.

Return an `n x m` matrix representing the box after the rotation described above.

**Constraints:**

- `m == boxGrid.length`
- `n == boxGrid[i].length`
- `1 <= m, n <= 500`
- `boxGrid[i][j]` is either `'#'`, `'*'`, or `'.'`.

## 基礎思路

本題要求模擬一個裝有石頭、障礙物與空格的箱子順時針旋轉 90 度後的狀態。旋轉後重力方向改變，石頭會因此向下滑落，直到碰到障礙物、其他石頭或底部為止。

在思考解法時，可掌握以下核心觀察：

- **旋轉與重力可以拆分處理**：
  順時針旋轉 90 度的座標映射關係固定，因此可以先在原始座標中模擬重力，再將結果寫入旋轉後的位置，兩個操作可在一次遍歷中合併完成。

- **重力模擬等同於「貪婪地往右堆疊石頭」**：
  在旋轉前，重力方向對應原始矩陣的「向右」方向；每顆石頭應盡可能往右落，直到遇到障礙物或右牆為止。因此可用一個「落點指標」從右向左掃描，遇到石頭就放到落點再將落點左移。

- **障礙物重設落點範圍**：
  障礙物不受重力影響，但它會截斷石頭的落點區間；每次遇到障礙物時，需將落點指標重置到障礙物左側，確保後續石頭不會越過障礙物。

- **座標映射是線性且對稱的**：
  原始的第 `r` 行在旋轉後會成為第 `rows - 1 - r` 列，原始的第 `c` 列在旋轉後會成為第 `c` 行；此映射可直接在寫入結果時套用，不需額外的旋轉步驟。

依據以上特性，可以採用以下策略：

- **預先分配旋轉後尺寸的結果矩陣並填滿空格**，空格是最多的情況，預填後只需寫入石頭與障礙物。
- **逐行掃描原始矩陣，對每行維護一個落點指標，從右向左處理**；遇到石頭就落到指標位置，遇到障礙物就固定寫入並重設指標。
- **每次寫入時直接套用座標映射**，一次遍歷同時完成重力模擬與旋轉輸出。

此策略以單次線性掃描即可完成所有工作，避免了先模擬再旋轉的兩次遍歷。

## 解題步驟

### Step 1：初始化維度與預分配旋轉後的結果矩陣

旋轉後矩陣的尺寸為 `cols × rows`，先建立此大小的二維陣列，並將每個格子預填為空格 `'.'`；由於空格佔多數，預填後後續只需寫入石頭與障礙物即可。

```typescript
const rows = boxGrid.length;
const cols = boxGrid[0].length;

// 預先分配旋轉後的結果並將每格填為 '.'
// 在 V8 中手動填充比 Array.fill 或 Array.from 更快
const result: string[][] = new Array(cols);
for (let columnIndex = 0; columnIndex < cols; columnIndex++) {
  const newRow: string[] = new Array(rows);
  for (let fillIndex = 0; fillIndex < rows; fillIndex++) {
    newRow[fillIndex] = ".";
  }
  result[columnIndex] = newRow;
}
```

### Step 2：對每一行取出來源列並計算旋轉後的目標欄位與初始落點

對原始矩陣的每一行，取出該行內容並計算：該行在旋轉後對應的目標欄索引（`rotatedColumn`），以及石頭從右向左掃描時的初始落點（最右側）。

```typescript
// 單次遍歷：模擬重力並直接寫入旋轉後的座標
// 來源格 (r, c) 映射至旋轉後格 (c, rows-1-r)
for (let rowIndex = 0; rowIndex < rows; rowIndex++) {
  const sourceRow = boxGrid[rowIndex];
  // 此來源行在旋轉後矩陣中對應的目標欄
  const rotatedColumn = rows - 1 - rowIndex;
  // 下一個可落點，從右向左掃描
  let landingSlot = cols - 1;

  // ...
}
```

### Step 3：從右向左掃描該行，依格子類型處理障礙物與石頭

在每行中從右向左逐格掃描；遇到障礙物時直接寫入其原始位置並將落點重置到障礙物左側，遇到石頭時則將其寫入目前落點再將落點左移，空格已預填無需處理。

```typescript
for (let rowIndex = 0; rowIndex < rows; rowIndex++) {
  // Step 2：取出來源列並初始化旋轉欄位與落點

  for (let colIndex = cols - 1; colIndex >= 0; colIndex--) {
    const cell = sourceRow[colIndex];
    if (cell === "*") {
      // 障礙物保持原欄位；將落點重設至其左側
      result[colIndex][rotatedColumn] = "*";
      landingSlot = colIndex - 1;
    } else if (cell === "#") {
      // 石頭落到旋轉後矩陣的當前落點
      result[landingSlot][rotatedColumn] = "#";
      landingSlot--;
    }
    // 空格 '.' 無需處理，結果已預填
  }
}
```

### Step 4：回傳完成旋轉與重力模擬的結果矩陣

所有行掃描完畢後，結果矩陣即為旋轉並套用重力後的最終狀態，直接回傳。

```typescript
return result;
```

## 時間複雜度

- 預填結果矩陣需遍歷所有 `cols × rows` 個格子，耗時 $O(m \cdot n)$；
- 主迴圈對原始矩陣每個格子恰好處理一次，耗時 $O(m \cdot n)$；
- 總時間複雜度為 $O(m \cdot n)$。

> $O(m \cdot n)$

## 空間複雜度

- 結果矩陣大小為 $n \times m$，耗用 $O(m \cdot n)$ 空間；
- 除結果矩陣外僅使用常數個輔助變數。
- 總空間複雜度為 $O(m \cdot n)$。

> $O(m \cdot n)$
