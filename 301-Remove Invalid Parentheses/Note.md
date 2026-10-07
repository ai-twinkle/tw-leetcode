# 301. Remove Invalid Parentheses

Given a string `s` that contains parentheses and letters, 
remove the minimum number of invalid parentheses to make the input string valid.

Return a list of unique strings that are valid with the minimum number of removals. 
You may return the answer in any order.

**Constraints:**

- `1 <= s.length <= 25`
- `s` consists of lowercase English letters and parentheses `'('` and `')'`.
- There will be at most `20` parentheses in `s`.

## 基礎思路

本題要求從一個同時含有字母與括號的字串中，刪除**最少數量**的非法括號，並列出所有可能的合法結果（不得重複）。
由於括號數量最多僅 20 個，理論上可以列舉所有刪除組合，但樸素的「每個字元刪或不刪」會產生大量重複狀態與無效分支，必須加以壓縮與剪枝。

在思考解法時，可掌握以下核心觀察：

- **最少刪除量可事先確定**：
  只需一次線性掃描即可同時算出「多餘的左括號數」與「多餘的右括號數」，兩者相加即為最少刪除總量。確定了預算，搜尋就從「要刪幾個」變成「把固定預算分配到哪些位置」。

- **連續且相同的括號彼此不可區分**：
  一段連續相同的括號中，刪除哪幾個並不影響結果字串，只有「刪了幾個」才有意義。因此可以先把字串壓縮成一段段極大的同類區塊，讓搜尋分支從「選哪些字元」收斂為「選一個數量」，這正是去除重複答案的關鍵。

- **字母永遠不會被刪除**：
  字母區塊可整段原封不動保留，壓縮後能進一步減少搜尋層數。

- **可行性可用後綴總量提早判斷**：
  若剩餘的括號總數已不足以支付尚未花完的刪除預算，該分支必然失敗；同理，保留的右括號數不可超過當前尚未匹配的左括號數。這兩個條件可將分支範圍直接收斂成一段連續區間。

- **重複片段可預先建表**：
  保留 `k` 個相同括號所形成的字串可事先建表，使每次串接成為常數時間操作，而非逐字重建。

依據以上特性，可以採用以下策略：

- **先一次掃描求出左右括號各自的最少刪除量**，若本來就合法則直接回傳原字串。
- **將字串壓縮為「字母區塊」與「同類括號區塊」兩種 run**，並預計算後綴的左右括號總量作為剪枝依據。
- **以深度優先搜尋逐一決定每個區塊保留幾個括號**，過程中同時維護未匹配的左括號數與兩種刪除預算，並以上下界把每層的迴圈範圍壓到最小。
- **在所有區塊決策完畢且預算剛好用盡、括號完全匹配時收錄答案**，並以集合確保唯一性。

此策略把古典的指數級逐字元搜尋壓縮成極小的決策樹，兼顧正確性與效率。

## 解題步驟

### Step 1：定義括號字元碼與數量上限常數

先定義左右括號的字元碼，以便掃描時以數值比較取代字串比較；同時依約束條件定義括號數量上限，供後續建表使用。

```typescript
const OPEN_PARENTHESIS_CODE = 40;
const CLOSE_PARENTHESIS_CODE = 41;

/** 約束條件允許的括號最大數量。 */
const MAX_PARENTHESES = 20;
```

### Step 2：建立重複括號字串的查表函數

此輔助函數會產生一張表，其中第 `k` 項即為指定括號重複 `k` 次所形成的字串，以逐步累積的方式一次建好。

```typescript
/**
 * 建立重複括號字串的查表。
 *
 * @param character - 欲重複的括號字元。
 * @returns 一張表，其中第 `k` 項為該字元重複 `k` 次的字串。
 */
function buildRunTable(character: string): string[] {
  const table: string[] = new Array(MAX_PARENTHESES + 1);
  let accumulated = '';

  for (let count = 0; count <= MAX_PARENTHESES; count += 1) {
    table[count] = accumulated;
    accumulated += character;
  }

  return table;
}
```

### Step 3：預先建立左右括號的重複字串表

分別為左括號與右括號建表，使後續「保留 `k` 個相同括號」的串接動作成為常數時間。

```typescript
/**
 * 預先計算好的括號重複字串，使保留 `k` 個相同括號的區塊
 * 能以 O(1) 串接，而非逐字重建。
 */
const OPEN_PARENTHESIS_RUNS: string[] = buildRunTable('(');
const CLOSE_PARENTHESIS_RUNS: string[] = buildRunTable(')');
```

### Step 4：單次掃描求出左右括號的最少刪除量

以一次線性掃描模擬匹配過程：遇到左括號則累加未匹配數；遇到右括號時，若有左括號可配對則抵銷，否則該右括號必須被刪除。掃描結束後，剩餘的未匹配左括號數即為左括號的刪除量。

