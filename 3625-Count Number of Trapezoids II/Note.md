# 3625. Count Number of Trapezoids II

You are given a 2D integer array `points` where `points[i] = [x_i, y_i]` represents the coordinates of the $i^{th}$ point on the Cartesian plane.

Return the number of unique trapezoids that can be formed by choosing any four distinct points from `points`.

A trapezoid is a convex quadrilateral with at least one pair of parallel sides. 
Two lines are parallel if and only if they have the same slope.

**Constraints:**

- `4 <= points.length <= 500`
- `–1000 <= x_i, y_i <= 1000`
- All points are pairwise distinct.

## 基礎思路

題目要求計算平面上一組點能形成的**唯一梯形數量**。梯形被定義為「至少有一組邊互相平行的凸四邊形」，因此本質上是在所有四點組合中，挑出那些能構成「恰好有（至少）一組平行邊，且四邊形為凸」的情況。

如果從四點直接去判斷是否為凸梯形，組合數量為 $O(n^4)$，在 $n \le 500$ 的情況下明顯不可行。因此需要改用「**先看線段，再反推四邊形**」的幾何與組合思路：

* **平行邊來自於兩條平行線段**
  一個梯形至少有一組平行邊，可以視為從所有點對形成的線段中，選出一對「斜率相同但不共線」的線段，作為梯形的兩條底邊。
  也就是：

    * 先枚舉所有點對形成的線段；
    * 依照「斜率」分組；
    * 在每個斜率群組中，任選兩條不在同一直線上的線段，就對應到一個有一組平行邊的四點組合。

* **同斜率線段中，需要扣掉「在同一直線上」的線段配對**
  若兩條線段不僅斜率相同，還在同一直線上，那四個端點會共線，不可能形成有效四邊形。
  在每個斜率群組中：

    * 總線段數為 $S$，其線段對數為 $\binom{S}{2}$；
    * 再依照「直線」細分，每條直線上有 $c_i$ 條線段，這些都不能彼此配成梯形底邊，需扣掉 $\sum \binom{c_i}{2}$；
    * 差值 $\binom{S}{2} - \sum \binom{c_i}{2}$ 就是在該斜率下，所有「不同直線上的平行線段配對」，對應潛在梯形底邊的候選數。

* **平行四邊形會被重複計數，需要額外扣除**
  平行四邊形有兩組平行邊，因此在「依斜率統計」時，會以兩組平行邊分別被當成「一組平行線段配對」，導致重複計數。
  幾何上，平行四邊形有一個特徵：

    * 對邊線段互相平行；
    * 並且兩條對邊的中點相同。
      因此可以：
    * 把所有線段依照「中點」分組，再在每個中點群組內按照斜率細分；
    * 若同一中點下共有 $D$ 條線段，總配對數為 $\binom{D}{2}$；
    * 同斜率線段之間配對代表「共線平分線」的組合，需要扣除 $\sum \binom{d_i}{2}$；
    * 差值 $\binom{D}{2} - \sum \binom{d_i}{2}$ 就是「中點相同且斜率不同」的線段對，正好對應到一個平行四邊形，但之前已被算兩次，因此現階段需再減一次，做為修正。

* **使用整數化與規範化的 key 來判斷斜率、直線與中點**
  為避免浮點誤差並保持 $O(1)$ 比較，對每條線段使用整數向量與最大公因數化簡斜率，並且：

    * 將方向向量 $(dx, dy)$ 規範化為唯一代表（例如強制 $dx > 0$ 或統一垂直線的表示方式）；
    * 利用斜率與直線不變量（例如 $dx \cdot y - dy \cdot x$）來唯一編碼一條直線；
    * 利用中點座標和（例如 $x_1 + x_2, y_1 + y_2$）來判定兩線段是否共用同一中點。
      這些資訊都可以壓成 32 位元整數 key，方便排序與分組。

綜合以上設計：

* 先枚舉所有 $O(n^2)$ 條線段，為每條線段計算「斜率 key」、「直線 key」、「中點 key」；
* 再依斜率＋直線排序，計算所有候選的「平行線段配對」數量；
* 再依中點＋斜率排序，計算所有需要扣除的平行四邊形數量；
* 最後得到的就是所有不同點集所能構成的唯一梯形數量。

## 解題步驟

### Step 1：使用組合函式計算無序配對數量

先定義輔助函式，針對非負整數 $n$ 計算 $\binom{n}{2}$，代表「從 $n$ 個元素中挑選無序線段配對」的數量；當 $n < 2$ 時直接回傳 0，避免出現負值或不合法情況。

