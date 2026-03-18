# 3070. Count Submatrices with Top-Left Element and Sum Less Than k

You are given a 0-indexed integer matrix `grid` and an integer `k`.

Return the number of submatrices that contain the top-left element of the `grid`, 
and have a sum less than or equal to `k`.

**Constraints:**

- `m == grid.length`
- `n == grid[i].length`
- `1 <= n, m <= 1000`
- `0 <= grid[i][j] <= 1000`
- `1 <= k <= 10^9`

## 基礎思路

本題要求計算所有**包含左上角元素**的子矩形中，有多少個子矩形的元素總和不超過 `k`。由於子矩形必須包含左上角，因此每個合法子矩形都可以視為一個從左上角出發、向下延伸到某一列、再向右延伸到某一欄的前綴矩形。

在思考解法時，可掌握以下核心觀察：

* **問題可轉化為統計前綴矩形數量**：
  因為每個子矩形都必須包含左上角，所以不需要枚舉任意起點，只需考慮不同的下邊界與右邊界。

* **可逐列維護每一欄的縱向累積和**：
  當下邊界往下擴展一列時，只要把該列的值加到對應欄位，即可得到新的高度範圍總和。

* **所有元素皆非負，前綴和具有單調性**：
  在固定下邊界時，從左到右擴展右邊界，矩形總和只會遞增，不會減少。

* **一旦某個右邊界失效，後續更右的位置也必定失效**：
  因此前綴和一旦超過限制，就可以立即停止當前列的掃描。

* **隨著下邊界下移，合法右邊界只會維持或縮小**：
  因為矩形只會加入更多非負值，所以先前已不合法的位置之後也不可能重新變合法。

依據以上特性，可以採用以下策略：

* **逐列向下擴展下邊界，並同步更新每一欄的縱向累積和**。
* **在每一列中，由左到右累加目前矩形總和，找出最右側仍合法的位置**。
* **利用非負數的單調性，在超過限制時立即停止**。
* **把當前列的最右合法位置傳遞到下一列，縮小後續搜尋範圍**。

此策略能充分利用題目中「必須包含左上角」與「元素皆非負」兩個特性，在掃描過程中高效完成統計。

## 解題步驟

### Step 1：初始化矩陣尺寸、欄位累積和與答案變數

先取得列數與欄數，接著建立一個欄位累積和陣列，用來記錄目前下邊界下每一欄從頂端累積到當前列的總和。
同時準備答案變數，以及目前仍可能合法的最右欄位置。

```typescript
const rowCount = grid.length;
const columnCount = grid[0].length;

// 只儲存目前仍可能合法的欄位之縱向前綴和
const columnSums = new Int32Array(columnCount);

let totalValidSubmatrices = 0;
let rightmostValidColumn = columnCount - 1;
```

### Step 2：逐列向下擴展子矩形的下邊界

接著逐列向下枚舉子矩形的下邊界。
若目前已經沒有任何合法的右邊界，代表後續列也不可能再產生合法矩形，可以直接停止。

```typescript
for (let rowIndex = 0; rowIndex < rowCount; rowIndex++) {
  if (rightmostValidColumn < 0) {
    break;
  }

  const currentRow = grid[rowIndex];
  let prefixSum = 0;
  let newRightmostValidColumn = -1;

  // ...
}
```

### Step 3：逐欄更新縱向累積和並累加目前矩形總和

在當前列中，逐欄更新縱向累積和，並同步累加目前矩形的總和。

```typescript
for (let rowIndex = 0; rowIndex < rowCount; rowIndex++) {
  // Step 2：逐列向下擴展子矩形的下邊界

  for (let columnIndex = 0; columnIndex <= rightmostValidColumn; columnIndex++) {
    const updatedColumnSum = columnSums[columnIndex] + currentRow[columnIndex];
    columnSums[columnIndex] = updatedColumnSum;
    prefixSum += updatedColumnSum;

    // ...
  }

  // ...
}
```

### Step 4：利用單調性找出當前列最右側仍合法的欄位

由於所有值皆為非負，因此前綴和具有單調性。
若目前總和仍不超過 `k`，則更新合法右界；否則立即停止。

```typescript
for (let rowIndex = 0; rowIndex < rowCount; rowIndex++) {
  // Step 2：逐列向下擴展子矩形的下邊界

  for (let columnIndex = 0; columnIndex <= rightmostValidColumn; columnIndex++) {
    // Step 3：逐欄更新縱向累積和並累加目前矩形總和

    // 由於所有值皆非負，前綴和必定單調不減
    if (prefixSum <= k) {
      newRightmostValidColumn = columnIndex;
    } else {
      break;
    }
  }

  // ...
}
```

### Step 5：若本列已無合法前綴矩形則提前結束

當某一列沒有任何合法前綴矩形時，後續列也不可能再產生合法解，直接結束。

```typescript
for (let rowIndex = 0; rowIndex < rowCount; rowIndex++) {
  // Step 2：逐列向下擴展子矩形的下邊界

  for (let columnIndex = 0; columnIndex <= rightmostValidColumn; columnIndex++) {
    // Step 3：逐欄更新縱向累積和並累加目前矩形總和

    // Step 4：利用單調性找出當前列最右側仍合法的欄位
  }

  // 若此列沒有任何合法前綴，之後列的總和只會更大
  if (newRightmostValidColumn < 0) {
    break;
  }

  // ...
}
```

### Step 6：累加本列答案並縮小後續可檢查範圍

若本列仍存在合法右邊界，則可累加合法矩形數量，並更新下一列可檢查的範圍。

```typescript
for (let rowIndex = 0; rowIndex < rowCount; rowIndex++) {
  // Step 2：逐列向下擴展子矩形的下邊界

  for (let columnIndex = 0; columnIndex <= rightmostValidColumn; columnIndex++) {
    // Step 3：逐欄更新縱向累積和並累加目前矩形總和

    // Step 4：利用單調性找出當前列最右側仍合法的欄位
  }

  // Step 5：若本列已無合法前綴矩形則提前結束

  totalValidSubmatrices += newRightmostValidColumn + 1;
  rightmostValidColumn = newRightmostValidColumn;
}
```

### Step 7：回傳累計出的合法子矩形總數

當所有列處理完成後，回傳最終結果。

```typescript
return totalValidSubmatrices;
```

## 時間複雜度

- 主函式只做常數次初始化。
- 外層逐列掃描矩陣，最多處理 `m` 列。
- 內層每一列只會掃描到目前仍可能合法的最右欄位，最壞情況下每列仍可能掃描全部 `n` 個欄位。
- 總時間複雜度為 $O(m \times n)$。

> $O(m \times n)$

## 空間複雜度

- 使用一個長度為 $n$ 的欄位累積和陣列。
- 其餘僅使用常數個變數。
- 總空間複雜度為 $O(n)$。

> $O(n)$