```typescript
const length = s.length;

// 單次掃描：`balance` 最終即為未匹配的 '(' 數量。
let balance = 0;
let closeRemovals = 0;

for (let index = 0; index < length; index += 1) {
  const code = s.charCodeAt(index);

  if (code === OPEN_PARENTHESIS_CODE) {
    balance += 1;
  } else if (code === CLOSE_PARENTHESIS_CODE) {
    if (balance > 0) {
      balance -= 1;
    } else {
      closeRemovals += 1;
    }
  }
}

const openRemovals = balance;
```

### Step 5：處理原字串已合法的情況

若兩種刪除量皆為 0，代表輸入本身已是合法字串，唯一的答案就是它自己，可直接回傳。

```typescript
// 已經合法：無須刪除，輸入本身即為唯一答案。
if (openRemovals === 0 && closeRemovals === 0) {
  return [s];
}
```

### Step 6：將字串壓縮為極大區塊

準備三張表分別記錄每個區塊的種類、長度與文字內容，接著以 `while` 逐段掃描：若起始字元為括號，則向後延伸所有相同的括號並標記種類；若為字母，則向後延伸直到遇到括號為止，並整段保留其文字。

```typescript
// 區塊表：種類 0 = 字母，1 = '(' 區塊，2 = ')' 區塊。
const runKinds = new Uint8Array(length);
const runLengths = new Int32Array(length);
const runTexts: string[] = new Array(length);
let runCount = 0;
let scanIndex = 0;

while (scanIndex < length) {
  const code = s.charCodeAt(scanIndex);
  let end = scanIndex + 1;

  if (code === OPEN_PARENTHESIS_CODE || code === CLOSE_PARENTHESIS_CODE) {
    // 向後延伸所有相同的括號。
    while (end < length && s.charCodeAt(end) === code) {
      end += 1;
    }

    runKinds[runCount] = code === OPEN_PARENTHESIS_CODE ? 1 : 2;
  } else {
    // 向後延伸整個字母區塊，該區塊永遠完整保留。
    while (end < length) {
      const nextCode = s.charCodeAt(end);

      if (nextCode === OPEN_PARENTHESIS_CODE || nextCode === CLOSE_PARENTHESIS_CODE) {
        break;
      }

      end += 1;
    }

    runKinds[runCount] = 0;
    runTexts[runCount] = s.substring(scanIndex, end);
  }

  // ...
}
```

### Step 7：記錄區塊長度並推進掃描位置

每段區塊界定完畢後，記錄其長度、累加區塊數量，並將掃描位置移到該區塊之後，進入下一輪切分。

```typescript
while (scanIndex < length) {
  // Step 6：界定目前區塊的種類與結束位置

  runLengths[runCount] = end - scanIndex;
  runCount += 1;
  scanIndex = end;
}
```

### Step 8：建立後綴的左右括號總量表

由後往前累計每個位置之後仍有多少個左括號與右括號，這兩張表將用於判斷「剩餘括號是否足以支付尚未花完的刪除預算」。

```typescript
// 後綴總量用於對剩餘預算進行可行性剪枝。
const suffixOpens = new Int32Array(runCount + 1);
const suffixCloses = new Int32Array(runCount + 1);

for (let runIndex = runCount - 1; runIndex >= 0; runIndex -= 1) {
  const kind = runKinds[runIndex];

  suffixOpens[runIndex] = suffixOpens[runIndex + 1] + (kind === 1 ? runLengths[runIndex] : 0);
  suffixCloses[runIndex] = suffixCloses[runIndex + 1] + (kind === 2 ? runLengths[runIndex] : 0);
}
```

### Step 9：準備去重用的結果集合

由於不同的刪除配置仍可能產生相同字串，使用集合儲存結果以確保唯一性。

```typescript
const uniqueResults = new Set<string>();
```

### Step 10：定義搜尋函數並處理終止條件

深度優先搜尋逐一決定每個區塊保留幾個括號。當所有區塊都已決策完畢時，必須同時滿足「左括號全部匹配」且「兩種刪除預算皆剛好用盡」，才是一個最少刪除的合法答案。

```typescript
/**
 * 對各區塊進行深度優先搜尋，決定每個區塊保留幾個括號。
 *
 * @param runIndex - 正在決策的區塊索引。
 * @param prefix - 由先前區塊建構出的目前文字。
 * @param openBalance - 已保留但尚未匹配的 '(' 數量。
 * @param openBudget - 尚需刪除的 '(' 數量。
 * @param closeBudget - 尚需刪除的 ')' 數量。
 */
const search = (
  runIndex: number,
  prefix: string,
  openBalance: number,
  openBudget: number,
  closeBudget: number,
): void => {
  if (runIndex === runCount) {
    // 預算用盡且所有保留的 '(' 皆已匹配：此為一組最少刪除的答案。
    if (openBalance === 0 && openBudget === 0 && closeBudget === 0) {
      uniqueResults.add(prefix);
    }

    return;
  }

  // ...
};
```