```typescript
/**
 * 對非負整數計算 nC2 = n * (n - 1) / 2。
 *
 * @param value - 非負整數
 * @return 從 value 個元素中選取無序配對的數量
 */
function combinationTwo(value: number): number {
  if (value < 2) {
    return 0;
  }
  return (value * (value - 1)) / 2;
}
```

### Step 2：利用最大公因數將斜率向量正規化

定義最大公因數輔助函式，用迭代版的歐幾里得算法，將兩個非負整數壓縮到其共同因數，之後可用來將方向向量 $(dx, dy)$ 化簡為最簡整數比，確保相同斜率有穩定且統一的表示法。

```typescript
/**
 * 計算兩個非負整數的最大公因數。
 *
 * @param a - 第一個非負整數
 * @param b - 第二個非負整數
 * @return a 與 b 的最大公因數
 */
function greatestCommonDivisor(a: number, b: number): number {
  while (b !== 0) {
    const remainder = a % b;
    a = b;
    b = remainder;
  }
  return a;
}
```

### Step 3：檢查點數與提前結束條件

進入主邏輯前，先-確認點的數量是否足以構成四邊形；若少於 4 個點，直接回傳 0，避免後續多餘計算。

```typescript
const pointCount = points.length;

if (pointCount < 4) {
  return 0;
}
```

### Step 4：將座標複製到 TypedArray 以加速存取

將輸入的點座標拆成兩個獨立的一維 typed array，方便之後在雙重迴圈中以數字索引快速存取，減少陣列巢狀存取帶來的額外開銷。

```typescript
// 使用 typed array 以加速座標讀取
const xCoordinates = new Int16Array(pointCount);
const yCoordinates = new Int16Array(pointCount);

// 將 points 複製到 typed array 中
for (let indexPoint = 0; indexPoint < pointCount; indexPoint++) {
  const point = points[indexPoint];
  xCoordinates[indexPoint] = point[0];
  yCoordinates[indexPoint] = point[1];
}
```

### Step 5：為所有線段準備儲存 key 的結構與常數

總線段數為組合數 $\binom{n}{2}$。為每條線段預留三種 key：斜率 key、直線 key、中點 key，皆使用 32 位元整數儲存。接著定義一組常數，用於將多個小範圍整數「打包」成單一整數 key，確保之後排序與比較可以只看一個值。

```typescript
// 所有線段總數量，為 O(n²)
const segmentCount = (pointCount * (pointCount - 1)) / 2;

// 用 typed array 儲存壓縮後的斜率、直線以及中點 key
const slopeKeys = new Int32Array(segmentCount);
const lineKeys = new Int32Array(segmentCount);
const midKeys = new Int32Array(segmentCount);

// 用於將各種 key 壓縮進單一 32 位元整數的常數
const slopeShift = 2048;
const midpointShift = 2048;
const midpointBase = 4096;
const lineConstantBase = 11000000;
const lineOffsetShift = 5000000;

let segmentIndex = 0;
```

### Step 6：枚舉所有點對，建立線段並計算三種 key

透過雙重迴圈枚舉所有點對形成的線段，對每條線段：

1. 計算 $(\Delta x, \Delta y)$，並將方向規範化：

    * 垂直線與水平線有固定的標準表示；
    * 其他情況下，利用符號與最大公因數將 $(dx, dy)$ 壓縮為唯一的最簡整數向量。
2. 利用規範化後的方向向量，建立「斜率 key」與「直線 key」；
3. 以兩端點座標和的方式建立「中點 key」；
4. 將三種 key 依序寫入前面配置好的 typed array。

