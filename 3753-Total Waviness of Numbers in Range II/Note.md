# 3753. Total Waviness of Numbers in Range II

You are given two integers `num1` and `num2` representing an inclusive range `[num1, num2]`.

The waviness of a number is defined as the total count of its peaks and valleys:

- A digit is a peak if it is strictly greater than both of its immediate neighbors.
- A digit is a valley if it is strictly less than both of its immediate neighbors.
- The first and last digits of a number cannot be peaks or valleys.
- Any number with fewer than 3 digits has a waviness of 0.

Return the total sum of waviness for all numbers in the range `[num1, num2]`.

**Constraints:**

- `1 <= num1 <= num2 <= 10^15`

## 基礎思路

本題要求計算指定區間 `[num1, num2]` 內所有整數的「波動值」總和。由於區間規模高達 $10^{15}$，無法對每個整數逐一檢查，必須改採與位數規模成線性的演算法。

在思考解法時，可掌握以下核心觀察：

- **波動性僅取決於局部三位數**：
  一個數字是否為峰或谷，僅由它與其相鄰兩位的大小關係決定，因此「最近兩個已出現過的數字」便足以承載延續推進所需的全部資訊。

- **狀態空間極小且可整數編碼**：
  將「是否已開始放入有效數字（避開前導零）」、「上一個數字」、「上上個數字」三者合成單一整數索引後，總狀態數有限且固定，能直接以 typed array 進行常數時間的查表。

- **區間和可由前綴和相減求得**：
  令 $f(x)$ 為 $[0, x]$ 範圍內所有整數的波動值總和，則答案恰好等於 $f(\text{num2}) - f(\text{num1} - 1)$，將雙端問題簡化為單向上界問題。

- **以「緊跟（tight）」與「鬆綁（loose）」兩種模式分離處理上界**：
  以單一確定性路徑追蹤「前綴仍恰等於上界」的情況；其餘已不再受上界限制的所有路徑則匯入鬆綁集合中以聚合計數，避免在每個狀態額外掛上 tight/loose 標籤而產生額外維度。

依據以上特性，可採用如下策略：

- **預先建立轉移表**：列舉所有 (狀態, 數字) 配對，預先寫入「下一個狀態」與「該轉移是否使中間位成為峰/谷」兩張查找表，使主流程中僅需常數時間查表。
- **以位數為單位推進數位 DP**：對於上界由最高位起的每一位數字，將所有鬆綁狀態於 0-9 的十種選擇上完整展開；對於緊跟路徑則拆分為「小於限制的數字分流為鬆綁」與「等於限制的數字延續緊跟」兩部分。
- **採用雙緩衝避免重複配置記憶體**：使用兩組固定大小的 typed array 交替當作來源與目標，避免每輪重新分配。
- **最終彙總**：將所有鬆綁狀態的累積波動值與緊跟路徑的貢獻相加得到 $f(x)$，再以前綴和差求出區間總和。

此策略將指數規模的列舉壓縮為與位數呈線性、每位常數時間的演算法，能在最大規模下仍穩定運行。

## 解題步驟

### Step 1：預先宣告狀態空間大小與兩張查找表

定義狀態總數為 $2 \times 11 \times 11 = 242$（對應「是否已起始」、「上一個數字」、「上上個數字」三個欄位，後兩者各允許 10 種數字加上一個「尚未填入」的佔位值）。
同時配置兩張定型陣列：一張記錄每個 `(state, digit)` 對應的下一狀態，一張記錄該轉移是否新增一個峰/谷。

```typescript
// 模組層級預先計算的查找表，於載入時建構一次

/** 將 (started, prev, prevPrev) 編碼為單一索引後的不同狀態總數。 */
const STATE_SIZE = 242;

/** 將 (state * 10 + digit) 映射至附加該數字後的下一個狀態索引。 */
const NEXT_STATE_TABLE = new Int16Array(STATE_SIZE * 10);

/** 將 (state * 10 + digit) 映射為 1（若該轉移使前一個數字成為峰/谷），否則為 0。 */
const WAVINESS_TABLE = new Int8Array(STATE_SIZE * 10);
```

### Step 2：為每個 (state, digit) 配對解碼欄位並推導下一狀態

