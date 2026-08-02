# 877. Stone Game

Alice and Bob play a game with piles of stones. 
There are an even number of piles arranged in a row, and each pile has a positive integer number of stones `piles[i]`.

The objective of the game is to end with the most stones. 
The total number of stones across all the piles is odd, so there are no ties.

Alice and Bob take turns, with Alice starting first. 
Each turn, a player takes the entire pile of stones either from the beginning or from the end of the row. 
This continues until there are no more piles left, at which point the person with the most stones wins.

Assuming Alice and Bob play optimally, return `true` if Alice wins the game, or `false` if Bob wins.

**Constraints:**

- `2 <= piles.length <= 500`
- `piles.length` is even.
- `1 <= piles[i] <= 500`
- `sum(piles[i])` is odd.

## 基礎思路

本題是經典的博弈論問題：Alice 與 Bob 輪流從一排石堆的頭或尾取走整堆石頭，雙方皆採取最佳策略，最終問 Alice 是否能勝出。

在思考解法時，可掌握以下核心觀察：

- **堆數為偶數且總和為奇數**：
  題目保證石堆數量必為偶數，且所有石頭的總數為奇數，因此不會出現平手的情況，勝負必定分明。

- **先手擁有結構性優勢**：
  由於堆數為偶數，可將所有石堆依索引位置劃分為「偶數位置」與「奇數位置」兩組。先手玩家能夠自由決定要完整取走其中一組。

- **奇偶配對策略**：
  將石堆兩兩相鄰視為一組，Alice 每次取頭或取尾時，都能控制自己拿到全部偶數索引或全部奇數索引的石堆。由於總和為奇數，這兩組的總和必然一多一少，Alice 只需選擇總和較大的那一組即可。

- **先手必勝為恆定結論**：
  基於上述配對策略，Alice 永遠能保證取得總和較大的一組石堆，因此在任何合法輸入下，先手玩家皆必勝。

依據以上特性，可以採用以下策略：

- **無須進行任何動態規劃或搜尋**，因為數學上已能證明先手必勝。
- **直接回傳先手勝利的結果即可**，時間與空間皆為常數等級。

此策略能以最簡潔的方式得出正確結論，安全可靠。

## 解題步驟

### Step 1：直接回傳先手必勝的結果

由於奇偶配對策略保證先手玩家在所有合法輸入下皆能獲勝，因此無須任何運算，直接回傳 `true` 即可。

```typescript
// 奇偶配對策略保證先手玩家在所有合法輸入下皆必勝
return true;
```

## 時間複雜度

- 僅執行一次常數回傳操作；
- 不涉及任何迴圈或遞迴運算。
- 總時間複雜度為 $O(1)$。

> $O(1)$

## 空間複雜度

- 未使用任何額外的變數或資料結構；
- 無任何遞迴堆疊或動態配置空間。
- 總空間複雜度為 $O(1)$。

> $O(1)$