```typescript
// 產生所有線段並計算對應的壓縮 key
for (let indexFirst = 0; indexFirst < pointCount; indexFirst++) {
  const xFirst = xCoordinates[indexFirst];
  const yFirst = yCoordinates[indexFirst];

  for (let indexSecond = indexFirst + 1; indexSecond < pointCount; indexSecond++) {
    const xSecond = xCoordinates[indexSecond];
    const ySecond = yCoordinates[indexSecond];

    const deltaX = xSecond - xFirst;
    const deltaY = ySecond - yFirst;

    let dxNormalized;
    let dyNormalized;

    // 正規化方向，確保相同斜率有一致的表示方式
    if (deltaX === 0) {
      dxNormalized = 0;
      dyNormalized = 1; // 垂直線的標準方向
    } else if (deltaY === 0) {
      dxNormalized = 1;
      dyNormalized = 0; // 水平線的標準方向
    } else {
      // 正規化 (dx, dy)，強制 dx > 0 以保證唯一性
      let sign = 1;
      if (deltaX < 0) {
        sign = -1;
      }

      const dxAbsolute = deltaX * sign;
      const dySigned = deltaY * sign;
      const gcdValue = greatestCommonDivisor(dxAbsolute, Math.abs(dySigned));

      dxNormalized = dxAbsolute / gcdValue;
      dyNormalized = dySigned / gcdValue;
    }

    // 將正規化後的斜率壓縮為整數 key
    const packedSlopeKey =
      ((dyNormalized + slopeShift) << 12) | (dxNormalized + slopeShift);

    // 計算直線不變量，用於將線段分組到同一直線
    const lineConstant = dxNormalized * yFirst - dyNormalized * xFirst;

    // 將斜率與直線常數打包成唯一的直線 key
    const packedLineKey =
      packedSlopeKey * lineConstantBase + (lineConstant + lineOffsetShift);

    // 以 (x1 + x2, y1 + y2) 打包中點資訊
    const sumX = xFirst + xSecond;
    const sumY = yFirst + ySecond;

    const packedMidKey =
      (sumX + midpointShift) * midpointBase + (sumY + midpointShift);

    // 儲存線段對應的三種 key
    slopeKeys[segmentIndex] = packedSlopeKey;
    lineKeys[segmentIndex] = packedLineKey;
    midKeys[segmentIndex] = packedMidKey;

    segmentIndex++;
  }
}
```

### Step 7：建立索引陣列並依 key 排序做分組準備

為避免在排序時搬移大型 typed array 的內容，先建立兩組純 JavaScript 陣列來存放線段索引，接著：

* `indicesBySlope` 會依照「斜率 key → 直線 key」排序，用於之後按斜率與直線分組；
* `indicesByMid` 會依照「中點 key → 斜率 key」排序，用於之後按中點與斜率分組。

```typescript
// 使用索引陣列來排序，避免搬動 typed array 本身
const indicesBySlope = new Array(segmentIndex);
const indicesByMid = new Array(segmentIndex);

for (let index = 0; index < segmentIndex; index++) {
  indicesBySlope[index] = index;
  indicesByMid[index] = index;
}

// 依 (slopeKey → lineKey) 排序：先依斜率，再依直線分組
indicesBySlope.sort((firstIndex, secondIndex) => {
  const slopeDifference = slopeKeys[firstIndex] - slopeKeys[secondIndex];
  if (slopeDifference !== 0) {
    return slopeDifference;
  }
  return lineKeys[firstIndex] - lineKeys[secondIndex];
});

// 依 (midKey → slopeKey) 排序：先依中點，再依斜率分組
indicesByMid.sort((firstIndex, secondIndex) => {
  const midDifference = midKeys[firstIndex] - midKeys[secondIndex];
  if (midDifference !== 0) {
    return midDifference;
  }
  return slopeKeys[firstIndex] - slopeKeys[secondIndex];
});
```

### Step 8：依斜率與直線分組，累計所有候選梯形底邊配對

初始化梯形計數與掃描位置後，利用 `indicesBySlope` 已排序的結果，按「斜率群組 → 直線子群組」分段掃描：

1. 對每個斜率群組，統計其總線段數 $S$ 與每一條直線上的線段數 $c_i$；
2. 使用組合函式計算：

    * 所有線段對數 $\binom{S}{2}$；
    * 各直線上的線段對總和 $\sum \binom{c_i}{2}$；
3. 二者差值即為「同斜率且不共線」的線段配對數，對應到所有可能的梯形底邊選擇，將這個值加入總梯形數。

```typescript
let trapezoidCount = 0;
/**
 * 第一步：統計所有可作為梯形底邊的平行線段配對
 *
 * 對每個斜率群組：
 *   - 總配對數：C(S, 2)
 *   - 扣除同一直線上的配對：sum(C(ci, 2))
 *   - 差值即為有效底邊配對數
 */
let position = 0;

while (position < segmentIndex) {
  const currentSlopeKey = slopeKeys[indicesBySlope[position]];

  let segmentTotalForSlope = 0;
  let sameLinePairsForSlope = 0;

  let positionWithinSlope = position;

  // 掃描所有斜率相同的線段
  while (
    positionWithinSlope < segmentIndex &&
    slopeKeys[indicesBySlope[positionWithinSlope]] === currentSlopeKey
    ) {
    const currentLineKey = lineKeys[indicesBySlope[positionWithinSlope]];
    let segmentCountForLine = 0;

    // 計算同一直線上的線段數量
    do {
      segmentCountForLine++;
      positionWithinSlope++;
    } while (
      positionWithinSlope < segmentIndex &&
      slopeKeys[indicesBySlope[positionWithinSlope]] === currentSlopeKey &&
      lineKeys[indicesBySlope[positionWithinSlope]] === currentLineKey
      );

    // 加上同一直線上線段配對數 C(ci, 2)
    sameLinePairsForSlope += combinationTwo(segmentCountForLine);
    segmentTotalForSlope += segmentCountForLine;
  }

  // 對此斜率群組加入有效平行線段配對數
  if (segmentTotalForSlope >= 2) {
    const totalPairsAll = combinationTwo(segmentTotalForSlope);
    trapezoidCount += totalPairsAll - sameLinePairsForSlope;
  }

  position = positionWithinSlope;
}
```

