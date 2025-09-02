# 3025. Find the Number of Ways to Place People I

You are given a 2D array `points` of size `n x 2` representing integer coordinates of some points on a 2D plane, 
where `points[i] = [x_i, y_i]`.

Count the number of pairs of points `(A, B)`, where

- `A` is on the upper left side of `B`, and
- there are no other points in the rectangle (or line) they make (including the border).

Return the count.

**Constraints:**

- `2 <= n <= 50`
- `points[i].length == 2`
- `0 <= points[i][0], points[i][1] <= 50`
- All `points[i]` are distinct.

## 基礎思路

題目要求計算所有滿足「點 A 在點 B 左上方，且矩形內沒有其他點」的點對 `(A, B)`。
解題的核心策略為：

1. **排序點集**：先將所有點依據 `x` 座標遞增排序，若 `x` 相同則依 `y` 座標遞減排序，這樣可以保證後續判斷時，`A` 會在 `B` 的左邊或同一條垂直線上。
2. **枚舉點對**：透過雙層迴圈枚舉所有可能的 `(A, B)`，並檢查 `A` 是否位於 `B` 的左上方。
3. **檢查矩形內是否有其他點**：對於每一對 `(A, B)`，在它們之間的點中檢查是否有落入矩形的情況，如果有則此組不計算，否則有效。
4. **累計答案**：當 `(A, B)` 符合條件時，答案計數加一。

此方法能確保所有有效點對被完整枚舉並正確計數。

## 解題步驟

### Step 1：排序與初始化

先計算點的總數，並將點依照規則排序。排序後確保我們在檢查點對 `(A, B)` 時，A 一定出現在 B 之前，方便判斷相對位置。

```typescript
const totalPoints = points.length;

// 依據 x 遞增，若 x 相同則依 y 遞減排序
points.sort((p, q) => (p[0] !== q[0] ? p[0] - q[0] : q[1] - p[1]));

let pairCount = 0;
```

### Step 2：枚舉所有點對並檢查條件

使用雙層迴圈，外層固定點 A，內層依序選擇點 B。
若 `A` 在 `B` 的右邊或下方，則不符合「左上方」條件直接跳過；
否則進一步檢查矩形是否被其他點佔據。

```typescript
for (let i = 0; i < totalPoints; i++) {
  const pointA = points[i];

  for (let j = i + 1; j < totalPoints; j++) {
    const pointB = points[j];

    // A 必須在 B 的左上方
    if (pointA[0] > pointB[0] || pointA[1] < pointB[1]) {
      continue;
    }

    let rectangleIsEmpty = true;

    // 檢查在 i 與 j 之間是否有其他點落入矩形
    for (let k = i + 1; k < j; k++) {
      const pointC = points[k];
      if (
        pointA[0] <= pointC[0] && pointC[0] <= pointB[0] &&
        pointA[1] >= pointC[1] && pointC[1] >= pointB[1]
      ) {
        rectangleIsEmpty = false;
        break;
      }
    }

    if (rectangleIsEmpty) {
      pairCount++;
    }
  }
}
```

### Step 3：回傳最終結果

若矩形有效 (內部沒有其他點)，則累計計數器，最後回傳計算的總數。

```typescript
return pairCount;
```

## 時間複雜度

- 排序需要 $O(n \log n)$。
- 雙層迴圈檢查點對需要 $O(n^2)$。
- 每對點在最壞情況下需再檢查中間點，額外 $O(n)$。
- 總時間複雜度為 $O(n^3)$。

> $O(n^3)$

## 空間複雜度

- 僅使用少量輔助變數存放中間結果與計數器，未使用額外資料結構。
- 總空間複雜度為 $O(1)$。

> $O(1)$
