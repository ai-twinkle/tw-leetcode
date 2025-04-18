# 38. Count and Say

The count-and-say sequence is a sequence of digit strings defined by the recursive formula:

- `countAndSay(1) = "1"`
- `countAndSay(n)` is the run-length encoding of `countAndSay(n - 1)`.

Run-length encoding (RLE) is a string compression method that works 
by replacing consecutive identical characters (repeated 2 or more times) 
with the concatenation of the character and 
the number marking the count of the characters (length of the run). 
For example, to compress the string `"3322251"` we replace `"33"` with `"23"`, 
replace `"222"` with `"32"`, replace `"5"` with `"15"` and replace `"1"` with `"11"`. 
Thus, the compressed string becomes `"23321511"`.

Given a positive integer `n`, return the $n^{th}$ element of the count-and-say sequence.

## 基礎思路

本題要求回傳 count-and-say 序列的第 $n$ 項，其中序列的定義如下：

1. 基本情況為 `countAndSay(1) = "1"`；
2. 當 $n > 1$ 時，`countAndSay(n)` 是對前一項 `countAndSay(n - 1)` 進行「跑長編碼」（Run-Length Encoding, RLE）後所得的結果。

為了讓每次取得序列第 $n$ 項的查詢操作都能達到 $O(1)$ 的效率，我們在模組載入階段預先計算並緩存前 `MAX_TERMS` 項。

實現中，RLE 編碼的主要邏輯由輔助函式 `generateNextTerm` 負責，透過一次線性掃描將連續相同的數字轉換成「數字出現次數 + 數字本身」的形式。

主函式只需透過索引直接從緩存陣列中取得答案，並在輸入參數超出有效範圍時拋出異常訊息。

## 解題步驟

### Step 1：實作輔助函式 `generateNextTerm`

我們首先實現一個輔助函式 `generateNextTerm`，此函式負責對給定的字串進行跑長編碼（RLE），其步驟如下：

- 建立一個字串陣列 `termParts`，用以暫存每組連續數字的「數量」和「數字本身」。
- 設置變數 `runCount` 用來記錄目前連續數字出現的次數，初始值為 `1`。
- 使用迴圈從第二個字元開始，逐位比較當前字元與前一字元：
    - 若相同，則將 `runCount` 累加；
    - 若不同，則將當前累計的數量與前一個字元推入 `termParts` 中，並將 `runCount` 重置為 `1`。
- 迴圈結束後，別忘記將最後一組累計的數量與對應字元也推入 `termParts` 中。
- 最終透過 `join('')` 方法將 `termParts` 陣列合併為字串並返回。

```typescript
function generateNextTerm(previousTerm: string): string {
  const termParts: string[] = [];
  let runCount = 1;
  const len = previousTerm.length;

  for (let i = 1; i < len; i++) {
    if (previousTerm[i] === previousTerm[i - 1]) {
      runCount++;
    } else {
      // 將數量與前一個數字推入陣列
      termParts.push(runCount.toString(), previousTerm[i - 1]);
      runCount = 1; // 重置計數
    }
  }
  // 處理最後一組數字
  termParts.push(runCount.toString(), previousTerm[len - 1]);

  return termParts.join('');
}
```

### Step 2：定義常數並預先計算序列緩存

為了達到每次取得第 $n$ 項的時間複雜度為 $O(1)$，我們在程式載入階段就先計算並儲存前面固定數量的序列項：

- 定義常數 `MAX_TERMS = 30`，表示預先計算的序列最大項數。
- 使用立即執行函式（IIFE）建立緩存陣列 `countAndSayCache`，初始狀態包含第 1 項 `"1"`。
- 透過迴圈逐步計算第 2 到第 `MAX_TERMS` 項，呼叫上述的輔助函式 `generateNextTerm`，將產生的結果推入緩存陣列。

```typescript
const MAX_TERMS = 30;

const countAndSayCache: string[] = (() => {
  const cache: string[] = ['1'];
  for (let termIndex = 2; termIndex <= MAX_TERMS; termIndex++) {
    const previous = cache[cache.length - 1];
    cache.push(generateNextTerm(previous));
  }
  return cache;
})();
```

### Step 3：實作主函式 `countAndSay`

最後，我們實現主函式 `countAndSay`，該函式的作用為：

- 首先檢查輸入參數 $n$ 是否在有效範圍內（即介於 1 到 `MAX_TERMS` 之間），若超出此範圍則拋出 `RangeError` 異常提示。
- 因為 TypeScript/JavaScript 陣列是從 0 開始索引的，所以第 $n$ 項即對應於緩存陣列中的第 `n - 1` 個元素。

完整程式碼如下：

```typescript
function countAndSay(n: number): string {
  if (n < 1 || n > MAX_TERMS) {
    throw new RangeError(`n must be between 1 and ${MAX_TERMS}, got ${n}`);
  }
  return countAndSayCache[n - 1];
}
```

## 時間複雜度

- **預計算階段**：對前 `MAX_TERMS` 項作 RLE，每項時間與字串長度線性相關，總計約 $O(\text{MAX_TERMS} \times L)$，其中 $L$ 為平均字串長度；
由於 `MAX_TERMS` 為常數，此階段可視為 $O(1)$。
- **查詢階段**：主函式僅做陣列索引與範圍檢查，時間複雜度為 $O(1)$。
- 總時間複雜度為 $O(1)$。

> $O(1)$

## 空間複雜度

- 使用一個長度為 `MAX_TERMS` 的字串陣列 `countAndSayCache` 緩存結果，空間為 $O(\text{MAX_TERMS} \times L)$；其他輔助變數皆為常數空間。
- 若視 `MAX_TERMS` 為常數，則整體空間複雜度可視為 $O(1)$。
- 總空間複雜度為 $O(1)$。

> $O(1)$
