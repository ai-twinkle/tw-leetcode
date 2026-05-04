# 48. Rotate Image

You are given an `n x n` 2D `matrix` representing an image, rotate the image by 90 degrees (clockwise).

You have to rotate the image in-place, which means you have to modify the input 2D matrix directly. 
DO NOT allocate another 2D matrix and do the rotation.

**Constraints:**

- `n == matrix.length == matrix[i].length`
- `1 <= n <= 20`
- `-1000 <= matrix[i][j] <= 1000`

## 基礎思路

本題要求回傳 count-and-say 序列的第 $n$ 項，其中序列的定義如下：

1. 基本情況為 `countAndSay(1) = "1"`；
2. 當 $n > 1$ 時，`countAndSay(n)` 是對前一項 `countAndSay(n - 1)` 進行「跑長編碼」（Run-Length Encoding, RLE）後所得的結果。

為了讓每次取得序列第 $n$ 項的查詢操作都能達到 $O(1)$ 的效率，我們在模組載入階段預先計算並緩存前 `MAX_TERMS` 項。

實現中，RLE 編碼的主要邏輯由輔助函式 `generateNextTerm` 負責，透過一次線性掃描將連續相同的數字轉換成「數字出現次數 + 數字本身」的形式。
## 基礎思路

本題要求將一個 n×n 矩陣原地順時針旋轉 90 度，不可使用額外的二維陣列。因此必須設計一套能直接在原始矩陣上完成搬移的操作流程。

在思考解法時，可掌握以下核心觀察：

- **旋轉本質為四點循環交換**：
  順時針旋轉 90 度時，矩陣中的每個位置 `(i, j)` 會移動到 `(j, n-1-i)`，形成一個四點構成的循環；只需處理每個循環一次，即可完成整個旋轉。

- **只需處理矩陣的左上象限**：
  每個循環涵蓋四個位置，因此只需遍歷約四分之一的格子即可覆蓋所有循環；具體來說，外層迴圈遍歷「行數的一半（向下取整）」，內層迴圈遍歷「列數的一半（向上取整）」以正確處理奇數維度。

- **原地操作需要暫存一個值**：
  四點循環交換時，每次需先保存其中一個值，再依序覆蓋，最後將保存值填入最後一個位置，使用單一暫存變數即可完成。

- **層（layer）與偏移（offset）的幾何意義**：
  外層迴圈的索引代表由外向內的「層」，內層迴圈的索引代表在該層中的「偏移位置」；兩者共同唯一決定一個循環的起始點。

依據以上特性，可以採用以下策略：

- **以雙層迴圈遍歷左上象限中的每個循環起點**，確保不重複、不遺漏地覆蓋所有需要旋轉的格子。
- **在每次迭代中，快取涉及的行列參考與映射索引**，減少重複的索引計算。
- **對四個位置執行一次循環賦值**，以單一暫存值完成原地旋轉，不需要額外空間。

此策略能以最少的索引運算完成原地旋轉，兼顧效率與可讀性。

## 解題步驟

### Step 1：處理邊界情況並初始化輔助常數

當矩陣邊長小於 2 時，旋轉後結果不變，可直接回傳。
接著預先計算後續迴圈所需的常數：最大索引、外層迴圈上界（行數一半向下取整）、內層迴圈上界（列數一半向上取整）。

```typescript
const size: number = matrix.length;

// 特殊情況：1x1 矩陣旋轉後不變
if (size < 2) {
  return;
}

const lastIndex: number = size - 1;
// 外層迴圈涵蓋一半的行（向下取整）
const halfRows: number = (size / 2) | 0;
// 內層迴圈涵蓋一半的列（向上取整）以處理奇數大小
const halfColumns: number = (size + 1) >> 1;
```

### Step 2：進入外層迴圈，快取當前層的上下行參考

外層迴圈以「層」為單位從外圈向內推進，每一層對應矩陣中的一個環狀邊界。
進入每一層時，先快取該層對應的頂行與底行，避免內層迴圈重複查找。

```typescript
for (let layer = 0; layer < halfRows; layer++) {
  // 快取此層的頂行與底行參考
  const topRow = matrix[layer];
  const bottomRow = matrix[lastIndex - layer];

  // ...
}
```

### Step 3：進入內層迴圈，快取映射索引與左右行參考

內層迴圈在同一層中依偏移量逐一處理各個循環起點。
每次迭代先計算映射後的列索引，再快取涉及四點循環的左行與右行參考，為後續交換做準備。

```typescript
for (let layer = 0; layer < halfRows; layer++) {
  // Step 2：快取頂行與底行

  for (let offset = 0; offset < halfColumns; offset++) {
    // 預先快取映射後的列索引
    const mirroredOffset: number = lastIndex - offset;
    // 快取參與此循環的左行與右行參考
    const leftRow = matrix[mirroredOffset];
    const rightRow = matrix[offset];

    // ...
  }
}
```

### Step 4：執行四點循環交換完成旋轉

先保存左上角的值，再依照順時針旋轉的方向依序覆蓋四個位置：
左下 → 左上、右下 → 左下、右上 → 右下、暫存的左上 → 右上。

```typescript
for (let layer = 0; layer < halfRows; layer++) {
  // Step 2：快取頂行與底行

  for (let offset = 0; offset < halfColumns; offset++) {
    // Step 3：快取映射索引與左右行

    // 暫存左上角的值，避免覆蓋時遺失
    const temp: number = topRow[offset];

    // 執行四向循環移位：左下 -> 左上
    topRow[offset] = leftRow[layer];
    // 右下 -> 左下
    leftRow[layer] = bottomRow[mirroredOffset];
    // 右上 -> 右下
    bottomRow[mirroredOffset] = rightRow[lastIndex - layer];
    // 暫存的左上 -> 右上
    rightRow[lastIndex - layer] = temp;
  }
}
```

## 時間複雜度

- 外層迴圈遍歷約 $n/2$ 層，內層迴圈遍歷約 $(n+1)/2$ 個偏移量；
- 每次迭代執行固定次數的常數時間操作；
- 總共處理約 $n^2 / 4$ 個循環，每個循環對應四個位置。
- 總時間複雜度為 $O(n^2)$。

> $O(n^2)$

## 空間複雜度

- 僅使用固定數量的輔助變數（層索引、偏移量、行參考、暫存值等）；
- 所有操作直接在原始矩陣上進行，未配置任何額外陣列。
- 總空間複雜度為 $O(1)$。

> $O(1)$