對於每一個狀態索引，先反向拆解出 `started`、上一位、上上位三個欄位；
接著對每一個候選下個數字，依目前累積的有效數字數量分成三種情況處理：

- 若尚未起始（仍在前導零區），只在遇到非零數字時將其視為第一個有效數字；
- 若僅有一個有效數字，直接把新數字推入而不產生峰/谷；
- 若已具備三個連續數字，便判定中間那個是否為峰或谷，並將窗口向後滑動。

```typescript
// 為所有可能的 (state, digit) 配對建立轉移表
for (let state = 0; state < STATE_SIZE; state++) {
  const started = state >= 121 ? 1 : 0;
  const stateRemainder = state - started * 121;
  const previousDigit = (stateRemainder / 11) | 0;
  const previousPreviousDigit = stateRemainder - previousDigit * 11;

  for (let digit = 0; digit < 10; digit++) {
    let newStarted = started;
    let newPreviousDigit = previousDigit;
    let newPreviousPreviousDigit = previousPreviousDigit;
    let wavinessIncrement = 0;

    if (started === 0) {
      // 仍處於前導零區；只有遇到非零數字時才正式起始
      if (digit !== 0) {
        newStarted = 1;
        newPreviousDigit = digit;
        newPreviousPreviousDigit = 10;
      }
    } else if (previousPreviousDigit === 10) {
      // 目前只放入了一個實際數字；直接將新數字推入
      newPreviousPreviousDigit = previousDigit;
      newPreviousDigit = digit;
    } else {
      // 已累積三個連續數字；判定中間那個是否為峰/谷
      const isPeak = previousDigit > previousPreviousDigit && previousDigit > digit;
      const isValley = previousDigit < previousPreviousDigit && previousDigit < digit;
      if (isPeak || isValley) {
        wavinessIncrement = 1;
      }
      newPreviousPreviousDigit = previousDigit;
      newPreviousDigit = digit;
    }

    // ...
  }
}
```

### Step 3：將計算出的下一狀態與峰谷增量寫回查找表

在推導完三個欄位的更新後，將其重新編碼為單一整數索引，連同峰/谷增量一併寫入兩張查找表中，使主流程在執行時可直接以 `state * 10 + digit` 進行 $O(1)$ 取用。

```typescript
for (let state = 0; state < STATE_SIZE; state++) {
  // Step 2：解碼狀態欄位

  for (let digit = 0; digit < 10; digit++) {
    // Step 2：依目前累積數字數量推導中繼變數

    const newState = newStarted * 121 + newPreviousDigit * 11 + newPreviousPreviousDigit;
    const tableIndex = state * 10 + digit;
    NEXT_STATE_TABLE[tableIndex] = newState;
    WAVINESS_TABLE[tableIndex] = wavinessIncrement;
  }
}
```

### Step 4：computeWavinessPrefixSum 快速處理少於三位數的上界

進入主前綴和函式後，先處理一個退化情形：
若上界連 100 都不到，意味著範圍內沒有任何超過兩位的數字，波動值總和必為 0，可立即返回。

```typescript
/**
 * 使用數位 DP 計算 [0, upperBound] 範圍內所有整數的波動值總和。
 * @param upperBound - 上界，必須為非負安全整數。
 * @returns 範圍內累積的波動值總和。
 */
function computeWavinessPrefixSum(upperBound: number): number {
  // 少於三位數的數字對波動值毫無貢獻
  if (upperBound < 100) {
    return 0;
  }

  // ...
}
```

### Step 5：抽取上界各位數並翻轉成大端序

先以模十取餘的方式逐位將上界拆解到緩衝區（此時順序為由低位到高位），
接著原地翻轉，使最高位處於陣列起始位置，方便後續從最高位向最低位推進。

```typescript
function computeWavinessPrefixSum(upperBound: number): number {
  // Step 4：少於三位數的上界直接回傳 0

  // 將 upperBound 的各位數字以大端序存入定型陣列
  const digitBuffer = new Int8Array(16);
  let digitCount = 0;
  let remaining = upperBound;
  while (remaining > 0) {
    const lastDigit = remaining % 10;
    digitBuffer[digitCount] = lastDigit;
    remaining = (remaining - lastDigit) / 10;
    digitCount++;
  }
  // 原地翻轉緩衝區，使最高位數字置於最前
  for (let leftIndex = 0, rightIndex = digitCount - 1; leftIndex < rightIndex; leftIndex++, rightIndex--) {
    const swapValue = digitBuffer[leftIndex];
    digitBuffer[leftIndex] = digitBuffer[rightIndex];
    digitBuffer[rightIndex] = swapValue;
  }

  // ...
}
```

