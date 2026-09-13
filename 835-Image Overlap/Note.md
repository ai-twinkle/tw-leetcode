# 835. Image Overlap

You are given two images, `img1` and `img2`, represented as binary, square matrices of size `n x n`. 
A binary matrix has only 0s and 1s as values.

We translate one image however we choose by sliding all the `1` bits left, right, up, and/or down any number of units. 
We then place it on top of the other image. 
We can then calculate the overlap by counting the number of positions that have a `1` in both images.

Note also that a translation does not include any kind of rotation. 
Any `1` bits that are translated outside of the matrix borders are erased.

Return the largest possible overlap.

**Constraints:**

- `n == img1.length == img1[i].length`
- `n == img2.length == img2[i].length`
- `1 <= n <= 30`
- `img1[i][j]` is either `0` or `1`.
- `img2[i][j]` is either `0` or `1`.

## 基礎思路

本題給定兩張大小相同的二元方陣圖片，允許將其中一張圖片沿水平與垂直方向任意平移（超出邊界的部分直接消失），要求在所有平移方式中找出兩張圖片同時為 1 的位置數量的最大值。

在思考解法時，可掌握以下核心觀察：

- **平移的自由度是有限且可窮舉的**：
  垂直與水平的位移量各自僅有約兩倍邊長種可能，超出此範圍則兩圖完全不重疊，因此整個解空間可直接枚舉。

- **重疊計算的本質是逐位元的交集**：
  把每一列的 0 與 1 視為一串位元，則「同時為 1 的位置數」等價於兩列位元串取交集後的位元計數，水平平移則等價於整串位元的移位。如此可讓原本逐格比對的內層工作壓縮成單次位元運算。

- **位元計數可預先建表換取常數時間**：
  由於位元計數會在搜尋過程中被大量呼叫，預先建立一張查表，讓每次計數僅需固定次數的查表即可完成。

- **上界資訊能大幅削減無效搜尋**：
  重疊數永遠不可能超過兩張圖片中設定位元較少者的總數，此為全域上限；而在固定垂直位移下，可依配對列的位元數取較小值累加，得到該垂直位移的局部上界。若此上界已不優於目前最佳解，該垂直位移下的所有水平位移皆可整批跳過。

- **負向水平位移可由對稱性消解**：
  將圖片往左平移，等同於交換兩張圖片的角色後往右平移，因此只需實作單一方向的掃描，再以交換參數的方式呼叫第二次即可。

依據以上特性，可以採用以下策略：

- **先將每一列壓縮成位元遮罩**，把二維比對轉換為一維的位移與交集運算。
- **預先快取每列的位元數與總位元數**，供剪枝上界與全域上限使用。
- **以垂直位移為外層、水平位移為內層進行枚舉**，並在進入內層前先以局部上界剪枝、在更新最佳解時以全域上限提早結束。
- **僅掃描非負向的水平位移，再透過交換兩圖角色補齊另一半解空間**。

此策略將原本的四重枚舉壓縮為位元層級的批次運算，並輔以雙重上界剪枝，能在題目規模下高效求解。

## 解題步驟

### Step 1：建立 16 位元的位元計數查表

以遞推方式建立一張涵蓋所有 16 位元數值的查表：每個數值的位元數等於其右移一位後的位元數，再加上最低位是否為 1。

```typescript
/**
 * 建立一張查表，紀錄每個 16 位元數值中被設定的位元數量。
 * @returns 一張表，其中每個索引對應到自身的位元計數。
 */
function buildPopulationCountTable(): Uint8Array {
  const table = new Uint8Array(65536);
  for (let value = 1; value < 65536; value++) {
    table[value] = table[value >>> 1] + (value & 1);
  }
  return table;
}
```

### Step 2：於模組載入時預先完成建表

將查表結果存為常數，使後續搜尋過程中的每一次位元計數都只需兩次查表（低 16 位與高 16 位各一次）。

```typescript
// 預先計算一次，使搜尋過程中的每次位元計數僅需兩次查表。
const POPULATION_COUNT_TABLE = buildPopulationCountTable();
```

### Step 3：將矩陣的每一列壓縮成位元遮罩

逐列掃描矩陣，將每一行的值依其行號左移後併入該列的遮罩中，使一整列的 0 與 1 分布被壓縮成單一整數。

```typescript
/**
 * 將二元方陣的每一列壓縮成單一整數位元遮罩。
 * @param image 欲壓縮的二元矩陣。
 * @param size 矩陣的邊長。
 * @returns 每列一個位元遮罩，當第 c 行為 1 時第 c 個位元被設定。
 */
function packRowsIntoBitmasks(image: number[][], size: number): Int32Array {
  const masks = new Int32Array(size);
  for (let row = 0; row < size; row++) {
    const currentRow = image[row];
    let mask = 0;
    for (let column = 0; column < size; column++) {
      mask |= currentRow[column] << column;
    }
    masks[row] = mask;
  }
  return masks;
}
```

### Step 4：宣告掃描函數並初始化最佳解與列配對緩衝區

