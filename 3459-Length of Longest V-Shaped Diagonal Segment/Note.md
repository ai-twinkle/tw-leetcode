# 3459. Length of Longest V-Shaped Diagonal Segment

You are given a 2D integer matrix `grid` of size `n x m`, where each element is either `0`, `1`, or `2`.

A V-shaped diagonal segment is defined as:

- The segment starts with `1`.
- The subsequent elements follow this infinite sequence: `2, 0, 2, 0, ...`.
- The segment:
  - Starts along a diagonal direction (top-left to bottom-right, bottom-right to top-left, top-right to bottom-left, or bottom-left to top-right).
  - Continues the sequence in the same diagonal direction.
  - Makes at most one clockwise 90-degree turn to another diagonal direction while maintaining the sequence.

**Constraints:**

- `n == grid.length`
- `m == grid[i].length`
- `1 <= n, m <= 500`
- `grid[i][j]` is either `0`, `1` or `2`.

## 基礎思路

本題要尋找矩陣中最長的「V 形對角段」。規則是：

1. **起點必須是 `1`**。
2. 後續值必須依序為 `2, 0, 2, 0, ...` 的交替模式。
3. 路徑沿四個對角方向之一（↘、↙、↖、↗）延伸。
4. 整段路徑最多允許一次 **順時針 90°** 的轉向，形成 V 字形。

策略上我們需要同時考慮：

* **直線情況**：從 `1` 出發沿同一方向延伸。
* **轉折情況**：在某個 apex 點轉向一次，前後兩段仍維持交替序列。

為了處理這些情況，本解法分為兩個動態規劃階段：

- **Forward DP**：從起點方向往前掃，計算「以某格結尾」的最佳長度，並分別記錄以 `2` 或 `0` 結尾的情況。
- **Backward DP**：從尾端方向反向掃，計算「自某格開始」的最佳後綴長度，並將 Forward DP 的第一段與 Backward DP 的第二段結合，模擬合法的 V 字形。

最終答案取所有情況的最大值。

## 解題步驟

### Step 1：攤平成一維陣列以便快速存取

首先將二維矩陣 `grid` 攤平成一維的 typed array，方便後續用單一索引快速定位格子值。

```typescript
// 步驟 1：將二維 grid 攤平成一維 typed array
const cellValues = new Uint8Array(totalSize);
let index = 0;
for (let row = 0; row < numberOfRows; row++) {
  const gridRow = grid[row];
  for (let column = 0; column < numberOfColumns; column++) {
    cellValues[index++] = gridRow[column];
  }
}
```

### Step 2：準備四個對角方向與轉向對應

利用兩個陣列分別存儲「行偏移」與「列偏移」，來表示四種對角方向，並且建立一個對應表來表示「逆時針方向」，以便計算出合法的順時針轉折。

```typescript
// 步驟 2：準備四個對角方向
const rowDirection = new Int8Array([ 1,  1, -1, -1]);   // 行方向偏移
const columnDirection = new Int8Array([ 1, -1, -1,  1]); // 列方向偏移

const directionStep = new Int32Array(4);
for (let direction = 0; direction < 4; direction++) {
  // 計算一維陣列中的位移量
  directionStep[direction] = rowDirection[direction] * numberOfColumns + columnDirection[direction];
}

// 對應表：外放方向對應到其逆時針方向，用於判斷合法轉折
const counterClockwiseMap: Int8Array = new Int8Array([3, 0, 1, 2]);
```

### Step 3：Forward DP（計算以當前格結束的最長路徑）

針對每個方向，掃描矩陣並記錄在該方向上「以某格結尾」的最長合法路徑，分別紀錄結尾為 `2` 或 `0` 的情況。這些結果將在後續轉折時使用。

```typescript
// 步驟 3：Forward DP -> 計算在每個方向、以該格結尾的最長序列
const endWithTwo = [0, 0, 0, 0].map(() => new Uint16Array(totalSize)); // 以 2 結尾
const endWithZero = [0, 0, 0, 0].map(() => new Uint16Array(totalSize)); // 以 0 結尾

for (let direction = 0; direction < 4; direction++) {
  const deltaRow = rowDirection[direction];
  const deltaColumn = columnDirection[direction];

  // 設定掃描的起點與方向
  const startRow = deltaRow > 0 ? 0 : numberOfRows - 1;
  const endRow = deltaRow > 0 ? numberOfRows : -1;
  const stepRow = deltaRow > 0 ? 1 : -1;

  const startColumn = deltaColumn > 0 ? 0 : numberOfColumns - 1;
  const endColumn = deltaColumn > 0 ? numberOfColumns : -1;
  const stepColumn = deltaColumn > 0 ? 1 : -1;

  const endTwoArray = endWithTwo[direction];
  const endZeroArray = endWithZero[direction];

  for (let row = startRow; row !== endRow; row += stepRow) {
    const rowBase = row * numberOfColumns;
    const previousRow = row - deltaRow;
    const previousRowBase = (previousRow >= 0 && previousRow < numberOfRows) ? previousRow * numberOfColumns : -1;

    for (let column = startColumn; column !== endColumn; column += stepColumn) {
      const index = rowBase + column;
      const value = cellValues[index];

      const previousColumn = column - deltaColumn;
      const hasPrevious = (previousRow >= 0 && previousRow < numberOfRows && previousColumn >= 0 && previousColumn < numberOfColumns);
      const previousIndex = hasPrevious ? previousRowBase + previousColumn : -1;

      // 建立以 2 結尾的序列
      if (value === 2) {
        let best = 0;

        if (hasPrevious) {
          if (cellValues[previousIndex] === 1) {
            best = 2; // 開始序列: 1 -> 2
          }

          const previousEndZero = endZeroArray[previousIndex];
          if (previousEndZero !== 0) {
            const candidate = previousEndZero + 1; // 延伸情況: ...0 -> 2
            if (candidate > best) {
              best = candidate;
            }
          }
        }

        endTwoArray[index] = best;
      } else {
        endTwoArray[index] = 0;
      }

      // 建立以 0 結尾的序列
      if (value === 0) {
        let length = 0;
        if (hasPrevious) {
          const previousEndTwo = endTwoArray[previousIndex];
          if (previousEndTwo !== 0) {
            length = previousEndTwo + 1; // 延伸情況: ...2 -> 0
          }
        }
        endZeroArray[index] = length;
      } else {
        endZeroArray[index] = 0;
      }
    }
  }
}
```

