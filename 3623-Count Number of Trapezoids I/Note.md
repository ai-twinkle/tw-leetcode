# 3623. Count Number of Trapezoids I

You are given a 2D integer array `points`, where `points[i] = [x_i, y_i]` represents the coordinates of the $i^{th}$ point on the Cartesian plane.

A horizontal trapezoid is a convex quadrilateral with at least one pair of horizontal sides (i.e. parallel to the x-axis). 
Two lines are parallel if and only if they have the same slope.

Return the number of unique horizontal trapezoids that can be formed by choosing any four distinct points from `points`.

Since the answer may be very large, return it modulo `10^9 + 7`.

**Constraints:**

- `4 <= points.length <= 10^5`
- `–10^8 <= x_i, y_i <= 10^8`
- All points are pairwise distinct.

## 基礎思路

本題要求計算所有能由四個不同點組成的「水平梯形」數量。
水平梯形的核心特徵為：至少要有一組上下底邊彼此平行且**水平**，也就是兩條邊必須位於不同的 y 座標上，並且各自由同一條水平線上的兩點形成。

可歸納以下核心觀察：

* **水平線上的兩點可形成一條水平線段**
  若在某個固定的 y 值上有 `c` 個點，則能形成水平線段的數量為 $\binom{c}{2}$。

* **一個水平梯形需要兩條位於不同 y 座標的水平線段**
  因此只要從所有水平線段中挑選任意兩條，且它們分屬不同的 y 座標，即構成一個合法的水平梯形。

* **直接兩兩枚舉會超時，必須以組合方式計算**
  若將所有水平線段總數記為 `S`，且每條 y 線上的線段數為 `s_i`，
  則所有可挑兩條線段的方式為 $\binom{S}{2}$，
  但其中包含了挑選同一 y 座標下的兩條線段（無法構成梯形），需扣除 $\sum \binom{s_i}{2}$。

* **組合式展開後可化為前綴形式：**

  $$
  \binom{S}{2} - \sum \binom{s_i}{2}
  = \frac{S^2 - \sum s_i^2}{2}
  $$

  透過平方與平方和即可在不使用巢狀迴圈的情況下完成計算。

* **數值非常大，需使用 BigInt 並在過程中進行模運算**
  過程需保持所有運算於模空間內，以避免溢位與效能問題。

基於上述分析，可以採用以下策略：

* **以雜湊表統計每條水平線上的點數。**
* **轉換每條水平線的點數為線段數，並累積線段總和與其平方總和。**
* **透過組合式計算跨水平線的線段配對數量。**
* **最後套用模運算與模反元素完成除以 2 的動作。**

此策略能在一次掃描與一次彙整後完成所有計算，適合處理最大 `10^5` 筆資料。

## 解題步驟

### Step 1：初始化模常數與點數統計表

建立必要的模常數與雜湊表，用於記錄每個 y 座標出現的點數。

```typescript
// 使用 BigInt 以確保大型數字運算的安全性
const modulus = 1000000007n;
const modularInverseTwo = 500000004n; // 預先計算的 2 的模反元素

// 計算每條水平線上有多少個點（相同 y 值）
const coordinateYToCountMap = new Map<number, number>();
const numberOfPoints = points.length;

for (let index = 0; index < numberOfPoints; index += 1) {
  const coordinateY = points[index][1];
  const existingCount = coordinateYToCountMap.get(coordinateY) ?? 0;
  coordinateYToCountMap.set(coordinateY, existingCount + 1);
}
```

### Step 2：累積所有水平線段數與其平方總和

逐一檢查每條 y 水平線上的點數，若至少兩點，則可形成線段。
我們累積線段總數與線段數平方的總和（後續用於組合式計算）。

```typescript
// 這兩個變數分別儲存：
// 1. 所有 y 線上的水平線段總數
// 2. 所有水平線段數量的平方總和（用於避免巢狀迴圈）
let sumOfSegmentsModulo = 0n;
let sumOfSegmentSquaresModulo = 0n;

// 對每條水平線，計算其能產生多少線段
for (const countOfPointsOnLine of coordinateYToCountMap.values()) {
  if (countOfPointsOnLine >= 2) {
    const countBig = BigInt(countOfPointsOnLine);

    // 此水平線上所能形成的水平線段數
    const numberOfSegments = (countBig * (countBig - 1n)) / 2n;

    const numberOfSegmentsModulo = numberOfSegments % modulus;

    // 累積所有線段數
    sumOfSegmentsModulo =
      (sumOfSegmentsModulo + numberOfSegmentsModulo) % modulus;

    // 累積線段數平方（未來用於扣除同線上的組合）
    sumOfSegmentSquaresModulo =
      (sumOfSegmentSquaresModulo +
        (numberOfSegmentsModulo * numberOfSegmentsModulo) % modulus) %
      modulus;
  }
}
```

### Step 3：計算跨水平線的線段配對總數

使用前述公式：

$$
\frac{S^2 - \sum s_i^2}{2}
$$

先將全部線段總數平方，再扣除同水平線內的線段配對。

```typescript
// 將總線段數平方，用於組合計算
const sumOfSegmentsSquaredModulo =
  (sumOfSegmentsModulo * sumOfSegmentsModulo) % modulus;

// 扣除所有「同一條水平線上的線段互配」之組合，使只剩跨線的情況
let result =
  (sumOfSegmentsSquaredModulo -
    sumOfSegmentSquaresModulo +
    modulus) % modulus;
```

### Step 4：透過模反元素完成除以 2，並回傳答案

套用除 2 的模運算，最後轉成一般數字回傳。

```typescript
// 使用模反元素執行除以 2
result = (result * modularInverseTwo) % modulus;

// 回傳最終答案（其值介於 0 至 1e9+7 之間，可安全轉 number）
return Number(result);
```

## 時間複雜度

- 需掃描所有點一次以統計 y 座標。
- 需掃描所有不同 y 類別一次以計算組合資料。
- 其餘皆為常數時間運算。
- 總時間複雜度為 $O(n)$。

> $O(n)$

## 空間複雜度

- 需要一個雜湊表儲存所有 y 座標的點數。
- 類別最多與點數同階，因此空間為線性。
- 總空間複雜度為 $O(n)$。

> $O(n)$
