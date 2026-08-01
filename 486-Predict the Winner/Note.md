# 486. Predict the Winner

You are given an integer array `nums`. 
Two players are playing a game with this array: player 1 and player 2.

Player 1 and player 2 take turns, with player 1 starting first. 
Both players start the game with a score of `0`. 
At each turn, the player takes one of the numbers from either end of the array 
(i.e., `nums[0]` or `nums[nums.length - 1]`) which reduces the size of the array by `1`. 
The player adds the chosen number to their score. 
The game ends when there are no more elements in the array.

Return `true` if Player 1 can win the game. 
If the scores of both players are equal, then player 1 is still the winner, and you should also return `true`. 
You may assume that both players are playing optimally.

**Constraints:**

- `1 <= nums.length <= 20`
- `0 <= nums[i] <= 10^7`

## 基礎思路

本題是一個典型的博弈類動態規劃問題。兩位玩家輪流從陣列的頭尾取數，且雙方皆採取最優策略，我們需要判斷先手玩家最終能否不落敗。

在思考解法時，可掌握以下核心觀察：

- **勝負可轉化為分差問題**：
  由於兩位玩家的總分固定為整個陣列之和，我們無須分別追蹤兩人各自的分數，只需關注「當前玩家所能取得的分數領先量」；只要先手最終的領先量非負，即代表其不落敗。

- **最優策略具備遞迴結構**：
  對於任意一段連續區間，當前玩家會從兩端擇一取數，取數後剩餘區間便輪到對手成為新的「當前玩家」。因此當前玩家在此區間所能取得的最佳分差，等於「取一端所得數值，減去對手在剩餘區間能取得的最佳分差」中的較大者。

- **偶數長度為必勝特例**：
  當陣列長度為偶數時，先手可預先決定只取所有「偶數索引」或所有「奇數索引」的元素，並選擇兩組之中總和較大者。這保證先手至少能取得半數以上的總分，故必然不落敗，可直接回傳成立。

- **狀態可壓縮為一維**：
  雖然分差取決於區間的左右兩端，但透過固定右端、由內而外滾動左端的方式，可將二維狀態壓縮為一維陣列並就地更新。

依據以上特性，可以採用以下策略：

- **優先判斷偶數長度與單一元素的必勝情形**，直接回傳結果。
- **以一維陣列滾動記錄各右端點對應的最佳分差**，由短區間逐步擴展至完整區間。
- **最終檢查完整區間的分差是否非負**，以判定先手是否不落敗。

## 解題步驟

### Step 1：取得陣列長度

首先記錄陣列的長度，作為後續判斷與迴圈邊界的依據。

```typescript
const length = nums.length;
```

### Step 2：處理偶數長度的必勝特例

若陣列長度為偶數，先手可預先鎖定所有偶數索引或所有奇數索引，並取兩組總和較大者，因此必然不落敗，可直接回傳成立。

```typescript
// 偶數長度為無條件勝利：玩家 1 可預先決定取所有偶數索引或所有奇數索引，
// 並選擇兩組之中總和較大者。
if ((length & 1) === 0) {
  return true;
}
```

### Step 3：處理單一元素的特例

若陣列僅有一個元素，先手取走後即無剩餘元素可供對手取用，故必勝。

```typescript
// 單一元素會使玩家 2 無數可取。
if (length === 1) {
  return true;
}
```

### Step 4：初始化滾動的分差陣列

使用 `bestDifference[right]` 表示「當前以索引 `right` 作為右端點」的區間，當前玩家所能取得的最佳分差（自身減去對手），此陣列將被就地滾動更新。
初始時，先設定最右端單一元素的分差為其自身數值。

```typescript
// bestDifference[right] 表示目前以索引 "right" 作為結尾的區間，
// 當前玩家所能取得的最佳（當前玩家 - 對手）分差；此陣列將就地滾動更新。
const bestDifference = new Int32Array(length);
bestDifference[length - 1] = nums[length - 1];
```

### Step 5：由外而內滾動左端點並設定區間基底

從倒數第二個索引開始向左推進左端點 `left`；
對於每個新的左端點，先設定僅含單一元素的區間 `[left, left]` 之基底情形：此時該元素必然歸屬於當前取數者。

```typescript
for (let left = length - 2; left >= 0; left--) {
  const valueAtLeft = nums[left];

  // 區間 [left, left] 的基底情形：唯一的數字歸屬於取數者。
  bestDifference[left] = valueAtLeft;

  // ...
}
```

### Step 6：向右擴展區間並計算最佳分差

固定左端點後，逐步向右擴展右端點 `right`；
當前玩家可選擇取左端或取右端，兩種選擇皆等於「所取數值減去對手於剩餘區間的最佳分差」，取兩者較大者作為此區間的最佳分差並就地更新。

```typescript
for (let left = length - 2; left >= 0; left--) {
  // Step 5：取得左端數值並設定區間基底

  for (let right = left + 1; right < length; right++) {
    // 尚未更新的舊值仍描述 [left + 1, right]；前一個槽位在本輪
    // 已被刷新，描述的是 [left, right - 1]。
    const gapAfterTakingLeft = valueAtLeft - bestDifference[right];
    const gapAfterTakingRight = nums[right] - bestDifference[right - 1];
    bestDifference[right] = gapAfterTakingLeft > gapAfterTakingRight
      ? gapAfterTakingLeft
      : gapAfterTakingRight;
  }
}
```

### Step 7：回傳先手是否不落敗

滾動完成後，`bestDifference[length - 1]` 即代表先手在完整區間所能取得的最佳分差；只要其非負，即表示先手不落敗。

```typescript
return bestDifference[length - 1] >= 0;
```

## 時間複雜度

- 外層迴圈推進左端點需 $O(n)$，內層迴圈擴展右端點需 $O(n)$；
- 兩層巢狀迴圈共需 $O(n^2)$，其餘操作皆為常數時間。
- 總時間複雜度為 $O(n^2)$。

> $O(n^2)$

## 空間複雜度

- 僅使用一維滾動陣列 `bestDifference`，其長度與輸入相同；
- 除此之外僅使用固定數量的輔助變數。
- 總空間複雜度為 $O(n)$。

> $O(n)$