### Step 4：Backward DP（計算自某格開始的最長路徑並結合轉折）

在每個「外放方向」進行反向掃描，計算從當前格開始的後綴路徑長度，並嘗試兩種情況：

1. **直線延伸**：當前格是 `1`，直接接上後續合法路徑。
2. **轉折延伸**：找到 apex 點，將「第一段 Forward DP」與「第二段 Backward DP」相加，代表一個 V 字形。

```typescript
// 步驟 4：Backward DP -> 計算從每格開始的最長序列
let bestAnswer = 0;

for (let outgoingDirection = 0; outgoingDirection < 4; outgoingDirection++) {
  const deltaRow = rowDirection[outgoingDirection];
  const deltaColumn = columnDirection[outgoingDirection];

  // 轉折需要參考「逆時針」方向的 Forward DP
  const incomingDirection = counterClockwiseMap[outgoingDirection];
  const incomingEndTwo = endWithTwo[incomingDirection];
  const incomingEndZero = endWithZero[incomingDirection];

  // 設定反向掃描起點
  const startRow = deltaRow > 0 ? numberOfRows - 1 : 0;
  const endRow = deltaRow > 0 ? -1 : numberOfRows;
  const stepRow = deltaRow > 0 ? -1 : 1;

  const startColumn = deltaColumn > 0 ? numberOfColumns - 1 : 0;
  const endColumn = deltaColumn > 0 ? -1 : numberOfColumns;
  const stepColumn = deltaColumn > 0 ? -1 : 1;

  // 記錄從當前格開始的最長延伸
  const remainWithTwo = new Uint16Array(totalSize);  // 從這裡開始，以 2 開頭
  const remainWithZero = new Uint16Array(totalSize); // 從這裡開始，以 0 開頭

  for (let row = startRow; row !== endRow; row += stepRow) {
    const rowBase = row * numberOfColumns;
    const nextRow = row + deltaRow;
    const nextRowBase = (nextRow >= 0 && nextRow < numberOfRows) ? nextRow * numberOfColumns : -1;

    for (let column = startColumn; column !== endColumn; column += stepColumn) {
      const index = rowBase + column;
      const value = cellValues[index];

      const nextColumn = column + deltaColumn;
      const hasNext = (nextRow >= 0 && nextRow < numberOfRows && nextColumn >= 0 && nextColumn < numberOfColumns);
      const nextIndex = hasNext ? nextRowBase + nextColumn : -1;

      const nextRemainTwo = hasNext ? remainWithTwo[nextIndex] : 0;
      const nextRemainZero = hasNext ? remainWithZero[nextIndex] : 0;

      let hereRemainTwo = 0;
      let hereRemainZero = 0;

      if (value === 2) {
        hereRemainTwo = nextRemainZero + 1; // 延伸情況: ...0 -> 2
      }

      if (value === 0) {
        hereRemainZero = nextRemainTwo + 1; // 延伸情況: ...2 -> 0
      }

      remainWithTwo[index] = hereRemainTwo;
      remainWithZero[index] = hereRemainZero;

      // 直線情況：從 1 開始一路延伸
      if (value === 1) {
        const straightLength = nextRemainTwo + 1;
        if (straightLength > bestAnswer) {
          bestAnswer = straightLength;
        }
      }

      // 轉折情況：檢查 apex 點
      const apexRow = row - deltaRow;
      const apexColumn = column - deltaColumn;
      if (apexRow >= 0 && apexRow < numberOfRows && apexColumn >= 0 && apexColumn < numberOfColumns) {
        const apexIndex = apexRow * numberOfColumns + apexColumn;
        const apexValue = cellValues[apexIndex];

        if (apexValue === 1) {
          const total = 1 + hereRemainTwo; // 轉折點為 1
          if (total > bestAnswer) {
            bestAnswer = total;
          }
        } else if (apexValue === 2) {
          const firstLeg = incomingEndTwo[apexIndex];
          if (firstLeg !== 0) {
            const total = firstLeg + hereRemainZero; // 轉折點為 2
            if (total > bestAnswer) {
              bestAnswer = total;
            }
          }
        } else {
          const firstLeg = incomingEndZero[apexIndex];
          if (firstLeg !== 0) {
            const total = firstLeg + hereRemainTwo; // 轉折點為 0
            if (total > bestAnswer) {
              bestAnswer = total;
            }
          }
        }
      }
    }
  }
}
```

### Step 5：回傳最終答案

最終輸出全域最大值。

```typescript
// 步驟 5：回傳找到的最長長度
return bestAnswer;
```

## 時間複雜度

- Forward DP：$4 \times O(n \times m)$。
- Backward DP：$4 \times O(n \times m)$。
- 總時間複雜度為 $O(n \times m)$。

> $O(n \times m)$

## 空間複雜度

- 額外使用多個 $O(n \times m)$ 大小的 typed array。
- 總空間複雜度為 $O(n \times m)$。

> $O(n \times m)$
