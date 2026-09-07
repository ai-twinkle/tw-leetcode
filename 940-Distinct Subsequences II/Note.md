# 940. Distinct Subsequences II

Given a string `s`, return the number of distinct non-empty subsequences of `s`. 
Since the answer may be very large, return it modulo `10^9 + 7`.

A subsequence of a string is a new string that is formed from the original string 
by deleting some (can be none) of the characters without disturbing the relative positions of the remaining characters. 
(i.e., `"ace"` is a subsequence of `"abcde"` while `"aec"` is not.

**Constraints:**

- `1 <= s.length <= 2000`
- `s` consists of lowercase English letters.

## 基礎思路

本題要求計算一個字串中所有相異且非空的子序列數量，並對 $10^9 + 7$ 取模。難點不在於枚舉本身，而在於「去重」：不同的刪除方式可能產生完全相同的字串，若逐一枚舉再去重，數量將呈指數成長，完全不可行。

在思考解法時，可掌握以下核心觀察：

- **相異子序列可依「結尾字元」分類**：
  任何非空子序列必有一個最後字元，因此可將全體相異子序列按結尾字元切成 26 個互斥的集合，總數即為各集合大小之和。

- **新增一個字元時的擴充關係是封閉的**：
  當處理到某個位置的字元時，所有以該字元結尾的相異子序列，恰好等於「先前所有相異子序列各接上此字元」再加上「此字元單獨成串」。這個關係本身已保證不重複，因為前綴不同則整體必不同。

- **重複字元造成的覆蓋而非疊加**：
  同一個字元若再次出現，新算出的集合會完全涵蓋舊集合（舊集合是新集合的子集），因此正確的更新方式是以新值取代舊值，而非累加；在維護總量時，必須同步扣除該字元先前的舊貢獻。

- **取模運算可用加減修正取代除法**：
  由於每次更新前的中間值都被限制在一個有界區間內，只需單次加上或減去模數即可校正，無須使用較昂貴的取餘運算。

依據以上特性，可以採用以下策略：

- **維護一張以各字元為索引的表格**，記錄目前以該字元結尾的相異子序列數量。
- **維護一個總量**，代表目前已見前綴中的相異子序列總數。
- **由左至右掃描字串**，每讀入一個字元便計算其新的結尾數量，並以「加上新值、扣除舊值」的方式同步更新總量，最後寫回表格。

此策略讓整個計數在單次線性掃描中完成，且天然避免了重複計算。

## 解題步驟

### Step 1：預先定義模數與字元基準常數

先定義取模所需的模數，以及將小寫字母轉換為索引時所用的基準碼點。

```typescript
const DISTINCT_SUBSEQ_MODULO: number = 1000000007;
const DISTINCT_SUBSEQ_CHAR_CODE_A: number = 97;
```

### Step 2：初始化結尾統計表與總量

取得字串長度，並配置一張長度為 26 的統計表，用來記錄以各個字母結尾的相異子序列數量；同時將總量初始化為 0。

```typescript
const length = s.length;

// endingCount[c] 保存以字母 c 結尾的相異子序列數量。
const endingCount = new Int32Array(26);
let total = 0;
```

### Step 3：逐字掃描並計算以當前字母結尾的新數量

由左至右走訪字串，將當前字元轉換為表格索引；接著計算以此字母結尾的新數量，其值為「目前所有相異子序列各接上此字母」再加上「此字母單獨成串」，並在超出模數時做一次減法校正。

```typescript
for (let index = 0; index < length; index++) {
  const letterIndex = s.charCodeAt(index) - DISTINCT_SUBSEQ_CHAR_CODE_A;

  // 既有的每個子序列都可接上此字母，再加上此字母單獨成串。
  let newEndingCount = total + 1;

  if (newEndingCount >= DISTINCT_SUBSEQ_MODULO) {
    newEndingCount -= DISTINCT_SUBSEQ_MODULO;
  }

  // ...
}
```

### Step 4：以新值取代舊值來更新總量

由於新算出的數量會完全覆蓋此字母先前的貢獻，更新總量時必須加上新值並扣除舊值。此時的中間值落在一個有界區間內，因此只需單次加上或減去模數即可完成校正。

```typescript
for (let index = 0; index < length; index++) {
  // Step 3：取得字母索引並計算新的結尾數量

  // 新的數量會取代舊的數量，因此需移除過期的值。
  let updatedTotal = total + newEndingCount - endingCount[letterIndex];

  // 中間值落在 (-MODULO, 2 * MODULO) 之間，因此一次校正即足夠。
  if (updatedTotal < 0) {
    updatedTotal += DISTINCT_SUBSEQ_MODULO;
  } else if (updatedTotal >= DISTINCT_SUBSEQ_MODULO) {
    updatedTotal -= DISTINCT_SUBSEQ_MODULO;
  }

  // ...
}
```

### Step 5：寫回總量與結尾統計表

校正完成後，將新的總量存回，並把此字母的結尾數量更新為新值，供後續字元使用。

```typescript
for (let index = 0; index < length; index++) {
  // Step 3：取得字母索引並計算新的結尾數量

  // Step 4：更新總量並完成取模校正

  total = updatedTotal;
  endingCount[letterIndex] = newEndingCount;
}
```

### Step 6：回傳最終的相異子序列總數

掃描結束後，總量即為所有相異非空子序列的數量（已取模），直接回傳。

```typescript
return total;
```

## 時間複雜度

- 對字串進行單次線性掃描，共 $n$ 次迭代；
- 每次迭代僅執行常數次的加減與比較運算；
- 總時間複雜度為 $O(n)$。

> $O(n)$

## 空間複雜度

- 僅使用固定大小為 26 的結尾統計表；
- 其餘皆為固定數量的純量變數；
- 總空間複雜度為 $O(1)$。

> $O(1)$