### Step 6：配置 loose 雙緩衝與初始 tight 狀態

為了在每一位數推進時，能用「來源緩衝 → 目標緩衝」的方式更新狀態而不重新配置記憶體，
事先準備兩組鬆綁狀態的計數與波動值總和緩衝。
同時，初始的緊跟狀態對應「尚未填入任何有效數字」，即 `(started=0, prev=10, prevPrev=10)`，編碼後為索引 120。

```typescript
function computeWavinessPrefixSum(upperBound: number): number {
  // Step 4：少於三位數的上界直接回傳 0

  // Step 5：抽取上界各位數並翻轉為大端序

  // 雙緩衝的 loose 狀態陣列，於每個位數結束後交換以避免重新配置
  let looseCount = new Float64Array(STATE_SIZE);
  let looseSum = new Float64Array(STATE_SIZE);
  let nextLooseCount = new Float64Array(STATE_SIZE);
  let nextLooseSum = new Float64Array(STATE_SIZE);

  // 單一確定性的 tight 狀態，用於追蹤仍等於 upperBound 的前綴
  let tightState = 120; // (started=0, prev=10, prevPrev=10) 的初始編碼
  let tightSum = 0;

  // ...
}
```

### Step 7：為每個位數重置目標緩衝並展開所有 loose 狀態

進入主迴圈後，先清空 `next` 目標緩衝以避免上一輪殘留汙染本輪結果；
接著對每一個目前有效（計數非零）的鬆綁狀態，將其與 0-9 十個數字選擇逐一查表，把對應的路徑數量與波動值貢獻匯入新狀態。

```typescript
function computeWavinessPrefixSum(upperBound: number): number {
  // Step 4：少於三位數的上界直接回傳 0

  // Step 5：抽取上界各位數並翻轉為大端序

  // Step 6：配置雙緩衝與初始 tight 狀態

  for (let position = 0; position < digitCount; position++) {
    const limitDigit = digitBuffer[position];

    // 重置此位數對應的目標緩衝
    nextLooseCount.fill(0);
    nextLooseSum.fill(0);

    // 將每個非空的 loose 狀態於 0-9 十個數字選擇上完整展開
    for (let state = 0; state < STATE_SIZE; state++) {
      const stateCount = looseCount[state];
      if (stateCount === 0) {
        continue;
      }
      const stateSum = looseSum[state];
      const baseIndex = state * 10;

      for (let digit = 0; digit < 10; digit++) {
        const tableIndex = baseIndex + digit;
        const newState = NEXT_STATE_TABLE[tableIndex];
        const wavinessIncrement = WAVINESS_TABLE[tableIndex];
        nextLooseCount[newState] += stateCount;
        nextLooseSum[newState] += stateSum + stateCount * wavinessIncrement;
      }
    }

    // ...
  }

  // ...
}
```

### Step 8：展開 tight 狀態：小於限制者分流為 loose、等於限制者延續 tight

緊跟路徑只有一條，必須單獨處理：
凡是小於本位限制的數字選擇都會讓路徑「脫離上界」，因此將其轉化為一筆新的鬆綁貢獻併入 `next` 緩衝；
而恰好等於限制的那個數字則使路徑繼續貼著上界前進，僅需更新單一的 `tightState` 與 `tightSum`。

```typescript
function computeWavinessPrefixSum(upperBound: number): number {
  // Step 4：少於三位數的上界直接回傳 0

  // Step 5：抽取上界各位數並翻轉為大端序

  // Step 6：配置雙緩衝與初始 tight 狀態

  for (let position = 0; position < digitCount; position++) {
    // Step 7：重置目標緩衝並展開所有 loose 狀態

    // 展開 tight 狀態：小於限制的數字分流至 loose 集合
    const tightBaseIndex = tightState * 10;
    for (let digit = 0; digit < limitDigit; digit++) {
      const tableIndex = tightBaseIndex + digit;
      const newState = NEXT_STATE_TABLE[tableIndex];
      const wavinessIncrement = WAVINESS_TABLE[tableIndex];
      nextLooseCount[newState] += 1;
      nextLooseSum[newState] += tightSum + wavinessIncrement;
    }
    // 等於限制的數字使路徑維持 tight
    const tightTableIndex = tightBaseIndex + limitDigit;
    tightSum += WAVINESS_TABLE[tightTableIndex];
    tightState = NEXT_STATE_TABLE[tightTableIndex];

    // ...
  }

  // ...
}
```

