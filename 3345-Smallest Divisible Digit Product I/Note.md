# 3345. Smallest Divisible Digit Product I

You are given two integers `n` and `t`. 
Return the smallest number greater than or equal to `n` 
such that the product of its digits is divisible by `t`.

**Constraints:**

- `1 <= n <= 100`
- `1 <= t <= 10`

## 基礎思路

本題要求對於給定的兩個整數 `n` 與 `t`，找出大於等於 `n` 的最小數字，使得該數字的各位數字乘積能被 `t` 整除。由於題目約束極小（`n` 至多為 100，`t` 至多為 10），因此完全可以在事前將所有可能的答案預先計算完畢，並在查詢時以常數時間直接取用。

在思考解法時，可掌握以下核心觀察：

- **問題參數空間極小且封閉**：
  所有合法的輸入組合數量有限，因此可將全部答案一次性建表，避免每次查詢時重複搜尋。

- **數字乘積可預先計算並重複利用**：
  每個候選數值的各位乘積只與該數值本身有關，與 `t` 無關，因此可先獨立算出所有數值的乘積並暫存。

- **答案具備後綴最小性質**：
  對於固定的除數，較小的數值若無法滿足條件，其答案即為後方（較大數值）已解出的結果；因此可由大到小掃描，讓每個數值直接沿用後方已確定的答案。

- **邊界值恆為有效退路**：
  上界數值因含有數字零而使乘積為零，能被任意除數整除，故永遠是一個合法的候補答案，確保搜尋不會落空。

依據以上特性，可以採用以下策略：

- **先獨立計算所有候選數值的各位乘積並存入緩衝區**。
- **對每個除數由大到小掃描，維護當前最佳答案，形成後綴最小的查表結構**。
- **查詢時依索引直接於表中取出預先算好的答案，達成常數時間回應**。

此策略將所有運算集中於建表階段，使每次查詢皆為即時完成，安全且高效。

## 解題步驟

### Step 1：定義題目約束的上界常數

依照題目約束，先定義 `n` 與 `t` 的最大值，作為後續建表的維度依據。

```typescript
/** 題目約束允許的 n 最大值。 */
const MAXIMUM_N = 100;

/** 題目約束允許的 t 最大值。 */
const MAXIMUM_T = 10;
```

### Step 2：建立查表函數並配置所需緩衝區

宣告建表函數，並準備兩個緩衝區：一個用於儲存所有 `(n, t)` 組合的最終答案，另一個用於暫存各數值的位數乘積。

```typescript
/**
 * 建立涵蓋所有約束範圍內 (n, t) 組合的完整答案查表。
 * @returns 一個扁平化的 Uint8Array，包含 MAXIMUM_N * MAXIMUM_T 筆預先算好的答案。
 */
function buildAnswerTable(): Uint8Array {
  const table = new Uint8Array(MAXIMUM_N * MAXIMUM_T);
  const digitProducts = new Uint8Array(MAXIMUM_N + 1);

  // ...
}
```

### Step 3：預先計算每個候選數值的各位乘積

逐一走訪所有候選數值，透過不斷取最低位並相乘的方式求出其各位數字乘積；由於乘積最大僅為 `9 * 9 = 81`，以單一位元組即足以儲存。

```typescript
function buildAnswerTable(): Uint8Array {
  // Step 2：配置答案表與位數乘積緩衝區

  // 計算每個候選值的位數乘積；最大可能值為 9 * 9 = 81，因此一個位元組即足夠。
  for (let value = 1; value <= MAXIMUM_N; value++) {
    let product = 1;
    let remaining = value;

    while (remaining > 0) {
      product *= remaining % 10;
      remaining = (remaining / 10) | 0;
    }

    digitProducts[value] = product;
  }

  // ...
}
```

### Step 4：對每個除數由大到小掃描並建立後綴最小查表

針對每個除數，由最大數值往下掃描；一旦發現某數值的位數乘積可被該除數整除，即更新當前最佳答案，並將此答案寫入對應的表格位置，形成後綴最小結構。

```typescript
function buildAnswerTable(): Uint8Array {
  // Step 2：配置答案表與位數乘積緩衝區

  // Step 3：預先計算每個候選值的位數乘積

  // 由大到小掃描，使每個 n 沿用已為 n + 1 解出的答案（後綴最小）。
  for (let divisor = 1; divisor <= MAXIMUM_T; divisor++) {
    // 100 含有數字零，乘積為 0，故恆為有效的退路答案。
    let bestSoFar = MAXIMUM_N;

    for (let value = MAXIMUM_N; value >= 1; value--) {
      if (digitProducts[value] % divisor === 0) {
        bestSoFar = value;
      }

      table[(value - 1) * MAXIMUM_T + (divisor - 1)] = bestSoFar;
    }
  }

  return table;
}
```

### Step 5：於模組載入時完成建表

在模組初始化階段即呼叫建表函數，將完整答案表計算完畢並保存，供後續查詢重複使用。

```typescript
/** 預先算好的答案，索引方式為 (n - 1) * MAXIMUM_T + (t - 1)。 */
const answerTable = buildAnswerTable();
```

### Step 6：以常數時間查表回傳答案

查詢函數依據 `n` 與 `t` 計算對應索引，直接由預先建好的表中取出答案，達成 $O(1)$ 的查詢效能。

```typescript
/**
 * 回傳大於等於 n 且其位數乘積能被 t 整除的最小數字。
 * @param n 搜尋的下界。
 * @param t 位數乘積所需的除數。
 * @returns 最小的合格數字，透過預先建好的表以 O(1) 解出。
 */
function smallestNumber(n: number, t: number): number {
  return answerTable[(n - 1) * MAXIMUM_T + (t - 1)];
}
```

## 時間複雜度

- 建表階段需對每個候選數值計算位數乘積，其位數為常數級，故此部分為 $O(\text{MAXIMUM\_N})$；
- 對每個除數皆需完整掃描一次所有候選數值，此部分為 $O(\text{MAXIMUM\_T} \times \text{MAXIMUM\_N})$；
- 由於上界皆為固定常數，整體建表為常數時間，且每次查詢僅為單次索引存取。
- 總時間複雜度為 $O(1)$。

> $O(1)$

## 空間複雜度

- 需配置大小為 `MAXIMUM_N * MAXIMUM_T` 的答案表與大小為 `MAXIMUM_N + 1` 的乘積緩衝區；
- 兩者皆受固定上界限制，不隨輸入規模增長。
- 總空間複雜度為 $O(1)$。

> $O(1)$
