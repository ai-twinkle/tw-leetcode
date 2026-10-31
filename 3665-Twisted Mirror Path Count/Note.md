# 3665. Twisted Mirror Path Count

Given an `m x n` binary grid `grid` where:

- `grid[i][j] == 0` represents an empty cell, and
- `grid[i][j] == 1` represents a mirror.

A robot starts at the top-left corner of the grid `(0, 0)` 
and wants to reach the bottom-right corner `(m - 1, n - 1)`. 
It can move only right or down. 
If the robot attempts to move into a mirror cell, 
it is reflected before entering that cell:

- If it tries to move right into a mirror, 
  it is turned down and moved into the cell directly below the mirror.
- If it tries to move down into a mirror, 
  it is turned right and moved into the cell directly to the right of the mirror.

If this reflection would cause the robot to move outside the `grid` boundaries, 
the path is considered invalid and should not be counted.

Return the number of unique valid paths from `(0, 0)` to `(m - 1, n - 1)`.

Since the answer may be very large, return it modulo `10^9 + 7`.

Note: If a reflection moves the robot into a mirror cell, 
the robot is immediately reflected again based on the direction it used to enter that mirror: 
if it entered while moving right, it will be turned down; 
if it entered while moving down, it will be turned right. 
This process will continue until either the last cell is reached, 
the robot moves out of bounds or the robot moves to a non-mirror cell.

**Constraints:**

- `m == grid.length`
- `n == grid[i].length`
- `2 <= m, n <= 500`
- `grid[i][j]` is either `0` or `1`.
- `grid[0][0] == grid[m - 1][n - 1] == 0`

## 基礎思路

本題要求計算機器人從左上角走到右下角的合法路徑數。機器人只能向右或向下移動，並且在進入鏡子格時會被反射而改變方向；
若反射導致機器人離開邊界，該路徑即不合法。由於格子大小最多為 500 × 500，路徑數極為龐大，必須以動態規劃配合取模計算。

在思考解法時，可掌握以下核心觀察：

- **路徑的狀態不只取決於位置，也取決於進入方向**：
  空格對兩種進入方向的處理相同，鏡子則會依進入方向決定下一步。因此每個格子都需要分別記錄「向右進入」與「向下進入」的路徑數。

- **空格會合併兩種來源並同時往兩個方向擴散**：
  抵達空格的所有路徑都可以自由選擇向右或向下，所以從該格向右與向下送出的路徑數，都等於抵達該格的總路徑數。

- **鏡子會交換方向**：
  向右進入鏡子的路徑會全部轉為向下送出，向下進入鏡子的路徑會全部轉為向右送出。連續反射因此會自然沿著格子傳遞，不需要額外模擬。

- **越界的路徑會自然消失**：
  從最右欄向右送出、或從最底列向下送出的路徑不會再被任何格子接收，正好符合「越界路徑不計」的要求。

- **移動方向只有右與下，因此狀態轉移具有單調順序**：
  依列由上而下、每列由左而右掃描，即可保證處理每一格時，其所有來源都已計算完成。

依據以上特性，可以採用以下策略：

- **以一維陣列保存「向下進入各欄」的路徑數**，並在逐列掃描時就地更新為下一列的值。
- **以單一變數保存「向右進入當前格」的路徑數**，隨著欄位推進向右傳遞。
- **依格子類型進行轉移**：空格合併兩種來源後同時往兩個方向送出；鏡子則交換兩種來源的去向。
- **終點為空格，因此掃描結束後，終點欄位所記錄的總和即為答案**。

此策略只需線性掃描一次整個網格，並以滾動陣列壓縮空間，兼顧效率與正確性。

## 解題步驟

### Step 1：定義取模常數

答案可能非常大，因此先定義取模所用的常數，供每次累加時使用。

```typescript
const MODULO = 1_000_000_007;
```

### Step 2：取得網格尺寸並初始化向下流量陣列

先取得列數與欄數，再建立一個長度為欄數的陣列，記錄「以向下方向進入當前列各欄」的路徑數。
為了讓起點格與其他格使用相同的轉移邏輯，將起點視為有一條路徑從上方進入。

```typescript
const rowCount = grid.length;
const columnCount = grid[0].length;

// downFlow[column] = 機器人以向下方向進入當前列此欄的路徑數
const downFlow = new Int32Array(columnCount);

// 將起點視為有一條路徑從上方進入
downFlow[0] = 1;
```

### Step 3：逐列掃描並重置向右流量

由上而下處理每一列。每列開始時先取得該列資料，並將「向右進入當前格」的路徑數歸零，因為第 0 欄不可能有從左方進入的路徑。

```typescript
for (let rowIndex = 0; rowIndex < rowCount; rowIndex++) {
  const row = grid[rowIndex];

  // 以向右方向進入當前格的路徑數（第 0 欄不會有從左方進入的路徑）
  let rightFlow = 0;

  // ...
}
```

### Step 4：逐欄處理空格，合併兩種來源並同時向右與向下送出

在每一列中由左而右處理各欄。先取出從上方進入此格的路徑數。
若當前格為空格，則將向右進入與向下進入的路徑數相加並取模，得到抵達此格的總路徑數；這些路徑都可以繼續向右或向下，因此向下送往下一列與向右送往下一欄的路徑數都設為此總和。

```typescript
for (let rowIndex = 0; rowIndex < rowCount; rowIndex++) {
  // Step 3：取得當前列並重置向右流量

  for (let columnIndex = 0; columnIndex < columnCount; columnIndex++) {
    const fromAbove = downFlow[columnIndex];

    if (row[columnIndex] === 0) {
      // 空格：每條抵達的路徑都可繼續向右或向下
      let total = rightFlow + fromAbove;
      if (total >= MODULO) {
        total -= MODULO;
      }
      downFlow[columnIndex] = total;
      rightFlow = total;
    } else {
      // ...
    }
  }
}
```

### Step 5：處理鏡子格，交換兩種來源的去向

若當前格為鏡子，向右進入的路徑會被轉為向下，因此成為送往下一列此欄的路徑數；向下進入的路徑會被轉為向右，因此成為送往下一欄的路徑數。
連續反射會透過這樣的傳遞自然完成。越界的路徑沒有任何格子接收，因此不會被計入。

```typescript
for (let rowIndex = 0; rowIndex < rowCount; rowIndex++) {
  // Step 3：取得當前列並重置向右流量

  for (let columnIndex = 0; columnIndex < columnCount; columnIndex++) {
    // Step 4：取出上方來源並處理空格

    if (row[columnIndex] === 0) {
      // Step 4：空格合併兩種來源並同時向右與向下送出
    } else {
      // 鏡子：向右進入者轉為向下，向下進入者轉為向右
      downFlow[columnIndex] = rightFlow;
      rightFlow = fromAbove;
    }
  }
}
```

### Step 6：回傳終點的路徑總數

終點保證為空格，因此最後一列處理完後，終點欄位所儲存的值就是抵達終點的總路徑數，直接回傳即可。

```typescript
// 終點為空格，因此其儲存的總和即為所有抵達路徑的數量
return downFlow[columnCount - 1];
```

## 時間複雜度

- 網格共有 $m \times n$ 個格子，每個格子只處理一次；
- 每次處理只包含常數次加法、比較與賦值。
- 總時間複雜度為 $O(m \times n)$。

> $O(m \times n)$

## 空間複雜度

- 只使用一個長度為 $n$ 的滾動陣列記錄向下流量；
- 其餘皆為固定數量的變數。
- 總空間複雜度為 $O(n)$。

> $O(n)$