### Step 9：在每輪結束時交換 loose 雙緩衝

本輪寫入的 `next` 緩衝即為下一輪的來源緩衝，因此只需以指標交換而非新建陣列的方式互換兩組緩衝，便能在無記憶體分配下進入下一個位數迭代。

```typescript
function computeWavinessPrefixSum(upperBound: number): number {
  // Step 4：少於三位數的上界直接回傳 0

  // Step 5：抽取上界各位數並翻轉為大端序

  // Step 6：配置雙緩衝與初始 tight 狀態

  for (let position = 0; position < digitCount; position++) {
    // Step 7：展開所有 loose 狀態

    // Step 8：展開 tight 狀態

    // 為下一輪交換緩衝對，避免重新配置
    const tempCount = looseCount;
    const tempSum = looseSum;
    looseCount = nextLooseCount;
    looseSum = nextLooseSum;
    nextLooseCount = tempCount;
    nextLooseSum = tempSum;
  }

  // ...
}
```

### Step 10：加總 loose 累積與 tight 路徑得到最終結果

所有位數處理完畢後，鬆綁集合中所累積的波動值對應 $[0, \text{upperBound})$ 內所有整數的貢獻，
緊跟路徑則對應 `upperBound` 自身的貢獻。將兩者相加即得到 $f(\text{upperBound})$。

```typescript
function computeWavinessPrefixSum(upperBound: number): number {
  // Step 4：少於三位數的上界直接回傳 0

  // Step 5：抽取上界各位數並翻轉為大端序

  // Step 6：配置雙緩衝與初始 tight 狀態

  // Step 7-9：以位數為單位推進 loose/tight 雙模式數位 DP

  // 加總所有最終 loose 狀態的累積波動值，並加上 tight 路徑的貢獻
  let total = tightSum;
  for (let state = 0; state < STATE_SIZE; state++) {
    total += looseSum[state];
  }

  return total;
}
```

### Step 11：對外接口 totalWaviness：以前綴和差計算區間總和

由於已可在 $O(\log n)$ 時間內取得 $[0, x]$ 內的波動值總和，
區間 $[\text{num1}, \text{num2}]$ 的答案直接由 $f(\text{num2}) - f(\text{num1} - 1)$ 求出。

```typescript
/**
 * 計算 [num1, num2] 範圍內所有整數的波動值總和。
 * @param num1 - 範圍下界（含）。
 * @param num2 - 範圍上界（含）。
 * @returns 範圍內所有波動值的總和。
 */
function totalWaviness(num1: number, num2: number): number {
  return computeWavinessPrefixSum(num2) - computeWavinessPrefixSum(num1 - 1);
}
```

## 時間複雜度

- 轉移表預建構僅遍歷 $STATE\_SIZE \times 10 = 2420$ 個配對，為常數時間；
- 主前綴和函式對上界的每一位數字進行一次推進，總位數為 $d = O(\log n)$；
- 每個位數內，展開所有 loose 狀態需 $STATE\_SIZE \times 10 = O(1)$ 操作，tight 展開亦為 $O(1)$；
- `totalWaviness` 對 $f$ 呼叫兩次，整體仍為線性於位數。
- 總時間複雜度為 $O(\log n)$。

> $O(\log n)$

## 空間複雜度

- 兩張轉移表大小為 $STATE\_SIZE \times 10$，為固定常數；
- 鬆綁雙緩衝各為 $STATE\_SIZE$ 大小，亦為常數；
- 位數緩衝固定 16 槽，對應上界最大可能位數，仍為 $O(\log n)$；
- 其餘為少量純量變數。
- 總空間複雜度為 $O(\log n)$。

> $O(\log n)$
