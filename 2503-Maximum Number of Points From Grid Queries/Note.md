# 2503. Maximum Number of Points From Grid Queries

You are given an `m x n` integer matrix `grid` and an array `queries` of size `k`.

Find an array `answer` of size `k` such that for each integer `queries[i]` you start in the top left cell of the matrix and repeat the following process:

- If `queries[i]` is strictly greater than the value of the current cell that you are in, 
  then you get one point if it is your first time visiting this cell, 
  and you can move to any adjacent cell in all `4` directions: up, down, left, and right.
- Otherwise, you do not get any points, and you end this process.

After the process, `answer[i]` is the maximum number of points you can get. 
Note that for each query you are allowed to visit the same cell multiple times.

Return the resulting array `answer`.

## 基礎思路

這題的情境可以想像成「遊戲中的角色從迷宮的入口 (左上角格子) 出發，每個格子都有一個難度值」。
每次我們有一個能量值（即查詢值），我們可以從入口開始探索，只要我們目前的能量 **嚴格大於** 所在格子的難度值，我們就可以：

- **獲得該格子內的 1 分（僅第一次走訪時）**
- 繼續向四個方向（上下左右）探索相鄰格子（如果相鄰格子也是可以通過的話）

當我們遇到一個格子的難度值大於或等於我們的能量值，就無法繼續前進，探索就結束了。

因為題目可能給我們很多次不同的能量值（多次查詢），每次都重複以上步驟會很慢。

因此我們需要更聰明的作法：

- **事先將所有格子依照難度從小到大排序，逐步將它們「打開（激活）」**  
  隨著我們的能量值增加，能通過的格子數量也會越來越多。這時，原本無法互相連通的格子，可能就會因為中間新開通的格子而形成更大的連通區域。

- **使用並查集來記錄格子的連通狀況**  
  「並查集（Union-Find）」是一個資料結構，可以有效地幫我們合併相鄰的格子並追蹤已經連成一片區域的格子數量。  
  一旦入口（左上角）格子也被開通，我們馬上就能知道從入口能夠到達多少已開通的格子。

這樣一來，每次查詢時，我們只需檢查入口是否開通，就能迅速知道可以拿到的最大分數（能到達多少格子）。

## 解題步驟

### Step 1：資料預處理與排序

- **扁平化格子資訊**  
  將 `m x n` 的矩陣展平成一個列表，每個元素為 `[row, col, value]`，並依格子值由小到大排序。

- **查詢值排序**  
  將查詢數組與其原始索引打包成 `[queryValue, index]` 的形式，並根據查詢值從小到大排序。這樣在逐步啟動格子的過程中，我們可以同步處理所有查詢。

```typescript
// 將格子展平成 [row, col, value] 並排序
const gridCells: [number, number, number][] = [];
for (let row = 0; row < rows; row++) {
  for (let col = 0; col < cols; col++) {
    gridCells.push([row, col, grid[row][col]]);
  }
}
gridCells.sort((a, b) => a[2] - b[2]);

// 查詢值與原始索引綁定後排序
const queriesWithIndices: [number, number][] = queries.map((value, index) => [value, index]);
queriesWithIndices.sort((a, b) => a[0] - b[0]);
```

### Step 2：利用並查集合併啟動格子

- **初始化並查集**  
  為所有格子初始化並查集，並用一個指針 `nextCellToActivate` 依次啟動格子。

- **動態啟動與合併相鄰格子**  
  對於每個查詢值，當前格子的值小於查詢值時，即視為「啟動」。啟動時檢查該格子上下左右相鄰的位置，若相鄰格子也已啟動（其值同樣小於查詢值），則利用並查集將兩個格子合併。如此一來，最終可求得起點 (0,0) 所在連通區域的大小。

```typescript
// 對每個查詢值，啟動所有格子值 < queryValue
while (nextCellToActivate < totalGridCells && gridCells[nextCellToActivate][2] < queryValue) {
  const [row, col] = gridCells[nextCellToActivate];

  // 掃描四個方向
  for (const [dRow, dCol] of directions) {
    const newRow = row + dRow;
    const newCol = col + dCol;
    if (newRow < 0 || newRow >= rows || newCol < 0 || newCol >= cols) continue;
    if (grid[newRow][newCol] < queryValue) {
      unionFind.union(getIndex(row, col), getIndex(newRow, newCol));
    }
  }
  nextCellToActivate++;
}
```

### Step 3：查詢答案計算

對於每個查詢，若起點 (0,0) 的值小於查詢值，則答案為起點所在連通區域的大小；否則答案為 0。

```typescript
result[originalIndex] = grid[0][0] < queryValue ? unionFind.componentSize[unionFind.find(0)] : 0;
```

## 時間複雜度

- **排序階段**
  - 格子排序的時間複雜度為 $O(m * n log(m * n))$。
  - 查詢排序的時間複雜度為 $O(k log k)$。

- **啟動與合併階段**  
  每個格子最多被啟動一次，並查集的合併操作均攜帶優化（近似 $O(α(m * n))$），故此部分時間複雜度近似 $O(m * n)$。

- 總時間複雜度為 $O(m * n log(m * n) + k log k)$。

> $O(m * n \log(m * n) + k \log k)$

## 空間複雜度

- **並查集數組**  
  需要額外 $O(m * n)$ 的空間來記錄父節點、連通區域大小等。

- **排序與輔助陣列**  
  扁平化格子與查詢綁定等額外使用 $O(m * n)$ 和 $O(k)$ 的空間。

- 總體空間複雜度為 $O(m * n + k)$。

> $O(m * n + k)$
