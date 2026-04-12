# 1320. Minimum Distance to Type a Word Using Two Fingers

You have a keyboard layout as shown above in the X-Y plane, 
where each English uppercase letter is located at some coordinate.

- For example, the letter `'A'` is located at coordinate `(0, 0)`, the letter `'B'` is located at coordinate `(0, 1)`, 
  the letter `'P'` is located at coordinate `(2, 3)` and the letter `'Z'` is located at coordinate `(4, 1)`.

Given the string `word`, return the minimum total distance to type such string using only two fingers.

The distance between coordinates `(x_1, y_1)` and `(x_2, y_2)` is `|x_1 - x_2| + |y_1 - y_2|`.

Note that the initial positions of your two fingers are considered free so do not count towards your total distance, 
also your two fingers do not have to start at the first letter or the first two letters.

**Constraints:**

- `2 <= word.length <= 300`
- `word` consists of uppercase English letters.

## 基礎思路

本題要求使用兩根手指在鍵盤上輸入一個字串，目標是讓移動的總曼哈頓距離最小化。每個字母對應鍵盤上的固定座標，兩根手指的起始位置不計入距離，可以從任意位置開始。

在思考解法時，可掌握以下核心觀察：

- **每一步只有一根手指在移動**：
  輸入每個字母時，必定是其中一根手指從前一個位置移動過來；另一根手指靜止於某個字母位置。因此每一步的狀態可以用「靜止手指的位置」來描述。

- **DP 狀態的精簡化**：
  在輸入第 `i` 個字母時，其中一根手指必定已停在第 `i - 1` 個字母上（剛打完），因此狀態中只需記錄「另一根手指的位置」，即可完整還原整體狀態。

- **每一步僅有兩種選擇**：
  面對當前字母，可選擇「由上一個字母的手指繼續移動」或「換另一根手指來打這個字母」，兩者帶來不同的代價與手指分配。

- **字母對之間的距離可預先計算**：
  所有 26 × 26 的字母對距離僅需計算一次，後續所有查詢皆為 O(1)，大幅降低重複計算的開銷。

依據以上特性，可以採用以下策略：

- **以滾動一維 DP 陣列表示「另一根手指的位置」**，在每一步更新時僅保留前一輪與當前輪的結果，節省空間。
- **預先計算所有字母對的曼哈頓距離**，避免在 DP 轉移中重複運算。
- **對每一步的「換手」選項進行跨所有 k 的最小值預計算**，避免在主迴圈內嵌套掃描，提升效能。
- **最終掃描一維陣列取最小值**，得到最優解。

此策略將時間複雜度壓縮至 $O(n \cdot |\Sigma|)$，在題目約束下高效可行。

## 解題步驟

### Step 1：預先計算所有字母對之間的曼哈頓距離

鍵盤上每個字母的列與行位置由其編號決定（每列 6 個字母）。
對所有字母對 `(i, j)` 預先計算距離並存入一維查詢表，後續所有距離查詢皆為 O(1)。

```typescript
// 預先計算所有 26 個字母兩兩之間的曼哈頓距離
const LETTER_DISTANCE = new Int32Array(26 * 26);
for (let i = 0; i < 26; i++) {
  const rowI = (i / 6) | 0;
  const colI = i % 6;
  for (let j = i + 1; j < 26; j++) {
    const distance = Math.abs(rowI - ((j / 6) | 0)) + Math.abs(colI - j % 6);
    LETTER_DISTANCE[i * 26 + j] = distance;
    LETTER_DISTANCE[j * 26 + i] = distance;
  }
}
```

### Step 2：定義哨兵值並初始化滾動 DP 陣列

使用一個足夠大的哨兵值表示「尚未達到」的狀態。
DP 狀態定義為：輸入到第 `i` 個字母後，另一根手指停在字母 `j` 時的最小總距離。
起始狀態代表尚未移動任何手指，距離均為 0，因此 `previousRow` 全填 0。

