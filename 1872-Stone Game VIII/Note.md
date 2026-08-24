# 1872. Stone Game VIII

Alice and Bob take turns playing a game, with Alice starting first.

There are `n` stones arranged in a row. 
On each player's turn, while the number of stones is more than one, they will do the following:

1. Choose an integer `x > 1`, and remove the leftmost x stones from the row.
2. Add the sum of the removed stones' values to the player's score.
3. Place a new stone, whose value is equal to that sum, on the left side of the row.

The game stops when only one stone is left in the row.

The score difference between Alice and Bob is `(Alice's score - Bob's score)`. 
Alice's goal is to maximize the score difference, and Bob's goal is the minimize the score difference.

Given an integer array `stones` of length `n` where `stones[i]` represents the value of the $i^{th}$ stone from the left, 
return the score difference between Alice and Bob if they both play optimally.

**Constraints:**

- `n == stones.length`
- `2 <= n <= 10^5`
- `-10^4 <= stones[i] <= 10^4`

## 基礎思路

本題是一場雙人輪流進行的博弈：每一回合玩家會從最左端取走連續若干顆石頭（至少兩顆），將其總和計入自己的分數，並把一顆等值的新石頭放回最左端。由於被取走的部分永遠會被壓縮成一顆新石頭，整個過程其實只是不斷向右推進一條「分界線」。

在思考解法時，可掌握以下核心觀察：

- **每次操作等價於選擇一條分界線**：
  無論前面經過多少次合併，玩家實際得到的分數，永遠等於「從最左端到某個位置為止的所有原始石頭總和」。因此局面可以只用「目前分界線的位置」來描述，與先前的操作歷史無關。

- **分界線只能單向前進**：
  每一回合至少取走兩顆石頭，代表分界線必定嚴格往右移動，且最後一回合必然把分界線推到最右端，因為遊戲會在只剩一顆石頭時停止。

- **分數差具有對稱遞迴結構**：
  兩位玩家的目標互為相反，一方最大化分數差、另一方最小化分數差。因此「當前玩家取到某個分界線」所造成的分數差，等於「該分界線之前的總和」減去「對手在剩餘局面中所能取得的最佳分數差」。

- **邊界情況是唯一的固定起點**：
  當分界線已經被推到最右端時，當前玩家別無選擇，只能取走全部，此時的分數差即為所有石頭的總和。

依據以上特性，可以採用以下策略：

- **先求出所有石頭的總和，作為最右端分界線的固定答案**，這是整個遞迴的基底。
- **由右往左逐一考慮每一條可能的分界線**，同時遞減式地維護該分界線所對應的前綴總和，避免重複計算。
- **在每個分界線上比較「立即取走」與「留給後方更佳選擇」兩者**，取其較大者作為該位置的最佳分數差。
- **最終最左側可行分界線所累積出的最佳值，即為雙方皆最佳決策下的分數差**。

此策略把看似複雜的博弈過程壓縮成一次由右至左的線性掃描，兼具正確性與效率。

## 解題步驟

### Step 1：取得石頭數量

首先記錄石頭的總數，作為後續掃描範圍的依據。

```typescript
const stoneCount = stones.length;
```

### Step 2：累計所有石頭的總和

以一次線性掃描求得全部石頭的總和，此值同時也是最右端分界線所對應的前綴總和，後續會由此逐步向左遞減。

```typescript
// 所有石頭的總和，也就是 prefix[stoneCount - 1]。
let runningPrefixSum = 0;
for (let index = 0; index < stoneCount; index++) {
  runningPrefixSum += stones[index];
}
```

### Step 3：設定基底情況的最佳分數差

當分界線已在最右端時，當前玩家只能取走全部石頭，因此該局面的最佳分數差即為總和，作為遞迴的起始值。

```typescript
// 基底情況：最後一個分界點強制必須取走所有石頭。
let bestDifference = runningPrefixSum;
```

### Step 4：由右至左走訪分界線並同步縮減前綴和

從倒數第二個分界線開始往左推進，每往左一格就把多出來的那顆石頭從前綴總和中扣除，使其始終對應目前所在的分界線位置。

```typescript
// 由右至左走訪分界點，並同步縮減前綴和。
for (let index = stoneCount - 2; index >= 1; index--) {
  runningPrefixSum -= stones[index + 1];

  // ...
}
```

### Step 5：計算立即取走的分數差並更新最佳解

在當前分界線上，若選擇立即取走前綴的所有石頭，則分數差為「此前綴總和」扣除「對手在剩餘局面中能取得的最佳分數差」；將其與既有的最佳值比較，若更優則更新，此處以手動比較取代函式呼叫以降低開銷。

```typescript
for (let index = stoneCount - 2; index >= 1; index--) {
  // Step 4：縮減前綴和至當前分界點

  // 取走至此分界點的所有石頭，並把剩餘的局面交給對手。
  const takeNowDifference = runningPrefixSum - bestDifference;

  // 以手動比較取代 Math.max，避免熱迴圈中的呼叫開銷。
  if (takeNowDifference > bestDifference) {
    bestDifference = takeNowDifference;
  }
}
```

### Step 6：回傳最終的最佳分數差

掃描結束後，所保留的值即為雙方皆採取最佳決策時的分數差，直接回傳。

```typescript
return bestDifference;
```

## 時間複雜度

- 計算總和需一次線性掃描，為 $O(n)$；
- 由右至左走訪所有分界線同樣為一次線性掃描，為 $O(n)$；
- 每個分界線上的更新皆為常數時間操作。
- 總時間複雜度為 $O(n)$。

> $O(n)$

## 空間複雜度

- 僅使用固定數量的純量變數維護前綴總和與最佳分數差；
- 未配置任何額外陣列或遞迴堆疊。
- 總空間複雜度為 $O(1)$。

> $O(1)$
