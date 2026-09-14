# 836. Rectangle Overlap

An axis-aligned rectangle is represented as a list `[x1, y1, x2, y2]`, 
where `(x1, y1)` is the coordinate of its bottom-left corner, 
and `(x2, y2)` is the coordinate of its top-right corner. 
Its top and bottom edges are parallel to the X-axis, 
and its left and right edges are parallel to the Y-axis.

Two rectangles overlap if the area of their intersection is positive. 
To be clear, two rectangles that only touch at the corner or edges do not overlap.

Given two axis-aligned rectangles `rec1` and `rec2`, return `true` if they overlap, otherwise return `false`.

**Constraints:**

- `rec1.length == 4`
- `rec2.length == 4`
- `-10^9 <= rec1[i], rec2[i] <= 10^9`
- `rec1` and `rec2` represent a valid rectangle with a non-zero area.

## 基礎思路

本題要求判斷兩個軸對齊矩形是否重疊，並明確規定：僅在交集面積為正時才算重疊，若兩者只在邊或角接觸則不算。

在思考解法時，可掌握以下核心觀察：

- **軸對齊使兩個維度彼此獨立**：
  由於矩形的邊分別平行於兩座標軸，水平方向與垂直方向的投影互不干擾，因此可將二維的重疊判斷拆解為兩條線段各自是否重疊。

- **重疊的反面比正面更易描述**：
  與其直接列舉重疊的所有情形，不如判斷「不重疊」的條件——只要其中一個矩形完全位於另一個的某一側，就必然沒有交集。此類分離情形共有四種方向。

- **接觸不算重疊，故比較必須是嚴格不等式**：
  兩矩形邊界剛好對齊時交集面積為零，因此判斷條件不能包含等號，必須要求兩方向的投影區間都有正的重疊長度。

- **可用「間隙量」統一四種分離條件**：
  將每一種分離情形轉換成一個帶號的差值，該差值為負代表該方向沒有造成分離。如此一來，四個方向的判斷便具備一致的形式。

- **座標範圍保證運算安全**：
  由於座標受限於固定量級，任意兩座標之差皆落在帶號 32 位元可表示的範圍內，因此可安全地改用位元運算處理符號。

依據以上特性，可以採用以下策略：

- **先計算四個方向的分離間隙量**，將「是否分離」統一轉換為「該值是否為非負」。
- **利用所有間隙皆為負才代表重疊**這項性質，將四次條件判斷合併為單一的符號位元檢查，避免多重分支。

此策略以常數次算術與位元運算完成判斷，既簡潔又不含任何分支開銷。

## 解題步驟

### Step 1：計算四個方向的分離間隙量

分別計算左、右、下、上四個方向的間隙：每個值代表「某一矩形的邊界」減去「另一矩形對應的反向邊界」。當某個值為非負時，即代表兩矩形在該方向上被分離；反之為負，代表該方向存在正的重疊長度。

由於座標受限於 `1e9`，所有差值皆落在 `[-2e9, 2e9]` 之內，仍在帶號 32 位元的安全範圍中，後續可放心使用位元運算。

```typescript
// 座標受限於 1e9，因此每個間隙皆落在 [-2e9, 2e9] 之間，
// 安全地低於帶號 32 位元運算的上限 2147483647。
const leftGap = rec1[0] - rec2[2];
const rightGap = rec2[0] - rec1[2];
const bottomGap = rec1[1] - rec2[3];
const topGap = rec2[1] - rec1[3];
```

### Step 2：以位元運算合併四項判斷並回傳結果

唯有四個間隙同時為嚴格負值時，兩矩形才在水平與垂直方向都具有正的重疊長度，即為重疊。將四者做位元 AND 後，最高位的符號位元只有在四者皆為負時才會保留為 1，因此只需檢查結果是否小於零，即可將四次短路判斷壓縮為單一無分支比較。

```typescript
// 只有當四個間隙皆為嚴格負值時才存在重疊。
// 位元 AND 僅在該情況下保留符號位元，
// 因此四個短路分支得以收斂為單一無分支比較。
return (leftGap & rightGap & bottomGap & topGap) < 0;
```

## 時間複雜度

- 僅進行固定次數的減法與位元運算；
- 不含任何迴圈或遞迴。
- 總時間複雜度為 $O(1)$。

> $O(1)$

## 空間複雜度

- 僅使用固定數量的純量變數；
- 無任何額外陣列或動態配置空間。
- 總空間複雜度為 $O(1)$。

> $O(1)$
