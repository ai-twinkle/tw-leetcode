# 1140. Stone Game II

Alice and Bob continue their games with `piles` of stones. 
There are a number of `piles` arranged in a row, and each pile has a positive integer number of stones `piles[i]`. 
The objective of the game is to end with the most stones.

Alice and Bob take turns, with Alice starting first.

On each player's turn, that player can take all the stones in the first `X` remaining piles, where `1 <= X <= 2M`. 
Then, we set `M = max(M, X)`. 
Initially, `M = 1`.

The game continues until all the stones have been taken.

Assuming Alice and Bob play optimally, return the maximum number of stones Alice can get.

**Constraints:**

- `1 <= piles.length <= 100`
- `1 <= piles[i] <= 10^4`

## 基礎思路

本題是一個雙人輪流取石的博弈問題，兩位玩家皆採取最佳策略，目標是各自取得最多石頭。關鍵在於「當前玩家的最佳收益」會受到「剩餘堆數」與「可取上限 `M`」兩個因素共同影響，且雙方在同一局勢下的最佳決策具有對稱性。

在思考解法時，可掌握以下核心觀察：

- **狀態可由「起始位置」與「當前 M 值」唯一決定**：
  當輪到某位玩家時，其面對的局勢只取決於還剩哪些堆，以及此時允許取用的上限，與先前的取法無關。

- **零和特性使博弈可化為極小化對手收益**：
  由於剩餘石頭總量固定，當前玩家所得等於「剩餘總量」減去「對手在後續局勢的最佳所得」，因此最大化自身收益等價於最小化對手收益。

- **後綴總和加速區間查詢**：
  由於每次都是從某位置一路取到結尾，因此「從某位置起剩餘的石頭總量」可透過後綴總和以常數時間取得。

- **M 值存在天然上限**：
  當可取範圍已能一次涵蓋所有剩餘堆時，局勢便不再變化，因此 `M` 無須無限增長，可設一個上限以壓縮狀態空間。

依據以上特性，可以採用以下策略：

- **以逆序動態規劃自後往前填表**，因為後續局勢的結果是當前決策的依據。
- **對每個局勢枚舉可取堆數**，並依取法是否超過當前 `M` 分別更新下一步的 `M`，藉此找出使對手收益最小的選擇。
- **最終從起始位置、M 為 1 的狀態讀取答案**，即為先手玩家的最佳所得。

此策略透過狀態壓縮與零和轉換，能在合理複雜度內求得最佳解。

## 解題步驟

### Step 1：快速處理僅有單一堆的情況

若只有一堆石頭，先手玩家可於第一步直接全部取走，無須進入後續計算。

```typescript
const pileCount = piles.length;

// 若只有一堆，先手玩家在第一步即可全部取走
if (pileCount === 1) {
  return piles[0];
}
```

### Step 2：建立後綴總和以加速剩餘總量查詢

自後往前累加，使「從某索引起剩餘的石頭總量」能以常數時間取得。

```typescript
// 後綴總和讓「從索引 i 起剩餘的石頭總量」查詢降為 O(1)
const suffixSum = new Int32Array(pileCount + 1);
for (let index = pileCount - 1; index >= 0; index--) {
  suffixSum[index] = suffixSum[index + 1] + piles[index];
}
```

### Step 3：設定 M 的上限並配置動態規劃表

當 `2 * M` 已能涵蓋全部剩餘時局勢不再改變，故將 `M` 的上限設限；並以一維陣列模擬二維狀態表，儲存「即將行動的玩家」在各局勢下的最佳收益。

```typescript
// 一旦 2 * M 能涵蓋整個剩餘部分，局勢便不再變化，因此在此為 M 設限
const maxMultiplier = (pileCount >> 1) + 1;
const rowStride = maxMultiplier + 1;

// bestGain[index * rowStride + multiplier] = 即將行動的玩家之最佳收益
const bestGain = new Int32Array((pileCount + 1) * rowStride);
```

### Step 4：逆序遍歷每個起始位置並取得該局勢的剩餘總量

自最後一個位置往前處理每個起始索引，並先取得該索引對應的剩餘總量與列偏移量，為後續枚舉各 `M` 值做準備。

