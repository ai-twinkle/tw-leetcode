# 679. 24 Game

You are given an integer array `cards` of length `4`. 
You have four cards, each containing a number in the range `[1, 9]`. 
You should arrange the numbers on these cards in a mathematical expression using the operators `['+', '-', '*', '/']` and the parentheses `'('` and `')'` to get the value 24.

You are restricted with the following rules:

- The division operator `'/'` represents real division, not integer division.
  - For example, `4 / (1 - 2 / 3) = 4 / (1 / 3) = 12`.
- Every operation done is between two numbers. In particular, we cannot use `'-'` as a unary operator.
  - For example, if `cards = [1, 1, 1, 1]`, the expression `"-1 - 1 - 1 - 1"` is not allowed.
- You cannot concatenate numbers together
  - For example, if `cards = [1, 2, 1, 2]`, the expression `"12 + 12"` is not valid.

Return `true` if you can get such expression that evaluates to `24`, and `false` otherwise.

**Constraints:**

- `cards.length == 4`
- `1 <= cards[i] <= 9`

## 基礎思路

題目要求判斷四張牌是否能透過加、減、乘、除與括號得到 $24$。
為了達成這個目標，我們可以使用遞迴縮減法，逐步將數列縮減至一個數字，並在每一步嘗試所有可能的運算組合。

我們可以透過以下策略來解決這個問題：

1. **遞迴縮減法**：每次從數列中選兩個數做運算，將結果放回數列中，使長度逐步縮減至 $1$。若最終結果與 $24$ 的差值在容忍誤差內，回傳 `true`。
2. **避免重複狀態**：對每個狀態（數列）建立唯一鍵，若該狀態已被處理過則直接跳過，以減少計算。
3. **浮點數精度控制**：比較時使用公差 $10^{-6}$，並在建立狀態鍵時將數值量化，避免小數誤差造成重複狀態判斷失效。
4. **效能優化**：

    * 使用 `Float64Array` 來處理數列，提升數值運算效能。
    * 使用全域緩衝區 `scratchKeyBuffer` 建立鍵，避免重複配置記憶體。
    * 在遞迴展開時，以「用最後一個元素覆蓋 j」來實現常數時間刪除，並在遞迴後還原狀態。
5. **快取結果**：將初始輸入排序後的字串作為 key，把最終結果記錄起來，避免重複呼叫相同輸入時重新計算。

## 解題步驟

### Step 1：定義常數與全域快取

首先定義浮點比較公差與目標值 $24$，並建立跨呼叫的快取與暫存緩衝。

```typescript
// 浮點數比較的精度容忍度
const FLOAT_COMPARISON_TOLERANCE = 1e-6;
const TARGET_RESULT_VALUE = 24;

// 快取相同初始牌組的判斷結果
const initialCardsResultCache = new Map<string, boolean>();

// 產生狀態鍵的暫存緩衝，避免重複配置記憶體
const scratchKeyBuffer: number[] = [0, 0, 0, 0];
```

### Step 2：建立初始牌組的快取 key

將四張牌排序後組成字串，確保相同多重集合有相同 key。

```typescript
function buildInitialCardsKey(cards: readonly number[]): string {
  // 排序以正規化多重集合表示
  const sortedCards = cards.slice().sort((x, y) => x - y);
  return sortedCards.join(",");
}
```

### Step 3：建立狀態鍵（用於遞迴過程的去重）

將數列依照公差量化後排序，再串接為字串，確保相同集合能得到同一 key。

```typescript
function buildStateKey(stateNumbers: Float64Array, stateLength: number): string {
  // 對每個數值做量化，降低浮點數雜訊
  for (let i = 0; i < stateLength; i++) {
    scratchKeyBuffer[i] = Math.round(stateNumbers[i] / FLOAT_COMPARISON_TOLERANCE);
  }

  // 插入排序，確保順序不影響鍵值
  for (let i = 1; i < stateLength; i++) {
    const currentValue = scratchKeyBuffer[i];
    let j = i - 1;

    while (j >= 0 && scratchKeyBuffer[j] > currentValue) {
      scratchKeyBuffer[j + 1] = scratchKeyBuffer[j];
      j--;
    }

    scratchKeyBuffer[j + 1] = currentValue;
  }

  // 串接成字串鍵
  let keyString = "" + scratchKeyBuffer[0];
  for (let i = 1; i < stateLength; i++) {
    keyString += "," + scratchKeyBuffer[i];
  }
  return keyString;
}
```

