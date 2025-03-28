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

在開始處理問題前，我們需將原本二維的 `grid` 資料轉成更容易排序的形式，以方便後續快速處理查詢。

- **扁平化格子資訊**  
  我們將原本二維的 `grid` 陣列轉為一維的列表，每個元素包含了格子的座標 `(row, col)` 以及該格子的值，型態為 `[row, col, value]`。  
  接著再依照格子值由小到大排序，這樣一來我們可以方便地逐步將符合條件的格子「啟動」或「激活」。

- **查詢值排序與索引記錄**  
  由於題目給定的多次查詢之間沒有特定順序，我們也同時需要紀錄每個查詢值的原始索引。  
  透過排序查詢值後，我們就能依序處理每個查詢，在每一步僅激活那些新能到達的格子。

```typescript
// 扁平化格子資訊為 [row, col, value] 並排序
const gridCells: [number, number, number][] = [];
for (let row = 0; row < rows; row++) {
  for (let col = 0; col < cols; col++) {
    gridCells.push([row, col, grid[row][col]]);
  }
}
gridCells.sort((a, b) => a[2] - b[2]);

// 將查詢值與原始索引綁定後排序
const queriesWithIndices: [number, number][] = queries.map((value, index) => [value, index]);
queriesWithIndices.sort((a, b) => a[0] - b[0]);
```

### Step 2：利用並查集合併啟動格子

接下來，我們將逐步根據每個查詢的閾值（能量）來「激活」格子，並利用 **並查集（Union-Find）** 來管理和合併這些激活後的相鄰格子，並記錄其形成的連通區域大小。

- **初始化並查集**  
  初始化 `UnionFind` 物件，讓每個格子初始時都是獨立的狀態。  
  另外，使用指標 `nextCellToActivate` 追蹤下一個待激活的格子索引。

- **動態激活並合併相鄰格子**  
  針對每一個查詢值，逐步激活所有值小於此查詢值的格子。  
  激活一個格子時，立刻查看其相鄰上下左右的格子是否已激活（即已被納入連通區域），若是，則透過並查集合併這兩個相鄰的格子區域。

```typescript
const unionFind = new UnionFind(totalCells);
let nextCellToActivate = 0;
const totalGridCells = gridCells.length;
const directions = [
  [-1, 0], // 向上
  [0, 1],  // 向右
  [1, 0],  // 向下
  [0, -1]  // 向左
];

const getIndex = (row: number, col: number) => row * cols + col;

for (const [queryValue, originalIndex] of queriesWithIndices) {
  // 激活所有格子值小於 queryValue 的格子
  while (nextCellToActivate < totalGridCells && gridCells[nextCellToActivate][2] < queryValue) {
    const [row, col] = gridCells[nextCellToActivate];

    // 檢查上下左右四個方向的相鄰格子是否已激活，並進行合併
    for (const [dRow, dCol] of directions) {
      const newRow = row + dRow;
      const newCol = col + dCol;

      // 邊界檢查
      if (newRow < 0 || newRow >= rows || newCol < 0 || newCol >= cols) continue;

      // 若相鄰格子也已激活（值小於當前查詢值），則合併兩個格子
      if (grid[newRow][newCol] < queryValue) {
        unionFind.union(getIndex(row, col), getIndex(newRow, newCol));
      }
    }
    nextCellToActivate++;
  }

  // 此時，所有能量低於 queryValue 的格子已被激活
  // 如果起點 (0,0) 已激活，則記錄起點所在連通區域大小
  result[originalIndex] =
    grid[0][0] < queryValue ? unionFind.componentSize[unionFind.find(0)] : 0;
}
```

### Step 3：查詢答案計算

在前一步驟完成激活與合併後，每個查詢的答案即是起點 `(0,0)` 所在連通區域的大小。但需特別檢查起點本身是否符合條件：

- 若起點的值小於當前查詢值，則答案為起點所在區域大小。
- 否則（起點本身無法進入），答案為 0。

```typescript
result[originalIndex] =
  grid[0][0] < queryValue ? unionFind.componentSize[unionFind.find(0)] : 0;
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