```typescript
for (let index = pileCount - 1; index >= 0; index--) {
  const remainingTotal = suffixSum[index];
  const rowOffset = index * rowStride;

  // ...
}
```

### Step 5：枚舉當前 M 值，並優先處理可一次取完的情況

對每個 `M` 值計算其可及範圍；若此範圍已能涵蓋所有剩餘堆，則當前玩家可直接取走全部剩餘石頭。

```typescript
for (let index = pileCount - 1; index >= 0; index--) {
  // Step 4：取得剩餘總量與列偏移量

  for (let multiplier = maxMultiplier; multiplier >= 1; multiplier--) {
    const reach = multiplier << 1;

    // 整個剩餘部分能於一次合法取法中取盡：直接全部取走
    if (index + reach >= pileCount) {
      bestGain[rowOffset + multiplier] = remainingTotal;
      continue;
    }

    // ...
  }
}
```

### Step 6：枚舉不超過 M 的取法，M 維持不變

初始化「對手最佳收益」為極大值；當取用堆數不超過當前 `M` 時，`M` 不會改變，因此對手的狀態欄位固定，逐一取用並記錄使對手收益最小者。

```typescript
for (let multiplier = maxMultiplier; multiplier >= 1; multiplier--) {
  // Step 5：計算可及範圍並處理可一次取完的情況

  // 當前玩家所得為總量減去對手後續所得，故需最小化對手收益
  let opponentBest = 0x7fffffff;

  // 取用至多 M 堆時 M 不變，因此欄位索引固定
  for (let taken = 1; taken <= multiplier; taken++) {
    const opponentGain = bestGain[(index + taken) * rowStride + multiplier];
    if (opponentGain < opponentBest) {
      opponentBest = opponentGain;
    }
  }

  // ...
}
```

### Step 7：枚舉超過 M 的取法，並提升 M 至對應值

當取用堆數超過當前 `M` 時，`M` 需提升為所取堆數（並受上限箝制），據此查詢下一步局勢，持續更新使對手收益最小者。

```typescript
for (let multiplier = maxMultiplier; multiplier >= 1; multiplier--) {
  // Step 5：計算可及範圍並處理可一次取完的情況

  // Step 6：枚舉不超過 M 的取法

  // 取用超過 M 時，M 提升為 X，並箝制於所有狀態趨於一致的上限
  for (let taken = multiplier + 1; taken <= reach; taken++) {
    const nextMultiplier = taken > maxMultiplier ? maxMultiplier : taken;
    const opponentGain = bestGain[(index + taken) * rowStride + nextMultiplier];
    if (opponentGain < opponentBest) {
      opponentBest = opponentGain;
    }
  }

  // ...
}
```

### Step 8：以零和關係回填當前局勢的最佳收益

在確定對手的最小可能收益後，當前玩家的最佳收益即為「剩餘總量減去對手最佳收益」，回填至狀態表。

```typescript
for (let multiplier = maxMultiplier; multiplier >= 1; multiplier--) {
  // Step 5：計算可及範圍並處理可一次取完的情況

  // Step 6：枚舉不超過 M 的取法

  // Step 7：枚舉超過 M 的取法

  bestGain[rowOffset + multiplier] = remainingTotal - opponentBest;
}
```

### Step 9：回傳先手玩家於初始局勢的最佳所得

先手玩家自索引 0、`M` 為 1 的狀態出發，直接讀取該狀態的最佳收益作為答案。

```typescript
// Alice 從索引 0、M = 1 開始
return bestGain[1];
```

## 時間複雜度

- 外層遍歷所有起始位置，共 $n$ 種；
- 中層枚舉 `M` 值，上限與 $n$ 同階；
- 內層枚舉取用堆數，範圍亦與 $n$ 同階；
- 三層嵌套使總運算量達 $n^3$ 等級。
- 總時間複雜度為 $O(n^3)$。

> $O(n^3)$

## 空間複雜度

- 後綴總和陣列使用 $O(n)$ 空間；
- 動態規劃表為位置與 `M` 值的乘積，達 $O(n^2)$ 空間；
- 兩者相加以較高者為主。
- 總空間複雜度為 $O(n^2)$。

> $O(n^2)$
