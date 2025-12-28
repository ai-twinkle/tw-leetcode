# 1351. Count Negative Numbers in a Sorted Matrix

Given a `m x n` matrix `grid` which is sorted in non-increasing order both row-wise and column-wise, 
return the number of negative numbers in `grid`.

**Constraints:**

- `m == grid.length`
- `n == grid[i].length`
- `1 <= m, n <= 100`
- `-100 <= grid[i][j] <= 100`

## 基礎思路

本題給定一個 `m x n` 矩陣，且每一列與每一行都以「非遞增」（由大到小）的順序排序。
我們要計算矩陣中負數的個數。

在思考解法時，可利用排序性質做出以下觀察：

* **負數在每列中會形成後綴區段**：因為每列由大到小排列，一旦出現負數，右邊都會是負數。
* **負數在每行中會形成下方區段**：同理，每行由大到小排列，一旦某格為負數，其下方也會偏向更小（更可能為負）。
* **可用單調移動避免重複掃描**：若從某個角落出發，每一步只往兩個方向之一移動，便能利用排序性質一次排除一整段元素。
* **階梯式掃描（staircase scan）**：從左下角開始：

    * 若目前值為負數，則同一列右側必為負數，可一次加總並往上移動；
    * 若目前值非負，則同一欄上方更大，不會因此變負，需往右移動尋找負數區段。

這樣每一步都會讓「列數減一」或「欄數加一」，因此最多走完 `m + n` 步即可完成計算。

## 解題步驟

### Step 1：初始化維度、指標與計數器

先取得矩陣的列數與欄數，並將掃描起點設在左下角，同時準備統計負數的計數器。

```typescript
const rowCount = grid.length;
const columnCount = grid[0].length;

let currentRow = rowCount - 1;
let currentColumn = 0;
let negativeCount = 0;
```

### Step 2：準備當前列的參考以降低索引成本

因為掃描過程中會多次讀取同一列的元素，先取出目前所在列的參考；
之後只在「往上移動」時才更新。

```typescript
// 從左下角開始，只往上或往右移動（階梯式掃描）。
let currentRowArray = grid[currentRow];
```

### Step 3：階梯式掃描矩陣並累加負數數量

在矩陣範圍內進行掃描：

* **若目前值為負數**：
  由於該列為非遞增排序，右側所有值也必定為負數，
  可一次加總整段並往上一列移動。
* **若目前值非負**：
  表示該欄位往上只會更大，不可能出現負數，
  因此往右移動尋找負數區段。

```typescript
while (currentRow >= 0 && currentColumn < columnCount) {
  if (currentRowArray[currentColumn] < 0) {
    // 此列中，當前位置右側所有值也都是負數。
    negativeCount += columnCount - currentColumn;

    currentRow--;
    if (currentRow >= 0) {
      currentRowArray = grid[currentRow];
    }
  } else {
    currentColumn++;
  }
}
```

### Step 4：回傳負數總數

當掃描完成後，累積的 `negativeCount` 即為矩陣中負數的總數。

```typescript
return negativeCount;
```

## 時間複雜度

- 每次迴圈執行，必定使列索引減 1 或使欄索引加 1；
- 列索引最多移動 `m` 次，欄索引最多移動 `n` 次；
- 因此整個掃描流程最多執行 `m + n` 次。
- 總時間複雜度為 $O(m + n)$。

> $O(m + n)$

## 空間複雜度

- 僅使用固定數量的指標與計數變數；
- 不配置與輸入規模相關的額外資料結構。
- 總空間複雜度為 $O(1)$。

> $O(1)$