### Step 11：取出目前區塊資訊並直接保留字母區塊

讀取當前區塊的種類與長度，並預先算出下一個區塊索引。若為字母區塊，則整段原封不動接上，所有狀態維持不變後直接進入下一層。

```typescript
const search = (
  runIndex: number,
  prefix: string,
  openBalance: number,
  openBudget: number,
  closeBudget: number,
): void => {
  // Step 10：處理所有區塊決策完畢的終止條件

  const kind = runKinds[runIndex];
  const runLength = runLengths[runIndex];
  const nextIndex = runIndex + 1;

  if (kind === 0) {
    search(nextIndex, prefix + runTexts[runIndex], openBalance, openBudget, closeBudget);

    return;
  }

  // ...
};
```

### Step 12：枚舉左括號區塊的刪除數量

對左括號區塊，刪除數量的下界來自可行性：若後綴剩餘的左括號不足以支付預算，本區塊就必須先刪掉差額；上界則同時受限於剩餘預算與區塊長度。在此區間內逐一嘗試，並將保留的括號接上、更新未匹配數與預算。

```typescript
const search = (
  runIndex: number,
  prefix: string,
  openBalance: number,
  openBudget: number,
  closeBudget: number,
): void => {
  // Step 10：處理所有區塊決策完畢的終止條件

  // Step 11：取出目前區塊資訊並處理字母區塊

  if (kind === 1) {
    // 刪得比這更少，將使待刪的 '(' 多於後方剩餘的 '('。
    const shortage = openBudget - suffixOpens[nextIndex];
    const minimumRemoved = shortage > 0 ? shortage : 0;
    const maximumRemoved = openBudget < runLength ? openBudget : runLength;

    for (let removed = minimumRemoved; removed <= maximumRemoved; removed += 1) {
      const kept = runLength - removed;

      search(
        nextIndex,
        prefix + OPEN_PARENTHESIS_RUNS[kept],
        openBalance + kept,
        openBudget - removed,
        closeBudget,
      );
    }

    return;
  }

  // ...
};
```

### Step 13：枚舉右括號區塊的刪除數量

右括號區塊的刪除下界有兩個來源：保留數不得超過當前未匹配的左括號數，以及後綴剩餘的右括號必須足以支付待刪預算，取兩者的較大值；上界同樣受限於剩餘預算與區塊長度。在此區間內嘗試各種保留數並遞迴下去。

```typescript
const search = (
  runIndex: number,
  prefix: string,
  openBalance: number,
  openBudget: number,
  closeBudget: number,
): void => {
  // Step 10：處理所有區塊決策完畢的終止條件

  // Step 11：取出目前區塊資訊並處理字母區塊

  // Step 12：枚舉左括號區塊的刪除數量

  // ')' 區塊最多只能保留 `openBalance` 個字元，且必須在後綴中
  // 留下足夠的 ')' 以支付尚未完成的刪除量。
  const balanceShortage = runLength - openBalance;
  const suffixShortage = closeBudget - suffixCloses[nextIndex];
  let minimumRemoved = balanceShortage > 0 ? balanceShortage : 0;

  if (suffixShortage > minimumRemoved) {
    minimumRemoved = suffixShortage;
  }

  const maximumRemoved = closeBudget < runLength ? closeBudget : runLength;

  for (let removed = minimumRemoved; removed <= maximumRemoved; removed += 1) {
    const kept = runLength - removed;

    search(
      nextIndex,
      prefix + CLOSE_PARENTHESIS_RUNS[kept],
      openBalance - kept,
      openBudget,
      closeBudget - removed,
    );
  }
};
```

### Step 14：啟動搜尋並回傳所有唯一答案

以空前綴、零未匹配數與完整的刪除預算啟動搜尋，待所有分支走完後，將集合轉為陣列回傳。

```typescript
search(0, '', 0, openRemovals, closeRemovals);

return Array.from(uniqueResults);
```

## 時間複雜度

- 設字串長度為 $n$、括號總數為 $p$；
- 計算刪除量與壓縮區塊皆為單次線性掃描，為 $O(n)$；
- 搜尋以區塊為單位分配刪除數量，所有分配方式的總數在最壞情況下受括號子集數量所界，為 $O(2^p)$；
- 每條搜尋路徑需沿途串接字串，長度為 $O(n)$；
- 總時間複雜度為 $O(2^p \cdot n)$。

> $O(2^p \cdot n)$

## 空間複雜度

- 區塊表與後綴總量表皆為 $O(n)$；
- 遞迴深度最多為區塊數量 $O(n)$，且每層持有長度 $O(n)$ 的前綴字串，為 $O(n^2)$；
- 不計輸出結果集合所佔用的空間；
- 總空間複雜度為 $O(n^2)$。

> $O(n^2)$
