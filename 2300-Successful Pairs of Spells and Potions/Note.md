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

本題要求我們計算每個法術（`spell`）能與多少藥水（`potion`）組成成功配對。當兩者力量乘積 ≥ `success` 時，該配對視為成功。

在思考解法時，需要注意以下幾點：

- **直接暴力法不可行**：若對每個法術逐一檢查所有藥水，時間複雜度為 $O(n \times m)$，在 $10^5$ 級別輸入下會超時。
- **成功條件轉換**：對於固定的 `spell` 值 $s$，成功條件為
  
  $$
  s \times p \ge success \Rightarrow p \ge \frac{success}{s}
  $$

  也就是說，我們只需知道有多少藥水強度大於等於該「臨界值」。
- **快速查詢數量**：若能預先計算出「藥水強度 ≥ 某值」的數量，就能在 $O(1)$ 時間內取得答案。

因此，我們採用以下策略：

- **建立藥水強度統計表**：使用長度為最大藥水值（$10^5$）的陣列，紀錄每個強度出現次數。
- **轉換為後綴和表**：從高強度往下累加，使每個位置代表「強度 ≥ v 的藥水數」。
- **逐一處理法術**：對每個法術計算其所需的最小藥水強度（以向上取整的方式求出），再利用後綴和表 $O(1)$ 查詢。
- **快速邊界處理**：若臨界值 ≤ 1 則全通過；若超過最大值則全失敗；否則使用查表結果。

此策略避免排序與二分搜尋，以**固定長度陣列 + 後綴和查表**達成常數查詢效率，整體效能優於傳統二分法。

## 解題步驟

### Step 1：建立藥水統計表

使用 TypedArray（`Uint32Array`）紀錄每個藥水強度的出現次數。

```typescript
// 建立固定長度的藥水強度計數表（0~100000）
const maximumPotionValue = 100000;
const greaterOrEqual = new Uint32Array(maximumPotionValue + 1);
const potionsLength = potions.length;

// 統計每個藥水強度出現次數
for (let i = 0; i < potionsLength; i++) {
  const potionStrength = potions[i];
  greaterOrEqual[potionStrength] += 1;
}
```

### Step 2：構建「後綴和」統計表

從高強度往下累加，使每個索引代表「強度 ≥ v」的藥水數量。

```typescript
// 建立後綴和表：ge[v] 代表藥水強度 ≥ v 的數量
let cumulativeCount = 0;
for (let v = maximumPotionValue; v >= 1; v--) {
  cumulativeCount += greaterOrEqual[v];
  greaterOrEqual[v] = cumulativeCount;
}
```

### Step 3：初始化變數並預先計算常數

為加速查表與計算，先將常用變數存入本地變數。

```typescript
// 快速存取變數以減少屬性讀取開銷
const totalPotions = potionsLength;
const ge = greaterOrEqual;
const maxV = maximumPotionValue;
const requiredSuccess = success;
const successMinusOne = requiredSuccess - 1;

// 預先配置結果陣列以減少動態分配
const spellsLength = spells.length;
const result = new Array<number>(spellsLength);
```

### Step 4：逐一處理每個法術

對每個法術計算所需的臨界藥水強度，並透過查表取得結果。

```typescript
// 逐一處理每個法術，計算可成功的藥水數量
for (let i = 0; i < spellsLength; i++) {
  const spellStrength = spells[i];

  // 若法術本身強度已 ≥ success，則所有藥水皆成功
  if (spellStrength >= requiredSuccess) {
    result[i] = totalPotions;
    continue;
  }

  // 計算臨界值：需達成 success 的最小藥水強度（向上取整）
  const threshold = Math.floor((successMinusOne + spellStrength) / spellStrength);

  let countSuccessful: number;

  // 若臨界值 ≤ 1，代表所有藥水皆合格
  if (threshold <= 1) {
    countSuccessful = totalPotions;
  } else {
    // 若臨界值超出最大範圍，代表無法配對成功
    if (threshold > maxV) {
      countSuccessful = 0;
    } else {
      // 使用後綴和表 O(1) 查詢
      countSuccessful = ge[threshold];
    }
  }

  // 將結果寫入對應法術索引
  result[i] = countSuccessful;
}
```

### Step 5：回傳結果

將所有法術對應的成功組合數量返回。

```typescript
// 回傳結果陣列
return result;
```

## 時間複雜度

- 建立統計表需遍歷所有藥水：$O(m)$；
- 構建後綴和表需遍歷最大強度範圍：$O(V)$（$V = 10^5$）；
- 處理所有法術：$O(n)$（每次查表為常數時間）。
- 總時間複雜度為 $O(n + m + V)$，由於 $V = 10^5$ 為常數上限，可視為線性時間。

> $O(n + m)$

## 空間複雜度

- 後綴和表 `greaterOrEqual` 需 $O(V)$ 空間；
- 結果陣列需 $O(n)$；
- 其餘輔助變數為常數級別。
- 總空間複雜度為 $O(n + V)$，其中 $V = 10^5$ 為固定上限。

> $O(n)$