### Step 9：依中點與斜率分組，扣除被重複計數的平行四邊形

接著處理「平行四邊形被計算兩次」的修正。利用 `indicesByMid` 已排序結果，按「中點群組 → 斜率子群組」分段掃描：

1. 對每個中點群組，統計總線段數 $D$ 與各斜率子群組的線段數 $d_i$；
2. $\binom{D}{2}$ 代表所有共用該中點的線段配對數，其中有一部分是同斜率（對應共線情況），其總和為 $\sum \binom{d_i}{2}$；
3. 差值 $\binom{D}{2} - \sum \binom{d_i}{2}$ 就是「中點相同且斜率不同」的線段配對數，恰好對應平行四邊形；這些在前一步中已被計數兩次，因此現在需減去一次作為修正。

```typescript
/**
 * 第二步：扣除平行四邊形（被重複計數的情況）
 *
 * 平行四邊形對應於兩條：
 *  - 中點相同的線段
 *  - 斜率不同（對邊）
 * 這些情況在上面已被計算兩次，這裡需再減去一次。
 */
position = 0;

while (position < segmentIndex) {
  const currentMidKey = midKeys[indicesByMid[position]];

  let segmentTotalForMid = 0;
  let sameSlopePairsForMid = 0;

  let positionWithinMid = position;

  // 掃描所有中點相同的線段
  while (
    positionWithinMid < segmentIndex &&
    midKeys[indicesByMid[positionWithinMid]] === currentMidKey
    ) {
    const currentSlopeKey = slopeKeys[indicesByMid[positionWithinMid]];
    let segmentCountForSlope = 0;

    // 計算在此中點下、斜率相同的線段數
    do {
      segmentCountForSlope++;
      positionWithinMid++;
    } while (
      positionWithinMid < segmentIndex &&
      midKeys[indicesByMid[positionWithinMid]] === currentMidKey &&
      slopeKeys[indicesByMid[positionWithinMid]] === currentSlopeKey
      );

    // 加上同斜率配對數 C(di, 2)
    sameSlopePairsForMid += combinationTwo(segmentCountForSlope);
    segmentTotalForMid += segmentCountForSlope;
  }

  // 扣除平行四邊形的貢獻（被多算一次的部分）
  if (segmentTotalForMid >= 2) {
    const totalPairsAll = combinationTwo(segmentTotalForMid);
    trapezoidCount -= totalPairsAll - sameSlopePairsForMid;
  }

  position = positionWithinMid;
}
```

### Step 10：回傳最終梯形數量

前兩個步驟分別完成「所有有一組平行邊的四點組合」的計數，與「平行四邊形的重複計數修正」，最後直接回傳累積出的總梯形數。

```typescript
return trapezoidCount;
```

## 時間複雜度

- 產生所有線段的過程為雙重迴圈，時間為 $O(n^2)$，其中 $n$ 為點數。
- 對線段索引進行兩次排序，線段數量約為 $m = \binom{n}{2} = O(n^2)$，排序成本為 $O(m \log m) = O(n^2 \log n)$。
- 之後兩次線性掃描（依斜率分組、依中點分組）各為 $O(m)$。
- 總時間複雜度為 $O(n^2 \log n)$。

> $O(n^2 \log n)$

## 空間複雜度

- 額外使用兩個長度為 $n$ 的 typed array 儲存點的座標，空間為 $O(n)$。
- 為所有線段配置三個長度為 $m = O(n^2)$ 的 typed array（斜率 key、直線 key、中點 key），再加上兩個長度為 $m$ 的索引陣列。
- 其他輔助變數只占用常數額外空間。
- 總空間複雜度為 $O(n^2)$。

> $O(n^2)$
