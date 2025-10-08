# 2300. Successful Pairs of Spells and Potions

You are given two positive integer arrays `spells` and `potions`, of length `n` and `m` respectively, 
where `spells[i]` represents the strength of the $i^{th}$ spell and `potions[j]` represents the strength of the $j^{th}$ potion.

You are also given an integer `success`. 
A spell and potion pair is considered successful if the product of their strengths is at least `success`.

Return an integer array `pairs` of length `n` where `pairs[i]` is the number of potions that will form a successful pair with the $i^{th}$ spell.

**Constraints:**

- `n == spells.length`
- `m == potions.length`
- `1 <= n, m <= 10^5`
- `1 <= spells[i], potions[i] <= 10^5`
- `1 <= success <= 10^10`

## 基礎思路

本題要求計算每個法術（spell）能與多少藥水（potion）形成「成功配對」。
一組 `(spell, potion)` 被視為成功，若兩者強度乘積 $\geq$ `success`。

舉例來說，若 `success = 10`，`spell = 2` 時，只要藥水強度 $\geq 5$ 即為成功。
我們需要針對每個法術計算出滿足條件的藥水數量。

在思考解法時，需注意以下重點：

- 直接進行兩兩乘積比較的暴力法會達 $O(n \times m)$，在 $10^5$ 級別資料下明顯不可行。
- 每個法術的成功條件可化為「藥水強度需大於等於某閾值」的形式。
- 藥水數組可事先統計並加速查詢，避免重複運算。

為達成此目標，可以採用以下策略：

- **直方圖建模**：先統計每個藥水強度的出現次數。
- **後綴累積和（suffix sum）**：將直方圖轉為「強度 ≥ v 的藥水數量」，使查詢任一門檻值的藥水數量成為 O(1)。
- **逐法術查詢**：對每個 `spell`，計算其達成成功所需的最低藥水強度門檻，再利用後綴累積和直接查詢對應數量。
- **邊界優化**：若法術本身過強（`spell >= success`），則所有藥水都能成功；若門檻超過藥水最大強度，則無法成功。

此設計能將整體時間複雜度壓至線性級別，適用於最大輸入範圍。

## 解題步驟

### Step 1：建立藥水強度直方圖

使用 TypedArray（`Uint32Array`）統計每個藥水強度的出現次數，確保常數時間查詢且記憶體緊湊。

```typescript
// 設定最大藥水強度（依題目約束）
const maximumPotionValue = 100000;

// 建立藥水強度分佈直方圖
const potionCountAtOrAbove = new Uint32Array(maximumPotionValue + 1);
const totalPotionCount = potions.length;

// 統計每種強度的出現次數
for (let i = 0; i < totalPotionCount; i++) {
  const potionStrength = potions[i];
  potionCountAtOrAbove[potionStrength] += 1;
}
```

### Step 2：轉換為「後綴累積和」

將直方圖改為「強度 ≥ v 的藥水總數」，之後查詢可在 O(1) 取得結果。

```typescript
// 將統計轉為後綴累積和（suffix sum）
let cumulativeCount = 0;
for (let v = maximumPotionValue; v >= 1; v--) {
  cumulativeCount += potionCountAtOrAbove[v];
  potionCountAtOrAbove[v] = cumulativeCount;
}
```

### Step 3：準備常數與結果陣列

預先保存常用變數以減少重複存取成本，並配置結果陣列空間。

```typescript
// 預存常數以減少重複運算
const totalPotions = totalPotionCount;
const maxPotionValue = maximumPotionValue;
const requiredSuccess = success;
const successMinusOne = requiredSuccess - 1;

// 配置結果陣列
const totalSpells = spells.length;
const result = new Array<number>(totalSpells);
```

### Step 4：逐一計算每個法術的成功組合數

對每個法術計算「達成成功所需的最低藥水強度」，並從後綴陣列查詢。

```typescript
// 對每個法術計算成功配對的藥水數量
for (let i = 0; i < totalSpells; i++) {
  const spellStrength = spells[i];

  // 若法術強度已足以單獨達成 success，所有藥水皆符合
  if (spellStrength >= requiredSuccess) {
    result[i] = totalPotions;
    continue;
  }

  // 計算達成 success 所需的最小藥水強度（向上取整）
  const threshold = Math.floor((successMinusOne + spellStrength) / spellStrength);

  let successfulPotionCount: number;

  // 若門檻 ≤ 1，表示所有藥水皆足夠
  if (threshold <= 1) {
    successfulPotionCount = totalPotions;
  } else {
    // 若門檻超過最大藥水強度，表示無法成功
    if (threshold > maxPotionValue) {
      successfulPotionCount = 0;
    } else {
      // 直接查表取得「≥ threshold」的藥水數量
      successfulPotionCount = potionCountAtOrAbove[threshold];
    }
  }

  // 記錄此法術的成功配對數
  result[i] = successfulPotionCount;
}
```

### Step 5：回傳最終結果

所有法術皆已處理完畢，輸出結果陣列。

```typescript
// 回傳每個法術可成功的藥水數量
return result;
```

## 時間複雜度

- 建立藥水直方圖：$O(m)$
- 後綴累積和：$O(V)$（$V = 10^5$ 為強度上限）
- 查詢每個法術的結果：$O(n)$
- 總時間複雜度為 $O(n + m + V)$，其中 $V$ 為常數級，故可視為 $O(n + m)$。

> $O(n + m)$

## 空間複雜度

- 直方圖陣列：$O(V)$
- **結果陣列：$O(n)$**
- 其餘變數與暫存空間皆為常數級。
- 總空間複雜度為 $O(n + V)$。

> $O(n)$