### Step 4：主函式初始化與快取檢查

檢查輸入是否合法，若結果已有快取則直接回傳；否則建立 `Float64Array` 狀態並準備去重集合。

```typescript
function judgePoint24(cards: number[]): boolean {
  if (cards.length !== 4) {
    return false;
  }

  // 建立初始狀態的快取 key
  const initialKey = buildInitialCardsKey(cards);
  const cachedResult = initialCardsResultCache.get(initialKey);

  if (cachedResult !== undefined) {
    return cachedResult;
  }

  // 使用 Typed Array 儲存狀態
  const stateNumbers = new Float64Array(4);
  for (let i = 0; i < 4; i++) {
    stateNumbers[i] = cards[i];
  }

  const visitedStates = new Set<string>();

  // ...
}
```

### Step 5：定義遞迴函式 `searchPossibleResults`

處理核心 DFS 搜尋：

- 若只剩一個數，檢查是否接近 24。
- 否則產生狀態鍵，若已處理過則跳過。
- 枚舉每一對數，嘗試所有可能運算（含方向），並透過壓縮與還原維護狀態。

```typescript
function judgePoint24(cards: number[]): boolean {
  // Step 4：主函式初始化與快取檢查

  function searchPossibleResults(stateLength: number): boolean {
    if (stateLength === 1) {
      return Math.abs(stateNumbers[0] - TARGET_RESULT_VALUE) <= FLOAT_COMPARISON_TOLERANCE;
    }

    const stateKey = buildStateKey(stateNumbers, stateLength);
    if (visitedStates.has(stateKey)) {
      return false;
    } else {
      visitedStates.add(stateKey);
    }

    for (let i = 0; i < stateLength; i++) {
      for (let j = i + 1; j < stateLength; j++) {
        const firstNumber = stateNumbers[i];
        const secondNumber = stateNumbers[j];

        // 壓縮陣列：以最後一個元素覆蓋 j
        stateNumbers[j] = stateNumbers[stateLength - 1];

        // 可交換運算：加法
        stateNumbers[i] = firstNumber + secondNumber;
        if (searchPossibleResults(stateLength - 1)) {
          return true;
        }

        // 可交換運算：乘法
        stateNumbers[i] = firstNumber * secondNumber;
        if (searchPossibleResults(stateLength - 1)) {
          return true;
        }

        // 不可交換運算：減法
        stateNumbers[i] = firstNumber - secondNumber;
        if (searchPossibleResults(stateLength - 1)) {
          return true;
        }

        stateNumbers[i] = secondNumber - firstNumber;
        if (searchPossibleResults(stateLength - 1)) {
          return true;
        }

        // 不可交換運算：除法（避免分母為零）
        if (Math.abs(secondNumber) > FLOAT_COMPARISON_TOLERANCE) {
          stateNumbers[i] = firstNumber / secondNumber;
          if (searchPossibleResults(stateLength - 1)) {
            return true;
          }
        }

        if (Math.abs(firstNumber) > FLOAT_COMPARISON_TOLERANCE) {
          stateNumbers[i] = secondNumber / firstNumber;
          if (searchPossibleResults(stateLength - 1)) {
            return true;
          }
        }

        // 還原狀態
        stateNumbers[i] = firstNumber;
        stateNumbers[j] = secondNumber;
      }
    }

    return false;
  }

  // ...
}
```

### Step 6：執行 DFS、存入快取並回傳結果

最後呼叫 DFS 搜尋，將結果存入快取後回傳。

```typescript
function judgePoint24(cards: number[]): boolean {
  // Step 4：主函式初始化與快取檢查
  
  // Step 5：定義遞迴函式 `searchPossibleResults`
  
  const finalResult = searchPossibleResults(4);
  initialCardsResultCache.set(initialKey, finalResult);
  return finalResult;
}
```

## 時間複雜度

- 狀態鍵建立與排序操作皆在 $m \leq 4$ 範圍內，為常數時間。
- 遞迴搜尋每層處理 $\binom{m}{2}$ 對、最多 6 種運算，且透過去重避免重複計算。
- 在固定 $n=4$ 的情況下，時間複雜度為 $O(1)$。
- 總時間複雜度為 $O(1)$。

> $O(1)$

## 空間複雜度

- 狀態陣列與暫存緩衝固定長度 $4$，為 $O(1)$。
- 遞迴深度最大為 $3$，仍為 $O(1)$。
- 訪問集合與快取的大小亦為常數級。
- 總空間複雜度為 $O(1)$。

> $O(1)$
