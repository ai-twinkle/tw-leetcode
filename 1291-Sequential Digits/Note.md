# 1291. Sequential Digits

An integer has sequential digits 
if and only if each digit in the number is one more than the previous digit.

Return a sorted list of all the integers in the range `[low, high]` inclusive 
that have sequential digits.

**Constraints:**

- `10 <= low <= high <= 10^9`

## 基礎思路

本題要求在給定範圍 `[low, high]` 內，找出所有「順序數字」整數——即每個位數都比前一位大 1 的整數，並依升序回傳。

在思考解法時，可掌握以下核心觀察：

- **順序數字的總數極為有限**：
  所有順序數字皆由字串 `"123456789"` 的連續子字串構成，長度從 2 到 9，起始位置從 0 到 8，因此全宇宙中最多只有 36 個這樣的數字。

- **可於查詢前一次性預建表格**：
  由於候選數字數量極少且固定，可在函數外預先計算並排序，使每次查詢只需線性掃描這張小表，不必重複推導。

- **排序後可提前終止掃描**：
  表格排序後，一旦遇到超過上界 `high` 的值即可立刻停止，不必掃描完整張表。

依據以上特性，可以採用以下策略：

- **預建所有 36 個順序數字的排序陣列**，在模組載入時執行一次。
- **以單次線性掃描過濾出落在 `[low, high]` 區間內的數字**，利用排序保證提前終止。

此策略讓每次查詢的工作量固定在常數範圍內，高效且簡潔。

## 解題步驟

### Step 1：以 IIFE 預建所有順序數字的排序陣列

在函數外透過立即執行函數，枚舉字串 `"123456789"` 中所有長度為 2 到 9 的連續子字串，將其轉為數字後排序，並儲存在 `Int32Array` 中供後續查詢重複使用。

```typescript
// 預先計算所有可能的順序數字，只需執行一次。
// 數字序列 123456789 共產生 36 個此類數字（長度 2 到 9）。
const ALL_SEQUENTIAL_DIGITS: Int32Array = (function buildSequentialDigits(): Int32Array {
  const digitSource = "123456789";
  const collected: number[] = [];

  // 每個起始索引與長度組合，恰好產生一個順序數字。
  for (let length = 2; length <= 9; length++) {
    for (let start = 0; start + length <= 9; start++) {
      collected.push(Number(digitSource.substring(start, start + length)));
    }
  }

  // 升序排序，使後續範圍查詢可直接截取。
  collected.sort((first, second) => first - second);
  return Int32Array.from(collected);
})();
```

### Step 2：線性掃描預建表格，收集落在範圍內的候選數字

對已排序的 `ALL_SEQUENTIAL_DIGITS` 做單次掃描：
若當前候選數字超過上界 `high`，即可提前終止；
若落在 `[low, high]` 區間內，則收入結果陣列。

```typescript
// 對微型預建表格做單次線性掃描。
for (let index = 0; index < ALL_SEQUENTIAL_DIGITS.length; index++) {
  const candidate = ALL_SEQUENTIAL_DIGITS[index];

  // 表格已排序，一旦超過上界即可停止。
  if (candidate > high) {
    break;
  }

  if (candidate >= low) {
    result.push(candidate);
  }
}
```

### Step 3：回傳結果陣列

掃描完成後，`result` 中即為所有符合條件的順序數字，因表格本身已升序排列，結果自然有序，可直接回傳。

```typescript
return result;
```

## 時間複雜度

- 預建表格時，雙層迴圈枚舉所有長度與起始位置的組合，共 36 次固定操作；
- 排序對象為固定大小的 36 個元素，為常數時間；
- 每次查詢僅需線性掃描至多 36 個元素；
- 所有操作皆為常數時間。
- 總時間複雜度為 $O(1)$。

> $O(1)$

## 空間複雜度

- 預建的 `ALL_SEQUENTIAL_DIGITS` 陣列固定儲存 36 個整數；
- 輸出陣列 `result` 最多包含 36 個元素；
- 無任何與輸入規模相關的動態空間配置。
- 總空間複雜度為 $O(1)$。

> $O(1)$
