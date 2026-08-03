# 1406. Stone Game III

Alice and Bob continue their games with piles of stones. 
There are several stones arranged in a row, and each stone has an associated value 
which is an integer given in the array `stoneValue`.

Alice and Bob take turns, with Alice starting first. 
On each player's turn, that player can take `1`, `2`, or `3` stones from the first remaining stones in the row.

The score of each player is the sum of the values of the stones taken. The score of each player is `0` initially.

The objective of the game is to end with the highest score, 
and the winner is the player with the highest score and there could be a tie. 
The game continues until all the stones have been taken.

Assume Alice and Bob play optimally.

Return `"Alice"` if Alice will win, `"Bob"` if Bob will win, or `"Tie"` if they will end the game with the same score.

**Constraints:**

- `1 <= stoneValue.length <= 5 * 10^4`
- `1000 <= stoneValue[i] <= 1000`

## 基礎思路

本題是一個典型的博弈型動態規劃問題。兩位玩家輪流從剩餘石頭的最前端取走 `1`、`2` 或 `3` 顆石頭，雙方都以最大化自身最終得分為目標。由於兩人皆採取最優策略，因此不能只考慮單方的貪心選擇，而必須考量「當前玩家的選擇會如何影響對手後續的最優反應」。

在思考解法時，可掌握以下核心觀察：

- **勝負取決於分數差而非絕對分數**：
  由於雙方交替行動且目標對立，我們無需分別追蹤兩人的實際得分，只需追蹤「當前玩家相對於對手的最優分數差」，即可判定最終勝負。

- **問題具有後綴最優子結構**：
  某個位置的最優結果僅取決於其後方剩餘石頭的最優結果，因此可從最後一顆石頭往前推導，將大問題拆解為一連串相同型態的子問題。

- **當前玩家取走後，剩餘局面由對手接手**：
  當玩家從當前位置取走若干顆石頭後，剩下的局面將輪到對手，而對手同樣會爭取自身的最優差值。因此當前玩家的最優差值，等於「自己取走的石頭總和」減去「對手接手後所能取得的最優差值」。

- **狀態轉移僅依賴後方三個位置**：
  由於一次最多取三顆，任一位置的最優差值只會參照其後一、二、三格的結果，因此無須保存完整陣列，只需以少數滾動變數維護即可。

依據以上特性，可以採用以下策略：

- **以「分數差」為核心進行後綴動態規劃**，從最後一顆石頭往前遞推。
- **對每個位置嘗試取 1、2、3 顆的三種選擇，取其能使自身差值最大者**。
- **使用滾動變數取代整個 DP 陣列**，僅維護後方三個位置的最優差值以節省空間。
- **最後依據起始位置的差值正負判斷勝負**：正為 Alice 勝、負為 Bob 勝、零為平手。

此策略能在單次線性掃描中完成所有位置的最優決策，同時保持常數的額外空間。

## 解題步驟

### Step 1：初始化滾動變數與邊界狀態

我們以三個滾動變數分別保存「後方一、二、三個位置」的最優分數差。由於最後一顆石頭已無選擇餘地，當前玩家只能取走它，因此其差值即為該石頭本身的數值。

```typescript
const stoneCount = stoneValue.length;

// 滾動暫存器，保存從當前位置往後一、二、三顆石頭起始之後綴的最優分數差。
// 最後一顆石頭別無選擇，輪到的玩家只能直接取走它。
let differenceAhead1 = stoneValue[stoneCount - 1];
let differenceAhead2 = 0;
let differenceAhead3 = 0;
```

### Step 2：單獨處理倒數第二個位置以避免主迴圈的邊界檢查

倒數第二個位置最多只能取到兩顆石頭，情況較為特殊。我們先在此單獨求解，讓後續主迴圈中的每個位置都保證有三顆石頭可取，藉此省去迴圈內的邊界判斷。

此處分別計算「只取一顆」與「取兩顆」的差值，滾動更新後方狀態，並取兩者較大者作為此位置的最優差值。

```typescript
// 單獨處理倒數第二個位置，使下方的高熱迴圈永遠無需邊界檢查。
if (stoneCount >= 2) {
  const firstValue = stoneValue[stoneCount - 2];
  const takeOne = firstValue - differenceAhead1;
  const takeTwo = firstValue + stoneValue[stoneCount - 1];

  differenceAhead3 = differenceAhead2;
  differenceAhead2 = differenceAhead1;

  if (takeOne > takeTwo) {
    differenceAhead1 = takeOne;
  } else {
    differenceAhead1 = takeTwo;
  }
}
```

### Step 3：主迴圈由後往前掃描，計算各取法的累積總和

從倒數第三個位置開始往前遍歷，此時每個位置都保證有三顆石頭可取。我們以遞增方式計算取一、二、三顆的累積總和，重複利用前一次的加總結果，避免重新計算整個區間和。

```typescript
// 主要掃描：此處每個索引都保證有三顆石頭可取。
for (let index = stoneCount - 3; index >= 0; index--) {
  // 遞增總和重用前一次的加法，而非重新計算視窗總和。
  const oneStoneSum = stoneValue[index];
  const twoStoneSum = oneStoneSum + stoneValue[index + 1];
  const threeStoneSum = twoStoneSum + stoneValue[index + 2];

  // ...
}
```

### Step 4：比較三種取法，選出使自身差值最大的決策

當前玩家取走若干顆石頭後，剩餘局面交由對手接手，因此每種取法的差值為「自己取走的總和」減去「對手接手後對應的最優差值」。我們比較取一、二、三顆三種情況，保留能使自身差值最大者。

```typescript
for (let index = stoneCount - 3; index >= 0; index--) {
  // Step 3：計算取一、二、三顆的累積總和

  let bestDifference = oneStoneSum - differenceAhead1;

  const takeTwoDifference = twoStoneSum - differenceAhead2;

  if (takeTwoDifference > bestDifference) {
    bestDifference = takeTwoDifference;
  }

  const takeThreeDifference = threeStoneSum - differenceAhead3;

  if (takeThreeDifference > bestDifference) {
    bestDifference = takeThreeDifference;
  }

  // ...
}
```

### Step 5：滾動更新後方三個位置的狀態

計算出當前位置的最優差值後，將三個滾動變數整體向左平移一格，使其在下一次迭代中對應到正確的後方位置。

```typescript
for (let index = stoneCount - 3; index >= 0; index--) {
  // Step 3：計算取一、二、三顆的累積總和

  // Step 4：比較三種取法選出最優差值

  // 將視窗向左平移一格，供下一次迭代使用。
  differenceAhead3 = differenceAhead2;
  differenceAhead2 = differenceAhead1;
  differenceAhead1 = bestDifference;
}
```

### Step 6：依據起始位置的差值正負判定勝負

迴圈結束後，`differenceAhead1` 保存的是從第一顆石頭起始、由 Alice 先手時的最優分數差。差值為正代表 Alice 領先、為負代表 Bob 領先、為零則雙方平手。

```typescript
// 差值為正代表 Alice 領先，為負代表 Bob 領先。
if (differenceAhead1 > 0) {
  return "Alice";
}

if (differenceAhead1 < 0) {
  return "Bob";
}

return "Tie";
```

## 時間複雜度

- 主迴圈由後往前遍歷所有位置，共執行約 `n` 次；
- 每個位置的取法比較與狀態更新皆為常數時間。
- 總時間複雜度為 $O(n)$。

> $O(n)$

## 空間複雜度

- 僅使用固定數量的滾動變數維護後方三個位置的狀態；
- 未使用任何額外的陣列或動態空間。
- 總空間複雜度為 $O(1)$。

> $O(1)$
