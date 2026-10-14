# 3723. Maximize Sum of Squares of Digits

You are given two positive integers num and `sum`.

A positive integer `n` is good if it satisfies both of the following:

- The number of digits in `n` is exactly `num`.
- The sum of digits in `n` is exactly `sum`.

The score of a good integer `n` is the sum of the squares of digits in `n`.

Return a string denoting the good integer `n` that achieves the maximum score. 
If there are multiple possible integers, return the maximum one. 
If no such integer exists, return an empty string.

**Constraints:**

- `1 <= num <= 2 * 10^5`
- `1 <= sum <= 2 * 10^6`

## 基礎思路

本題要求在所有「位數恰為指定值、數位和恰為指定值」的正整數中，找出數位平方和最大者；
若有多個並列，則取數值最大者；若不存在，則回傳空字串。由於位數最多可達 `2 * 10^5`，無法枚舉任何候選數字，必須直接構造出答案。

在思考解法時，可掌握以下核心觀察：

- **可行性僅取決於上界**：
  每一位數字最多為 9，因此指定的位數所能承載的最大數位和有限；只要數位和超過此上界，即不存在任何合法整數。由於數位和至少為 1，下界不會造成問題。

- **平方和偏好「極端不均」的分配**：
  在總和固定的條件下，平方和是 Schur 凸函數。數值分配越集中，平方和越大。因此應盡可能讓每一位取到最大值 9，剩餘無法湊滿 9 的部分集中在單一位數上，其餘位數全為 0。

- **最佳數字多重集合唯一**：
  上述「盡量全為 9、至多一個餘數位、其餘補 0」的分配方式唯一決定了使用哪些數字，因此平方和並列的情況只會來自同一組數字的不同排列。

- **固定數字集合下，遞減排列即為最大值**：
  將所有數字由大到小排列，即可得到數值最大的整數；且最高位必為 9 或非零餘數，不會產生前導零。

依據以上特性，可以採用以下策略：

- **先以上界判斷是否無解**，若數位和超過可承載的最大值則直接回傳空字串。
- **計算可放入的 9 的個數與剩餘的餘數**，決定最佳的數字組成。
- **依「9 → 餘數 → 0」的遞減順序拼接字串**，直接構造出答案。

此策略不需任何搜尋，僅需線性時間建構輸出字串即可完成。

## 解題步驟

### Step 1：預先定義數字字元對照表

先建立 0 到 9 的字元對照表，之後可直接以索引取得餘數位對應的字元，避免執行期的數值轉字串操作。

```typescript
/** 數字字元對照表，避免在執行期進行數值轉字串。 */
const DIGIT_CHARACTERS: readonly string[] = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
```

### Step 2：判斷是否存在合法整數

每一位數字最多貢獻 9，因此 `num` 位數最多只能湊出 `9 * num` 的數位和；若 `sum` 超過此值，則不存在任何合法整數，直接回傳空字串。

```typescript
// 任何 num 位數的數字，每一位最多只能貢獻 9。
if (sum > 9 * num) {
  return '';
}
```

### Step 3：計算 9 的個數與餘數位

由於平方和偏好最不均勻的分配，應盡量放入 9。`nineCount` 為可放入的 9 的個數，`remainderDigit` 為湊不滿 9 的剩餘數值，它將單獨佔用一位。

```typescript
// 平方和為 Schur 凸函數，因此分配最不均勻的多重集合勝出：盡量全為 9，再加上一個餘數。
const nineCount = (sum / 9) | 0;
const remainderDigit = sum - nineCount * 9;
```

### Step 4：建立最高位段的 9 字串

固定數字組成後，遞減排列即為最大數值，因此所有的 9 必須放在最前方。若 9 的個數為 0，則此段為空字串。

```typescript
// 對固定的數字多重集合而言，將其由大到小排列即為最大數值。
const nines = nineCount > 0 ? '9'.repeat(nineCount) : '';
```

### Step 5：處理餘數為 0 的情況

若 `sum` 恰為 9 的倍數，則不需要餘數位，剩下的位數全部補 0。若沒有剩餘位數，則直接回傳全為 9 的字串。

```typescript
if (remainderDigit === 0) {
  const zeroCount = num - nineCount;
  return zeroCount > 0 ? nines + '0'.repeat(zeroCount) : nines;
}
```

### Step 6：處理餘數非 0 的情況並組合結果

若存在餘數，則在所有 9 之後接上餘數位，此時 0 的個數需再扣除餘數佔用的一位。最後依「9 → 餘數 → 0」的遞減順序拼接並回傳。

```typescript
const zeroCount = num - nineCount - 1;
const head = nines + DIGIT_CHARACTERS[remainderDigit];

return zeroCount > 0 ? head + '0'.repeat(zeroCount) : head;
```

## 時間複雜度

- 可行性判斷與 9 的個數、餘數的計算皆為常數時間；
- 建構結果字串需產生恰好 `n` 個字元，其中 `n` 為位數 `num`；
- 總時間複雜度為 $O(n)$。

> $O(n)$

## 空間複雜度

- 除常數個變數與固定大小的字元對照表外，主要空間來自長度為 `n` 的結果字串；
- 總空間複雜度為 $O(n)$。

> $O(n)$
