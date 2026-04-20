# 2078. Two Furthest Houses With Different Colors

There are `n` houses evenly lined up on the street, and each house is beautifully painted. 
You are given a 0-indexed integer array `colors` of length `n`, where `colors[i]` represents the color of the $i^{th}$ house.

Return the maximum distance between two houses with different colors.

The distance between the $i^{th}$ and $j^{th}$ houses is `abs(i - j)`, where `abs(x)` is the absolute value of `x`.

**Constraints:**

- `n == colors.length`
- `2 <= n <= 100`
- `0 <= colors[i] <= 100`
- Test data are generated such that at least two houses have different colors.

## 基礎思路

本題要求找出兩棟顏色不同的房屋之間的最大距離。由於距離越大，兩端的房屋越有可能顏色不同，因此可以從「最遠的兩個端點」出發思考。

在思考解法時，可掌握以下核心觀察：

- **最大距離必然從某一端點出發**：
  若兩棟房屋的距離是最大值，其中一棟必定是第一棟或最後一棟，因為端點是索引差最大的來源。

- **顏色相同的端點只需往內縮**：
  若最遠的兩棟房屋顏色相同，則需向內找第一棟顏色不同的房屋，兩者的距離即為該方向上的最大合法距離。

- **兩個方向分別計算再取最大值**：
  從第一棟往右找第一棟顏色不同的房屋（從末端往回掃），與從最後一棟往左找第一棟顏色不同的房屋（從頭往前掃），分別得到距離後取最大值即可。

- **提前中斷可避免不必要的掃描**：
  每個方向只需找到第一個符合條件的位置即可，無需遍歷整個陣列。

依據以上特性，可以採用以下策略：

- **固定端點顏色，分別從兩端向內掃描**，找到第一個顏色不同的位置，計算對應距離。
- **取兩方向的較大值回傳**，即為全域最大距離。

此策略將問題化簡為兩次線性掃描，無需枚舉所有配對，效率遠優於暴力法。

## 解題步驟

### Step 1：記錄端點索引與顏色

先取得陣列最後一個索引以及首尾兩棟房屋的顏色，供後續兩次掃描使用。

```typescript
const lastIndex = colors.length - 1;
const firstColor = colors[0];
const lastColor = colors[lastIndex];
```

### Step 2：從末端往回掃描，找出距第一棟最遠的不同顏色房屋

從陣列末端向前走，找到第一個顏色與第一棟不同的房屋，其索引即為該方向的最大距離；若找到就立刻中斷。

```typescript
// 從末端往回找第一個與第一棟顏色不同的房屋
let distanceFromStart = 0;
for (let i = lastIndex; i > 0; i--) {
  if (colors[i] !== firstColor) {
    distanceFromStart = i;
    break;
  }
}
```

### Step 3：從頭往前掃描，找出距最後一棟最遠的不同顏色房屋

從陣列開頭向後走，找到第一個顏色與最後一棟不同的房屋，以末端索引減去該索引得到距離；若找到就立刻中斷。

```typescript
// 從頭往前找第一個與最後一棟顏色不同的房屋
let distanceFromEnd = 0;
for (let i = 0; i < lastIndex; i++) {
  if (colors[i] !== lastColor) {
    distanceFromEnd = lastIndex - i;
    break;
  }
}
```

### Step 4：回傳兩個方向中的較大距離

比較兩個方向各自得到的最大距離，回傳較大者作為最終答案。

```typescript
return distanceFromStart > distanceFromEnd ? distanceFromStart : distanceFromEnd;
```

## 時間複雜度

- 兩次線性掃描各至多走訪 $n$ 個元素，但實際因提前中斷而更短；
- 最壞情況下兩次掃描合計為 $O(n)$。
- 總時間複雜度為 $O(n)$。

> $O(n)$

## 空間複雜度

- 僅使用固定數量的變數儲存端點資訊與距離結果；
- 無任何額外陣列或動態空間。
- 總空間複雜度為 $O(1)$。

> $O(1)$