此函數負責掃描所有非負向水平位移的平移方式。進入後先承接先前已知的最佳解，並準備兩組緩衝區，用於暫存每次垂直位移下實際可能有貢獻的列配對。

```typescript
/**
 * 掃描所有將第一張圖片向右、或純粹上下移動的平移方式。
 * @param masksA 被平移圖片的列位元遮罩。
 * @param masksB 保持靜止圖片的列位元遮罩。
 * @param onesA 被平移圖片每一列的設定位元數。
 * @param onesB 靜止圖片每一列的設定位元數。
 * @param size 兩個矩陣的邊長。
 * @param cap 永遠不可能被超越的重疊數上限，用於提早結束。
 * @param bestSoFar 先前掃描已知的最佳重疊數。
 * @returns 找到的最佳重疊數，永遠不小於 bestSoFar。
 */
function scanNonNegativeColumnShifts(
  masksA: Int32Array,
  masksB: Int32Array,
  onesA: Int32Array,
  onesB: Int32Array,
  size: number,
  cap: number,
  bestSoFar: number
): number {
  let best = bestSoFar;
  const pairedA = new Int32Array(size);
  const pairedB = new Int32Array(size);

  // ...
}
```

### Step 5：枚舉垂直位移並篩選出可貢獻的列對

外層依序嘗試每一種垂直位移量，先依位移方向推得兩圖仍重疊的有效列範圍；接著在該範圍內配對兩圖的對應列，只保留雙方皆非全零的列對，同時以每列位元數的較小值累加出此垂直位移的重疊上界。

```typescript
function scanNonNegativeColumnShifts(...): number {
  // Step 4：初始化最佳解與列配對緩衝區

  for (let deltaRow = 1 - size; deltaRow < size; deltaRow++) {
    const firstRow = deltaRow < 0 ? -deltaRow : 0;
    const lastRow = deltaRow < 0 ? size : size - deltaRow;
    let pairCount = 0;
    let upperBound = 0;

    // 僅保留可能有貢獻的列對，並估算其最佳情況上界。
    for (let row = firstRow; row < lastRow; row++) {
      const maskA = masksA[row];
      const maskB = masksB[row + deltaRow];
      if (maskA === 0 || maskB === 0) {
        continue;
      }
      pairedA[pairCount] = maskA;
      pairedB[pairCount] = maskB;
      pairCount++;
      const countA = onesA[row];
      const countB = onesB[row + deltaRow];
      upperBound += countA < countB ? countA : countB;
    }

    // ...
  }

  // ...
}
```

### Step 6：以垂直位移的上界整批剪枝

若此垂直位移的理論最佳重疊數已不優於目前最佳解，則其下所有水平位移皆無檢查價值，可直接跳至下一個垂直位移。

```typescript
function scanNonNegativeColumnShifts(...): number {
  // Step 4：初始化最佳解與列配對緩衝區

  for (let deltaRow = 1 - size; deltaRow < size; deltaRow++) {
    // Step 5：計算有效列範圍並篩選可貢獻的列對

    // 此垂直位移下的任何水平位移都無法超越目前最佳解。
    if (upperBound <= best) {
      continue;
    }

    // ...
  }

  // ...
}
```

### Step 7：枚舉水平位移並以位元運算累計重疊數

通過剪枝後，依序嘗試每一種非負向的水平位移量：將被平移圖片的列遮罩整體左移後與靜止圖片的列遮罩取交集，再以查表分別計算低 16 位與高 16 位的位元數，累加即為此平移下的重疊總數。

```typescript
function scanNonNegativeColumnShifts(...): number {
  // Step 4：初始化最佳解與列配對緩衝區

  for (let deltaRow = 1 - size; deltaRow < size; deltaRow++) {
    // Step 5：計算有效列範圍並篩選可貢獻的列對

    // Step 6：以垂直位移的上界整批剪枝

    for (let deltaColumn = 0; deltaColumn < size; deltaColumn++) {
      let overlap = 0;
      for (let index = 0; index < pairCount; index++) {
        // 一次位移加一次 AND 即可取代整輪逐行比對。
        const combined = (pairedA[index] << deltaColumn) & pairedB[index];
        overlap +=
          POPULATION_COUNT_TABLE[combined & 0xffff] +
          POPULATION_COUNT_TABLE[combined >>> 16];
      }

      // ...
    }

    // ...
  }

  // ...
}
```

### Step 8：更新最佳解並在觸及全域上限時提早結束

若本次平移的重疊數優於目前最佳解則予以更新；一旦最佳解已達到理論上限，代表不可能再更好，可立即回傳結束整趟掃描。

```typescript
function scanNonNegativeColumnShifts(...): number {
  // Step 4：初始化最佳解與列配對緩衝區

  for (let deltaRow = 1 - size; deltaRow < size; deltaRow++) {
    // Step 5：計算有效列範圍並篩選可貢獻的列對

    // Step 6：以垂直位移的上界整批剪枝

    for (let deltaColumn = 0; deltaColumn < size; deltaColumn++) {
      // Step 7：以位元運算累計此平移下的重疊數

      if (overlap > best) {
        best = overlap;
        if (best >= cap) {
          return best;
        }
      }
    }

    // ...
  }

  // ...
}
```

