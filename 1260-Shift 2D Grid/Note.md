# 1260. Shift 2D Grid

Given a 2D `grid` of size `m x n` and an integer `k`. 
You need to shift the grid `k` times.

In one shift operation:

- Element at `grid[i][j]` moves to `grid[i][j + 1]`.
- Element at `grid[i][n - 1]` moves to `grid[i + 1][0]`.
- Element at `grid[m - 1][n - 1]` moves to `grid[0][0]`.

Return the 2D grid after applying shift operation `k` times.

**Constraints:**

- `m == grid.length`
- `n == grid[i].length`
- `1 <= m <= 50`
- `1 <= n <= 50`
- `-1000 <= grid[i][j] <= 1000`
- `0 <= k <= 100`

## 基礎思路

本題要求將一個二維矩陣視為連續序列，並整體向後位移 `k` 次，每一次位移都會使最後一個元素環繞回到最前端。若以最直接的方式逐次搬移元素，將造成大量重複操作，效率並不理想。

在思考解法時，可掌握以下核心觀察：

- **二維位移可攤平為一維旋轉**：
  每個元素依序移動到下一個位置，且尾端環繞回開頭，這與一維陣列的循環旋轉本質相同，因此可將整個矩陣視為長度為 `m × n` 的序列來處理。

- **位移次數存在週期性**：
  當位移量達到序列總長度時，矩陣會回到原始狀態，因此真正有效的位移量只需取總長度的餘數即可，避免多餘的搬移。

- **旋轉起點可直接計算**：
  由於每個來源位置的目的地是固定的偏移關係，因此無須逐次搬移，只要找到旋轉後序列的起始來源位置，便能一次性依序填入結果。

- **索引可於一維與二維間互相換算**：
  攤平後的線性索引可透過除法與取餘還原為原始的列與行位置，使我們能直接由來源座標取值。

依據以上特性，可以採用以下策略：

- **先以總長度取餘計算實際位移量**，若位移量為 0 則代表結果與原矩陣相同，可直接回傳。
- **計算旋轉的切分點**，作為填入結果時的來源起始位置。
- **依序走訪來源序列並於總長度處環繞一次**，將每個元素填入對應的輸出位置。

此策略能將整體複雜度壓低至僅需一次線性掃描，兼顧正確性與效率。

## 解題步驟

### Step 1：計算矩陣維度與元素總數

先取得矩陣的列數與行數，並計算攤平後的元素總數，作為後續旋轉運算的基礎。

```typescript
const rowCount = grid.length;
const columnCount = grid[0].length;
const total = rowCount * columnCount;
```

### Step 2：以總長度取餘並處理無須位移的情況

利用位移的週期性，將 `k` 對總長度取餘以得到實際有效位移量；
若結果為 0，代表矩陣位移後與原始狀態相同，可直接回傳原矩陣。

```typescript
const shift = k % total;
if (shift === 0) {
  return grid;
}
```

### Step 3：計算旋轉的切分點

依據來源位置與目的地的固定偏移關係，計算攤平序列的切分點；
此切分點即為旋轉後輸出序列的第一個來源位置。

```typescript
// 來源索引 i 的目的地為 (i + shift) % total。等價地，
// 攤平後的輸出即為來源序列向左旋轉 (total - shift)。
// splitPoint 標記來源尾端環繞回開頭的分界位置。
const splitPoint = total - shift;
```

### Step 4：初始化結果容器與來源指標

建立用於存放輸出的結果陣列，並將來源指標設定至切分點，準備由此開始依序取值。

```typescript
const result: number[][] = new Array(rowCount);
let sourceIndex = splitPoint;
```

### Step 5：逐列走訪並建立每一列的輸出容器

外層迴圈逐列處理，於每一列開始時建立一個對應行數的輸出列，準備填入旋轉後的元素。

```typescript
for (let row = 0; row < rowCount; row++) {
  const outputRow = new Array(columnCount);

  // ...
}
```

### Step 6：依旋轉順序走訪來源並於總長度處環繞

內層迴圈依序填入每一行的元素；
當來源指標到達總長度時，將其歸零以完成一次環繞，接著透過除法與取餘將線性索引還原為二維座標並取值，最後推進來源指標。

```typescript
for (let row = 0; row < rowCount; row++) {
  // Step 5：建立此列的輸出容器

  for (let column = 0; column < columnCount; column++) {
    // 依旋轉順序走訪來源，於總長度處環繞一次
    if (sourceIndex === total) {
      sourceIndex = 0;
    }
    outputRow[column] = grid[(sourceIndex / columnCount) | 0][sourceIndex % columnCount];
    sourceIndex++;
  }

  // ...
}
```

### Step 7：將填妥的輸出列寫回結果並回傳

當一列的所有元素皆填入後，將該輸出列寫回結果陣列的對應位置；
所有列處理完畢後回傳最終結果。

```typescript
for (let row = 0; row < rowCount; row++) {
  // Step 5：建立此列的輸出容器

  // Step 6：依旋轉順序填入此列元素

  result[row] = outputRow;
}

return result;
```

## 時間複雜度

- 攤平後的序列長度為 `m × n`，每個元素恰好被走訪並填入一次；
- 索引換算與取值皆為常數時間操作。
- 總時間複雜度為 $O(m \times n)$。

> $O(m \times n)$

## 空間複雜度

- 需配置一個大小為 `m × n` 的結果矩陣以存放輸出；
- 除此之外僅使用固定數量的輔助變數。
- 總空間複雜度為 $O(m \times n)$。

> $O(m \times n)$
