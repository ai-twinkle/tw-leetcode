# 3093. Longest Common Suffix Queries

You are given two arrays of strings `wordsContainer` and `wordsQuery`.

For each `wordsQuery[i]`, you need to find a string from `wordsContainer` 
that has the longest common suffix with `wordsQuery[i]`. 
If there are two or more strings in `wordsContainer` that share the longest common suffix, 
find the string that is the smallest in length. 
If there are two or more such strings that have the same smallest length, find the one that occurred earlier in `wordsContainer`.

Return an array of integers `ans`, where `ans[i]` is the index of the string in `wordsContainer` 
that has the longest common suffix with `wordsQuery[i]`.

**Constraints:**

- `1 <= wordsContainer.length, wordsQuery.length <= 10^4`
- `1 <= wordsContainer[i].length <= 5 * 10^3`
- `1 <= wordsQuery[i].length <= 5 * 10^3`
- `wordsContainer[i]` consists only of lowercase English letters.
- `wordsQuery[i]` consists only of lowercase English letters.
- Sum of `wordsContainer[i].length` is at most `5 * 10^5`.
- Sum of `wordsQuery[i].length` is at most `5 * 10^5`.

## 基礎思路

本題要求對輸入陣列中的每個正整數計算其十進位的位數和，並回傳所有位數和之中的最小者。在解題時可注意到，數值範圍受到嚴格限制（每個元素皆不超過 $10^4$），因此能利用「值域受限」這個性質做大量預處理。

在思考解法時，可掌握以下核心觀察：

- **數值範圍受限可預先建表**：
  由於任何元素皆不超過某個固定上界，可在程式載入時一次性算好所有可能值的位數和，後續查詢皆能以常數時間完成，且該表可在所有呼叫之間共用。

- **位數和具有遞推性質**：
  任意正整數的位數和，等於「去掉個位數後剩餘部分的位數和」加上「該數的個位數本身」，因此可從小到大逐一推導出整張表，避免每個值都重新拆位。

- **位數和具有明確下界**：
  任何正整數的位數和最少為 1（如 1、10、100 等），因此走訪過程中一旦發現某元素的位數和為 1，即可確定不會有更小的結果，可直接結束。

依此特性，可以採用以下策略：

- **預先建構位數和查表**，使每次查詢皆為常數時間。
- **以單次線性掃描搭配最小值維護**，逐一比對每個元素的位數和並更新目前最小值。
- **觸及理論下界時提前結束**，避免無謂的剩餘走訪。

## 解題步驟

### Step 1：預先建構 1 到 10^4 的位數和查表

在函式之外建立查表，使所有呼叫皆可重複使用；
利用「位數和的遞推性質」由小到大逐一填表，每個值僅需常數時間，避免每次查詢時都重新拆位。

```typescript
// 預先計算 1 到 10^4 的位數和，使所有呼叫皆能以 O(1) 查表
const MAX_DIGIT_SUM_VALUE = 10001;
const digitSumTable = new Uint8Array(MAX_DIGIT_SUM_VALUE);
for (let value = 1; value < MAX_DIGIT_SUM_VALUE; value++) {
  // 以先前已計算的位數和進行遞推，避免每個值都重新跑一次拆位迴圈
  digitSumTable[value] = digitSumTable[(value / 10) | 0] + (value % 10);
}
```

### Step 2：取得陣列長度並初始化最小值上界

以 36 作為最小值的初始上界（限制範圍內任何值的位數和皆不會超過此數，例如 9999 對應 36），確保任何合法輸入的位數和都能順利覆寫初始值。

```typescript
const length = nums.length;
// 36 為限制下任何值可能的最大位數和（例如 9999 對應 36）
let minimum = 36;
```

### Step 3：走訪每個元素並更新最小位數和

依序檢視每個元素，透過查表取得其位數和；
若小於目前最小值則更新，並在最小值降至 1（理論下界）時立刻回傳，避免後續無謂的走訪。

```typescript
for (let index = 0; index < length; index++) {
  const currentSum = digitSumTable[nums[index]];
  if (currentSum < minimum) {
    minimum = currentSum;
    // 提前結束：1 為任何正整數可能的最小位數和
    if (minimum === 1) {
      return 1;
    }
  }
}
```

### Step 4：回傳最終最小位數和

若走訪完整個陣列仍未觸發提前結束，則 `minimum` 已記錄所有元素的位數和之中的最小者，直接回傳即可。

```typescript
return minimum;
```

## 時間複雜度

- 預先建表為一次性 $O(M)$ 動作，其中 $M = 10001$ 為固定常數；
- 每次呼叫需走訪陣列共 $n$ 個元素，且每次查表為 $O(1)$；
- 總時間複雜度為 $O(M + n)$，由於 $M$ 為常數可視為 $O(n)$。

> $O(n)$

## 空間複雜度

- 位數和表佔用 $O(M)$ 空間，其中 $M$ 為固定常數；
- 其餘僅使用固定數量的變數；
- 總空間複雜度為 $O(M)$，由於 $M$ 為常數可視為 $O(1)$。

> $O(1)$
