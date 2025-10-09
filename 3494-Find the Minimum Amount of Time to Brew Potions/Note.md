# 3494. Find the Minimum Amount of Time to Brew Potions

You are given two integer arrays, `skill` and `mana`, of length `n` and `m`, respectively.

In a laboratory, `n` wizards must brew `m` potions in order. 
Each potion has a mana capacity `mana[j]` and must pass through all the wizards sequentially to be brewed properly. 
The time taken by the $i^{th}$ wizard on the $j^{th}$ potion is `time_ij = skill[i] * mana[j]`.

Since the brewing process is delicate, a potion must be passed to the next wizard immediately after the current wizard completes their work. 
This means the timing must be synchronized so that each wizard begins working on a potion exactly when it arrives. 

Return the minimum amount of time required for the potions to be brewed properly.

**Constraints:**

- `n == skill.length`
- `m == mana.length`
- `1 <= n, m <= 5000`
- `1 <= mana[i], skill[i] <= 5000`

## 基礎思路

本題要我們計算所有藥水依序經過所有魔法師的**最短總釀製時間**。
每個魔法師 `i` 與藥水 `j` 的作業時間為：

$$
time_{i,j} = skill[i] \times mana[j]
$$

且所有藥水必須**按順序**釀製，且每瓶藥水在魔法師之間的交接必須**無縫接續**，也就是說：

- 魔法師不能等待藥水；
- 藥水也不能等待魔法師；
- 每個魔法師處理的時間與上一瓶藥水的進度是同步的。

這其實是一個**流水線動態規劃（Pipeline DP）** 問題：
每個魔法師是一個階段（Stage），每瓶藥水是一個任務（Job），所有任務需依序經過每個階段，求整體完成所需的最短時間。

在觀察規律後可以發現，藥水的 `mana[j]` 與魔法師的 `skill[i]` 共同構成一個**乘積矩陣**，題目要求的最小時間可視為：

- 依序處理每瓶藥水；
- 每一次藥水切換時，決定一個最有利的魔法師交接點；
- 同時累計前綴技能和差異量，並透過動態轉移式更新「目前最佳完成時間」。

### 解題策略

- **前綴累計**：用前綴和追蹤技能累積值，減少重複加總；
- **差量遞推**：連續兩瓶藥水間只需考慮 `mana[j-1] - mana[j]` 的差；
- **最佳化轉移**：對每個魔法師動態更新目前最佳轉移結果；
- **整體時間構成**：最終結果為「所有過渡最佳值」加上「最後一瓶藥水通過所有魔法師的時間」。

這樣的策略能在 $O(n \times m)$ 時間內完成計算，並只使用常數額外空間。

## 解題步驟

### Step 1：基本初始化與邊界處理

首先處理空輸入情況，若沒有魔法師或藥水，直接回傳 0。

```typescript
// 若魔法師或藥水數為 0，直接回傳 0
if (wizardCount === 0 || potionCount === 0) {
  return 0;
}
```

### Step 2：建立技能與法力的快速訪問結構

為了加速存取，將輸入陣列轉為 `Int32Array`，同時計算技能總和，方便最後加總。

```typescript
// 建立技能陣列與總技能和
const skillView = new Int32Array(wizardCount);
let totalSkillSum = 0;

for (let i = 0; i < wizardCount; i++) {
  const value = skill[i];
  skillView[i] = value;
  totalSkillSum += value;
}

// 建立法力陣列以提升快取效率
const manaView = new Int32Array(potionCount);
for (let j = 0; j < potionCount; j++) {
  manaView[j] = mana[j];
}
```

### Step 3：初始化累積最佳值

`accumulatedBest` 用於記錄前一瓶藥水處理完的最小時間結果。

```typescript
// 累積最佳時間初始化為 0
let accumulatedBest = 0;
```

### Step 4：逐瓶處理藥水的轉移

從第二瓶藥水開始，依序計算從上一瓶轉換到當前瓶的最佳轉移時間。

```typescript
// 從第二瓶藥水開始計算轉移
for (let j = 1; j < potionCount; j++) {
  const manaPrevious = manaView[j - 1];
  const manaCurrent = manaView[j];

  // 計算法力變化差值，用於內層公式
  const delta = manaPrevious - manaCurrent;

  // 當前轉移的最佳結果初始化為負無限大
  let bestForThisTransition = Number.NEGATIVE_INFINITY;

  // 技能前綴和初始化
  let runningPrefix = 0;

  // ...
}
```

### Step 5：內層遍歷所有魔法師以求最佳轉移

對於每位魔法師計算候選轉移時間，取最大值作為最佳過渡點。

```typescript
for (let j = 1; j < potionCount; j++) {
  // Step 4：逐瓶處理藥水的轉移
  
  // 內層遍歷所有魔法師，尋找最佳轉移時間
  for (let i = 0; i < wizardCount; i++) {
    // 以公式計算當前候選時間
    const candidate =
      accumulatedBest + runningPrefix * delta + manaPrevious * skillView[i];

    // 若比目前最佳更佳則更新
    if (candidate > bestForThisTransition) {
      bestForThisTransition = candidate;
    }

    // 更新技能前綴和
    runningPrefix += skillView[i];
  }

  // 更新整體累積最佳值
  accumulatedBest = bestForThisTransition;
}
```

### Step 6：加上最後一瓶藥水通過所有魔法師的時間

最後一瓶藥水需通過所有魔法師，因此再加上其完整通過時間。

```typescript
// 最後一瓶藥水經過所有魔法師的時間加總
return accumulatedBest + manaView[potionCount - 1] * totalSkillSum;
```

## 時間複雜度

- 外層迴圈遍歷所有藥水共 $m - 1$ 次；
- 內層迴圈遍歷所有魔法師共 $n$ 次；
- 兩者相乘為主要運算成本。
- 總時間複雜度為 $O(n \times m)$。

> $O(n \times m)$

## 空間複雜度

- 僅使用常數級變數與兩個 TypedArray 緩衝陣列；
- 不隨輸入規模增長而額外分配記憶體。
- 總空間複雜度為 $O(n + m)$。

> $O(n + m)$
