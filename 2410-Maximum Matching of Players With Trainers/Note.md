# 2410. Maximum Matching of Players With Trainers

You are given a 0-indexed integer array `players`, where `players[i]` represents the ability of the $i^{th}$ player. 
You are also given a 0-indexed integer array `trainers`, where `trainers[j]` represents the training capacity of the $j^{th}$ trainer.

The $i^{th}$ player can match with the $j^{th}$ trainer if the player's ability is less than or equal to the trainer's training capacity. 
Additionally, the $i^{th}$ player can be matched with at most one trainer, and the $j^{th}$ trainer can be matched with at most one player.

Return the maximum number of matchings between `players` and `trainers` that satisfy these conditions.

**Constraints:**

- `1 <= players.length, trainers.length <= 10^5`
- `1 <= players[i], trainers[j] <= 10^9`

## 基礎思路

這道題目希望找到最多的玩家與訓練師之間的配對組合，其中每位玩家只能與一位訓練師匹配，且訓練師的訓練能力必須大於或等於玩家的能力。面對此類需要最多配對數的問題，經常可以採用 **貪婪策略（Greedy）** 來解決：

- 為了使匹配數目最大化，我們應該儘量將能力較弱的玩家匹配給能力剛好足夠的訓練師，避免浪費更強的訓練師資源。
- 這代表我們必須先將玩家和訓練師兩個陣列依照能力大小排序，之後再透過雙指標方式從最弱的一端逐步進行配對。

因此，我們可以採用以下步驟來解決這個問題：

1. **排序能力**：將玩家與訓練師能力進行排序。
2. **貪婪匹配**：逐步匹配最弱的玩家與最適合的訓練師。
3. **統計匹配數量**：記錄並返回所有成功的匹配數。

透過這個方式，能有效地保證最多數量的玩家可以成功匹配到適合的訓練師。

## 解題步驟

### Step 1：複製並排序玩家與訓練師能力陣列

首先，透過將原本的陣列複製到 Typed 陣列中，利用其原生方法進行快速排序：

```typescript
// 複製至 Typed 陣列以達到快速的原生數值排序效果
const playerAbilities = new Uint32Array(players);
const trainerCapacities = new Uint32Array(trainers);

// 對玩家與訓練師的能力分別進行遞增排序
playerAbilities.sort();
trainerCapacities.sort();
```

此步驟目的在於快速且高效地排序，以便接下來進行貪婪的匹配。

### Step 2：初始化匹配用的指標與計數器

設定雙指標與配對成功的計數器，以利於後續逐一進行匹配：

```typescript
// 玩家與訓練師的起始指標
let playerIndex = 0;
let trainerIndex = 0;

// 配對成功的總數量
let matchCount = 0;

// 玩家與訓練師的總數，避免重複計算長度
const totalPlayers = playerAbilities.length;
const totalTrainers = trainerCapacities.length;
```

### Step 3：透過貪婪方式逐步進行配對

使用雙指標分別從排序後的玩家與訓練師的能力陣列起點開始，比較並匹配：

```typescript
// 貪婪地匹配每個玩家與訓練師，直到其中一邊已全部遍歷
while (playerIndex < totalPlayers && trainerIndex < totalTrainers) {
  if (playerAbilities[playerIndex] <= trainerCapacities[trainerIndex]) {
    // 當玩家能力小於等於訓練師能力時，表示配對成功
    matchCount++;
    playerIndex++;
    trainerIndex++;
  } else {
    // 若當前訓練師不足以配對該玩家，嘗試下一個更強的訓練師
    trainerIndex++;
  }
}
```

這個方法能保證所有配對皆是最優且最多的，因為每次都盡可能讓能力較弱的玩家與最剛好的訓練師配對。

### Step 4：回傳最終匹配成功的數量

完成所有可能的匹配後，回傳匹配數量：

```typescript
return matchCount;
```

## 時間複雜度

- 排序兩個陣列分別需花費 $O(n\log n)$ 及 $O(m\log m)$ 時間，其中 $n$ 與 $m$ 分別代表玩家與訓練師數量。
- 貪婪匹配階段僅需一次遍歷，花費 $O(n + m)$ 時間。
- 總時間複雜度為 $O(n\log n + m\log m)$。

> $O(n\log n + m\log m)$

## 空間複雜度

- 額外使用了兩個 Typed 陣列來儲存排序後的能力值，各需要 $O(n)$ 與 $O(m)$ 的空間。
- 其他使用的輔助變數為常數級別。
- 總空間複雜度為 $O(n + m)$。

> $O(n + m)$
