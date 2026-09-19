# 1401. Circle and Rectangle Overlapping

You are given a circle represented as `(radius, xCenter, yCenter)` 
and an axis-aligned rectangle represented as `(x1, y1, x2, y2)`, 
where `(x1, y1)` are the coordinates of the bottom-left corner, 
and `(x2, y2)` are the coordinates of the top-right corner of the rectangle.

Return `true` if the circle and rectangle are overlapped otherwise return `false`. 
In other words, check if there is any point `(x_i, y_i)` 
that belongs to the circle and the rectangle at the same time.

**Constraints:**

- `1 <= radius <= 2000`
- `-10^4 <= xCenter, yCenter <= 10^4`
- `-10^4 <= x1 < x2 <= 10^4`
- `-10^4 <= y1 < y2 <= 10^4`

## 基礎思路

本題要求判斷一個圓與一個軸對齊矩形是否有重疊，也就是是否存在同時屬於兩者的點。若直接嘗試枚舉邊界交點或分類討論各種相交情況，將會產生大量繁瑣且容易遺漏的分支。

在思考解法時，可掌握以下核心觀察：

- **重疊等價於最近距離的判定**：
  圓與矩形有交集，等價於矩形上距離圓心最近的那一點落在圓內或圓上；因此問題可轉化為「求圓心到矩形的最短距離，再與半徑比較」。

- **軸對齊使兩個維度互相獨立**：
  由於矩形與座標軸對齊，水平方向與垂直方向的偏移量可以分別獨立計算，不需要考慮傾斜帶來的耦合。

- **單一維度的偏移具有三段式結構**：
  在任一維度上，圓心可能位於區間左側、區間之內、或區間右側。位於區間之內時該維度不產生任何偏移；位於區間之外時，偏移量即為圓心到該側邊界的距離。

- **單維偏移即可提前排除**：
  任何一個維度的偏移量若已超過半徑，則總距離必然更大，可立即判定不重疊，無須再計算另一維度。

- **比較距離時可避免開方**：
  判定式兩側同時平方後不改變大小關係，且在本題數值範圍下平方和仍可被浮點數精確表示，因此改以平方比較更穩定且更快。

依據以上特性，可以採用以下策略：

- **分別計算兩個維度上圓心到矩形的偏移量**，圓心落在區間內時該維度偏移視為零。
- **每計算完一個維度就先行檢查是否已超出半徑**，可提早結束不必要的運算。
- **最後以平方距離與半徑平方比較**，得出是否重疊的結論。

此策略以常數次比較與乘法即可完成判定，邏輯精簡且不需處理任何特殊相交情形。

## 解題步驟

### Step 1：計算圓心到矩形的水平偏移量

先處理水平方向：若圓心的橫座標落在矩形的左右邊界之間，代表水平方向上沒有距離差；若落在左側或右側之外，則偏移量為圓心到最近一側邊界的距離。

```typescript
// 圓心到矩形的水平距離差（當圓心位於 [x1, x2] 之間時為零）
let deltaX = 0;
if (xCenter < x1) {
  deltaX = x1 - xCenter;
} else if (xCenter > x2) {
  deltaX = xCenter - x2;
}
```

### Step 2：以水平偏移提前排除不可能的情況

若水平偏移量已經大於半徑，則不論垂直方向如何，總距離必然超過半徑，可直接判定不重疊。

```typescript
// 提前結束：矩形在水平方向上已超出可觸及範圍
if (deltaX > radius) {
  return false;
}
```

### Step 3：計算圓心到矩形的垂直偏移量

以與水平方向完全對稱的方式處理垂直方向：圓心縱座標落在矩形上下邊界之間時偏移為零，否則取其到最近一側邊界的距離。

```typescript
// 圓心到矩形的垂直距離差（當圓心位於 [y1, y2] 之間時為零）
let deltaY = 0;
if (yCenter < y1) {
  deltaY = y1 - yCenter;
} else if (yCenter > y2) {
  deltaY = yCenter - y2;
}
```

### Step 4：以垂直偏移提前排除不可能的情況

同理，若垂直偏移量已大於半徑，則距離必然超出，可直接判定不重疊。

```typescript
// 提前結束：矩形在垂直方向上已超出可觸及範圍
if (deltaY > radius) {
  return false;
}
```

### Step 5：以平方距離與半徑平方比較得出結論

兩個維度的偏移量構成圓心到矩形最近點的位移分量，將其平方和與半徑平方比較即可判定是否重疊；採用平方比較可避免開方運算，且在本題數值範圍內仍能被浮點數精確表示。

```typescript
// 比較平方距離以避免 Math.sqrt；最大值約為 8 * 10^8，在雙精度浮點數中可被精確表示
return deltaX * deltaX + deltaY * deltaY <= radius * radius;
```

## 時間複雜度

- 僅進行固定次數的比較、減法與乘法運算；
- 不涉及任何迴圈或遞迴結構。
- 總時間複雜度為 $O(1)$。

> $O(1)$

## 空間複雜度

- 僅使用固定數量的純量變數儲存兩個維度的偏移量；
- 無任何額外陣列或動態配置的空間。
- 總空間複雜度為 $O(1)$。

> $O(1)$
