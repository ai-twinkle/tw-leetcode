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

本題要我們計算所有藥水經過所有魔法師依序釀製後，所需的**最短總時間**。
釀製過程中，每瓶藥水都需依序通過所有魔法師，第 `i` 位魔法師在第 `j` 瓶藥水上花費的時間為：

$$
time_{ij} = skill[i] \times mana[j]
$$

因為每瓶藥水必須在上一位魔法師完成後立即交給下一位魔法師，整個系統的時間同步必須精確控制。
換言之，每個魔法師不能提前開始、也不能延遲接手藥水，整體流程必須在**前後藥水與前後魔法師的同步**下達成最小總時間。

在設計解法時，需考慮以下要點：

- **整體結構為連續依賴鏈**：每瓶藥水需依序經過所有魔法師；
- **相鄰藥水的 mana 變化**：決定了時間的遞增或遞減趨勢；
- **魔法師 skill 的累積與極值**：不同位置的魔法師能力不同，會影響每階段的時間平衡；
- **效能限制**：`n, m ≤ 5000`，需在 $O(n + m)$ 或 $O(n \times \log n)$ 範圍內求解，不能暴力模擬每一瓶藥水與每位魔法師的乘積。

為了高效求解，我們可採以下策略：

- **前綴技能累積（prefix sum）**：用前綴和快速獲取前段魔法師的總技能量；
- **單調棧優化**：
    - 當藥水 mana 遞增時，僅需考慮魔法師技能的**前綴遞增序列**；
    - 當藥水 mana 遞減時，則考慮**後綴遞增序列**；
- **轉換值最大化**：每次兩瓶相鄰藥水的 mana 差異會導致不同的時間轉換值，需找出能令總和最小的最佳轉換位置；
- **累積最終時間**：將所有轉換值疊加，再加上最後一瓶藥水通過所有魔法師的總貢獻。

透過此結構化處理，我們能在 $O(n + m)$ 時間內計算最小釀製時間，避免重複計算與暴力枚舉。

## 解題步驟

### Step 1：計算魔法師技能的前綴和

建立 `prefixSkill` 陣列，使 `prefixSkill[k]` 表示前 `k` 位魔法師的技能總和，後續可快速取出區段加總。

```typescript
// 建立前綴和陣列：prefixSkill[k] = skill[0] + ... + skill[k-1]
const prefixSkill = new Uint32Array(wizardCount + 1);
for (let wizardIndex = 0; wizardIndex < wizardCount; wizardIndex++) {
  prefixSkill[wizardIndex + 1] = prefixSkill[wizardIndex] + (wizardSkill[wizardIndex] >>> 0);
}
```

### Step 2：構建前綴遞增棧（Prefix Increasing Stack）

從左到右掃描魔法師技能，僅保留技能值嚴格遞增的索引。
此結構用於處理 mana 遞增時的最佳轉換點搜尋。

```typescript
// 建立前綴遞增棧：當 wizard skill 遞增時記錄新的峰值位置
const prefixIncreasingStack = new Int32Array(wizardCount);
let prefixStackSize = 0;
prefixIncreasingStack[prefixStackSize++] = 0;

for (let wizardIndex = 1; wizardIndex < wizardCount; wizardIndex++) {
  if (wizardSkill[wizardIndex] > wizardSkill[prefixIncreasingStack[prefixStackSize - 1]]) {
    prefixIncreasingStack[prefixStackSize++] = wizardIndex;
  }
}
```

### Step 3：構建後綴遞增棧（Suffix Increasing Stack）

從右到左掃描魔法師技能，僅保留從右側觀察時嚴格遞增的索引，用於 mana 遞減或不變時的最佳轉換搜尋。

```typescript
// 建立後綴遞增棧：從右往左記錄技能新峰值的位置
const suffixIncreasingStack = new Int32Array(wizardCount);
let suffixStackSize = 0;
suffixIncreasingStack[suffixStackSize++] = wizardCount - 1;

for (let wizardIndex = wizardCount - 2; wizardIndex >= 0; wizardIndex--) {
  if (wizardSkill[wizardIndex] > wizardSkill[suffixIncreasingStack[suffixStackSize - 1]]) {
    suffixIncreasingStack[suffixStackSize++] = wizardIndex;
  }
}
```

### Step 4：累積相鄰藥水的轉換時間

依序處理每對相鄰藥水，根據 mana 遞增或遞減選擇對應棧，
計算各魔法師的潛在轉換值並取最大者，加入總時間。

```typescript
// 初始化總釀製時間
let totalBrewingTime = 0;

// 依序處理每一對相鄰藥水
for (let potionIndex = 1; potionIndex < potionCount; potionIndex++) {
  const previousMana = potionMana[potionIndex - 1];
  const currentMana = potionMana[potionIndex];
  const isManaIncreasing = previousMana < currentMana;
  const manaDifference = previousMana - currentMana;

  let maximumTransitionValue = -Infinity;

  if (isManaIncreasing) {
    // 若 mana 遞增，使用前綴遞增棧搜尋最佳轉換值
    for (let stackIndex = 0; stackIndex < prefixStackSize; stackIndex++) {
      const wizardIndex = prefixIncreasingStack[stackIndex];
      const transitionValue =
        manaDifference * prefixSkill[wizardIndex] + previousMana * wizardSkill[wizardIndex];
      if (transitionValue > maximumTransitionValue) {
        maximumTransitionValue = transitionValue;
      }
    }
  } else {
    // 若 mana 遞減或相等，使用後綴遞增棧
    for (let stackIndex = 0; stackIndex < suffixStackSize; stackIndex++) {
      const wizardIndex = suffixIncreasingStack[stackIndex];
      const transitionValue =
        manaDifference * prefixSkill[wizardIndex] + previousMana * wizardSkill[wizardIndex];
      if (transitionValue > maximumTransitionValue) {
        maximumTransitionValue = transitionValue;
      }
    }
  }

  // 將該階段的最大轉換值加入總時間
  totalBrewingTime += maximumTransitionValue;
}
```

### Step 5：加上最後一瓶藥水的完整釀製時間

最後一瓶藥水須經過所有魔法師，加入其最終貢獻值。

```typescript
// 最後一瓶藥水經過所有魔法師的總時間
totalBrewingTime += potionMana[potionCount - 1] * prefixSkill[wizardCount];

// 回傳最小總釀製時間
return totalBrewingTime;
```

## 時間複雜度

- 建立前綴和與兩個單調棧各需 $O(n)$。
- 對每對相鄰藥水計算轉換值需 $O(m \times s)$，其中 $s$ 為棧中元素數量（不超過 $n$ 的遞增節點）。
- 實務上棧長遠小於 $n$，總體近似線性。
- 總時間複雜度為 $O(n + m \times s)$。

> $O(n + m \times s)$

## 空間複雜度

- 前綴和陣列：$O(n)$
- 兩個單調棧：$O(n)$
- 常數額外變數：$O(1)$
- 總空間複雜度為 $O(n)$。

> $O(n)$
