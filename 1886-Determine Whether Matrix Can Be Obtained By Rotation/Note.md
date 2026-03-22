# 1886. Determine Whether Matrix Can Be Obtained By Rotation

Given two `n x n` binary matrices `mat` and `target`, 
return `true` if it is possible to make `mat` equal to `target` by rotating `mat` in 90-degree increments, 
or `false` otherwise.

**Constraints:**

- `n == mat.length == target.length`
- `n == mat[i].length == target[i].length`
- `1 <= n <= 10`
- `mat[i][j]` and `target[i][j]` are either `0` or `1`.

## 基礎思路

本題要求判斷一個 `n x n` 的二進位矩陣，是否能透過若干次 90 度旋轉後與目標矩陣相等。由於旋轉只有四種可能結果（0°、90°、180°、270°），本題的本質是在有限的狀態空間中枚舉並比對。

在思考解法時，可掌握以下核心觀察：

- **旋轉狀態有限且封閉**：
  對任意矩陣旋轉 90 度，四次後必然回到原始狀態，因此只需嘗試四種旋轉，不存在無限枚舉的問題。

- **每次旋轉可就地完成**：
  90 度旋轉可透過固定的四格循環置換在原矩陣上直接完成，無需額外配置新矩陣，空間使用極為精簡。

- **比對與旋轉可交錯進行**：
  每次旋轉前先進行相等性比對，若當前狀態即為目標則提前回傳，無需多餘的旋轉操作。

- **旋轉的迴圈範圍可預先計算**：
  就地旋轉時，只需遍歷矩陣左上角的特定子區域，其行與列的邊界可依矩陣維度預先算出，避免在迴圈內重複計算。

依據以上特性，可以採用以下策略：

- **獨立拆出相等性比對與旋轉兩個輔助函數**，使主邏輯簡潔清晰，並確保各功能單一且可驗證。
- **在主函數中依序嘗試最多四次旋轉**，每次旋轉前先比對，任一比對成功即提前回傳。
- **旋轉採四格循環置換**，僅需一個暫存變數即可完成，不引入任何動態記憶體配置。

此策略利用旋轉狀態有限的特性，以極低的時間與空間成本完成判斷。

## 解題步驟

### Step 1：實作相等性比對函數，逐格檢查兩矩陣是否完全相同

逐行逐列遍歷兩個矩陣的所有對應位置，只要發現任一位置不相等即提前回傳 `false`；若所有位置皆相等，則回傳 `true`。

```typescript
/**
 * 檢查兩個二進位矩陣是否逐元素相等。
 * @param mat - 第一個 n x n 二進位矩陣
 * @param target - 第二個 n x n 二進位矩陣
 * @param n - 矩陣的維度
 * @returns 若所有元素皆相等則回傳 true，否則回傳 false
 */
function isEqual(mat: number[][], target: number[][], n: number): boolean {
  for (let row = 0; row < n; row++) {
    for (let column = 0; column < n; column++) {
      if (mat[row][column] !== target[row][column]) {
        return false;
      }
    }
  }
  return true;
}
```

### Step 2：預先計算就地旋轉所需的行列邊界

在進行四格循環置換前，先根據矩陣維度計算出需遍歷的行數與列數邊界，避免在迴圈內部重複執行相同的除法運算。

```typescript
/**
 * 將 n x n 矩陣就地順時針旋轉 90 度。
 * 使用標準四格循環置換，並預先提升邊界計算。
 * @param mat - 要就地旋轉的 n x n 二進位矩陣
 * @param n - 矩陣的維度
 */
function rotateInPlace(mat: number[][], n: number): void {
  // 將迴圈邊界提升至迴圈外，避免每次迭代重複計算
  const rowBound = Math.floor(n / 2);
  const columnBound = Math.floor((n + 1) / 2);

  // ...
}
```

### Step 3：對矩陣左上角子區域的每個格子執行四格循環置換

遍歷由 `rowBound` 與 `columnBound` 決定的子區域，對每個起始格執行一次四格循環置換，僅需一個暫存變數即可將四個對應位置的值依序輪轉，完成整個矩陣的就地 90 度旋轉。

```typescript
function rotateInPlace(mat: number[][], n: number): void {
  // Step 2：預先計算行列邊界

  for (let row = 0; row < rowBound; row++) {
    for (let column = 0; column < columnBound; column++) {
      // 使用單一暫存變數執行四格循環置換（不進行堆積配置）
      const temporary = mat[row][column];
      mat[row][column] = mat[n - 1 - column][row];
      mat[n - 1 - column][row] = mat[n - 1 - row][n - 1 - column];
      mat[n - 1 - row][n - 1 - column] = mat[column][n - 1 - row];
      mat[column][n - 1 - row] = temporary;
    }
  }
}
```

### Step 4：依序嘗試四種旋轉角度，比對後旋轉，任一成功即提前回傳

在主函數中，對最多四種旋轉狀態逐一進行相等性比對；每次先比對當前狀態，若與目標相等則立即回傳 `true`，否則執行一次旋轉再進入下一輪；若四種狀態皆不符合，則回傳 `false`。

```typescript
/**
 * 判斷 mat 能否透過 90 度的旋轉增量使其等於 target。
 * @param mat - 來源 n x n 二進位矩陣
 * @param target - 目標 n x n 二進位矩陣
 * @returns 若 mat 的任一旋轉結果等於 target 則回傳 true，否則回傳 false
 */
function findRotation(mat: number[][], target: number[][]): boolean {
  const n = mat.length;

  for (let rotation = 0; rotation < 4; rotation++) {
    if (isEqual(mat, target, n)) {
      return true;
    }
    rotateInPlace(mat, n);
  }

  return false;
}
```

## 時間複雜度

- 相等性比對需遍歷整個矩陣，耗時 $O(n^2)$；
- 就地旋轉僅需處理矩陣約四分之一的格子，每格執行常數次操作，耗時 $O(n^2)$；
- 最多執行 4 輪比對與旋轉，常數係數可忽略。
- 總時間複雜度為 $O(n^2)$。

> $O(n^2)$

## 空間複雜度

- 旋轉時僅使用一個暫存變數，不配置任何額外陣列；
- 所有操作皆就地完成，無遞迴堆疊或輔助資料結構。
- 總空間複雜度為 $O(1)$。

> $O(1)$