```typescript
const LARGE_VALUE = 0x3f3f3f3f;

const length = word.length;

// 以兩個滾動的 Int32Array 取代巢狀陣列作為 DP 表
let previousRow = new Int32Array(26).fill(0);
let currentRow = new Int32Array(26);
```

### Step 3：計算每一步的「同手指繼續移動」代價與「換手」最優代價

對於第 `i` 個字母，首先確定目前要打的字母與前一個字母，計算同一手指連續移動的代價。
接著對所有可能的「另一根手指位置 k」掃描，預先取得換手時的全域最小代價，避免在後續迴圈中重複掃描。

```typescript
for (let i = 1; i < length; i++) {
  const currentLetter = word.charCodeAt(i) - 65;
  const previousLetter = word.charCodeAt(i - 1) - 65;
  // 「主動手指」從上一個字母移到當前字母的代價
  const sameFingerCost = LETTER_DISTANCE[previousLetter * 26 + currentLetter];

  // 預先計算所有 k 中，dp[i-1][k] + dist(k, cur) 的最小值
  // 僅在 j === previousLetter 時使用
  const previousLetterOffset = currentLetter * 26;
  let bestSwitchCost = LARGE_VALUE;
  for (let k = 0; k < 26; k++) {
    const switchCost = previousRow[k] + LETTER_DISTANCE[k * 26 + currentLetter];
    if (switchCost < bestSwitchCost) {
      bestSwitchCost = switchCost;
    }
  }

  // ...
}
```

### Step 4：以兩種選擇更新當前輪 DP，並交換滾動緩衝區

對每個「另一根手指位置 j」，預設為同手指繼續移動的代價。
唯有當 `j === previousLetter` 時，才需考慮換手選項，取兩者中較小的值。
完成後交換兩個滾動陣列以節省空間。

```typescript
for (let i = 1; i < length; i++) {
  // Step 3：計算 sameFingerCost 與 bestSwitchCost

  for (let j = 0; j < 26; j++) {
    // 選項一：由停在 previousLetter 的手指繼續移動到 currentLetter
    currentRow[j] = previousRow[j] + sameFingerCost;
  }

  // 選項二：當另一根手指停在 previousLetter 時，改由它來打 currentLetter
  if (bestSwitchCost < currentRow[previousLetter]) {
    currentRow[previousLetter] = bestSwitchCost;
  }

  // 交換滾動緩衝區
  const temp = previousRow;
  previousRow = currentRow;
  currentRow = temp;
}
```

### Step 5：掃描最終 DP 陣列，取得全域最小距離

所有字母輸入完畢後，`previousRow[j]` 代表「另一根手指停在字母 j」時的最小總距離。
掃描所有 26 個位置，取最小值即為答案。

```typescript
// 掃描所有「另一根手指位置」，找出最小總距離
let result = LARGE_VALUE;
for (let j = 0; j < 26; j++) {
  if (previousRow[j] < result) {
    result = previousRow[j];
  }
}
return result;
```

## 時間複雜度

- 預計算所有字母對距離需 $O(|\Sigma|^2)$，其中 $|\Sigma| = 26$ 為常數；
- 主迴圈對字串中每個字母執行一次，共 $n$ 次，每次掃描 26 個「另一根手指位置」；
- 換手代價的預計算同樣掃描 26 個位置，屬同一輪次；
- 每輪複雜度為 $O(|\Sigma|)$，因 $|\Sigma| = 26$ 為常數，故每輪視為 $O(1)$；
- 總時間複雜度為 $O(n)$。

> $O(n)$

## 空間複雜度

- 預計算距離表佔用 $O(|\Sigma|^2)$ 的固定空間；
- 滾動 DP 陣列僅保留前後兩輪，各長度 26，佔用 $O(|\Sigma|)$ 的固定空間；
- 所有輔助空間大小均與輸入長度無關，不論輸入長度如何，額外空間皆為常數；
- 總空間複雜度為 $O(1)$。

> $O(1)$