### Step 9：掃描結束後回傳此趟的最佳重疊數

所有垂直與水平位移組合皆檢查完畢後，回傳此次掃描所得的最佳結果。

```typescript
function scanNonNegativeColumnShifts(...): number {
  // Step 4：初始化最佳解與列配對緩衝區

  for (let deltaRow = 1 - size; deltaRow < size; deltaRow++) {
    // Step 5：計算有效列範圍並篩選可貢獻的列對

    // Step 6：以垂直位移的上界整批剪枝

    // Step 7～8：枚舉水平位移、累計重疊數並更新最佳解
  }
  return best;
}
```

### Step 10：主函數中壓縮兩張圖片並準備統計容器

主函數先取得邊長，將兩張圖片各自壓縮為列位元遮罩，並準備存放每列位元數與總位元數的容器。

```typescript
/**
 * 找出將一張圖片平移覆蓋到另一張圖片上所能取得的最大重疊數。
 * @param img1 第一個二元方陣。
 * @param img2 第二個二元方陣。
 * @returns 兩張圖片中同時為 1 的位置數量的最大值。
 */
function largestOverlap(img1: number[][], img2: number[][]): number {
  const size = img1.length;
  const masks1 = packRowsIntoBitmasks(img1, size);
  const masks2 = packRowsIntoBitmasks(img2, size);
  const ones1 = new Int32Array(size);
  const ones2 = new Int32Array(size);
  let total1 = 0;
  let total2 = 0;

  // ...
}
```

### Step 11：快取每列的位元數並累加總量

逐列以查表計算兩張圖片各自的位元數並存入快取，同時累加出兩張圖片的位元總數；這些數值同時服務於垂直位移剪枝與全域上限的計算。

```typescript
function largestOverlap(img1: number[][], img2: number[][]): number {
  // Step 10：壓縮兩張圖片並準備統計容器

  // 快取每列的位元數；剪枝上界與整體上限皆以此為依據。
  for (let row = 0; row < size; row++) {
    const mask1 = masks1[row];
    const mask2 = masks2[row];
    const count1 =
      POPULATION_COUNT_TABLE[mask1 & 0xffff] + POPULATION_COUNT_TABLE[mask1 >>> 16];
    const count2 =
      POPULATION_COUNT_TABLE[mask2 & 0xffff] + POPULATION_COUNT_TABLE[mask2 >>> 16];
    ones1[row] = count1;
    ones2[row] = count2;
    total1 += count1;
    total2 += count2;
  }

  // ...
}
```

### Step 12：推導全域上限並處理全零的情況

重疊數不可能超過兩張圖片中位元較少者的總量，取兩者較小值作為全域上限；若此上限為 0，代表至少有一張圖片完全沒有 1，答案必為 0，可直接回傳。

```typescript
function largestOverlap(img1: number[][], img2: number[][]): number {
  // Step 10：壓縮兩張圖片並準備統計容器

  // Step 11：快取每列的位元數並累加總量

  // 重疊數永遠不可能超過設定位元較少那張圖片的位元總數。
  const cap = total1 < total2 ? total1 : total2;
  if (cap === 0) {
    return 0;
  }

  // ...
}
```

### Step 13：執行兩趟對稱掃描並回傳最終答案

先掃描第一張圖片向右（含純上下）平移的所有情況；若結果尚未觸及全域上限，再交換兩張圖片的角色掃描一次，以補齊向左平移的解空間，最後回傳兩趟中的最佳結果。

```typescript
function largestOverlap(img1: number[][], img2: number[][]): number {
  // Step 10：壓縮兩張圖片並準備統計容器

  // Step 11：快取每列的位元數並累加總量

  // Step 12：推導全域上限並處理全零的情況

  let best = scanNonNegativeColumnShifts(masks1, masks2, ones1, ones2, size, cap, 0);
  // 負向水平位移等同於交換兩張圖片後的同一個問題。
  if (best < cap) {
    best = scanNonNegativeColumnShifts(masks2, masks1, ones2, ones1, size, cap, best);
  }
  return best;
}
```

## 時間複雜度

- 建立位元計數查表的成本與輸入規模無關，為固定常數；
- 將兩張圖片壓縮為列位元遮罩需掃過所有格子，為 $O(n^2)$；
- 快取每列位元數需一次線性掃描，為 $O(n)$；
- 單趟掃描中垂直位移約有 $2n$ 種、水平位移有 $n$ 種，每種組合需對至多 $n$ 組列配對各做常數次位元運算與查表，為 $O(n^3)$；
- 最多執行兩趟對稱掃描，僅為常數倍數放大；
- 總時間複雜度為 $O(n^3)$。

> $O(n^3)$

## 空間複雜度

- 位元計數查表大小固定，不隨輸入規模成長，視為常數空間；
- 兩張圖片的列位元遮罩與每列位元數快取各需線性空間，為 $O(n)$；
- 掃描過程中的列配對緩衝區亦為線性空間，為 $O(n)$；
- 總空間複雜度為 $O(n)$。

> $O(n)$
