# 3016. Minimum Number of Pushes to Type Word II

You are given a string `word` containing lowercase English letters.

Telephone keypads have keys mapped with distinct collections of lowercase English letters, 
which can be used to form words by pushing them. 
For example, the key 2 is mapped with `["a","b","c"]`, we need to push the key one time to type `"a"`, 
two times to type `"b"`, and three times to type `"c"`.

It is allowed to remap the keys numbered `2` to `9` to distinct collections of letters. 
The keys can be remapped to any amount of letters, but each letter must be mapped to exactly one key. 
You need to find the minimum number of times the keys will be pushed to type the string `word`.

Return the minimum number of pushes needed to type `word` after remapping the keys.

An example mapping of letters to keys on a telephone keypad is given below. 
Note that `1`, `*`, `#`, and `0` do not map to any letters.

**Constraints:**

- `1 <= word.length <= 10^5`
- `word` consists of lowercase English letters.

## 基礎思路

本題要求在可自由重映射電話鍵盤按鍵（數字 `2` 到 `9`）的前提下，找出輸入指定字串所需的最少按壓次數。由於每個按鍵可對應任意數量的字母，但每個字母僅能對應到唯一按鍵，因此問題的關鍵在於如何安排字母與按鍵槽位的對應關係，使總按壓成本最小。

在思考解法時，可掌握以下核心觀察：

- **按壓成本由槽位順序決定**：
  每個按鍵的第一個字母需按 1 次、第二個字母需按 2 次，依此類推。由於共有 8 個可用按鍵，因此最便宜的 8 個槽位皆為 1 次按壓，接下來的 8 個為 2 次，再接下來 8 個為 3 次，最後餘下的為 4 次。

- **貪心分配為最佳策略**：
  為使總成本最小，出現次數越多的字母應優先分配到越便宜的槽位。此為典型的貪心排序問題，將字母依出現頻率由高至低排序後，逐一對應到成本遞增的槽位即為最佳解。

- **字母種類固定為 26 種**：
  由於僅有小寫英文字母，字母種類為常數上限，因此頻率統計與排序皆可在固定規模下完成，不隨字串長度增長。

依據以上特性，可以採用以下策略：

- **先以單次掃描統計每個字母的出現次數**。
- **將出現次數由高至低排序**，使高頻字母優先取得低成本槽位。
- **依照排名對應預先計算好的按壓成本表，累加得出總按壓次數**。

此策略能在線性時間內完成字母統計，並以固定規模的排序與累加得出最小按壓次數。

## 解題步驟

### Step 1：統計每個字母的出現次數

先取得字串長度，並以一個 26 格的陣列統計各字母出現的次數；透過 `charCodeAt` 直接以字元碼定位對應槽位，避免額外配置子字串。

```typescript
const wordLength = word.length;
const letterCounts = new Int32Array(26);

// 單次掃描統計；使用 charCodeAt 可避免為每個字元配置子字串
for (let index = 0; index < wordLength; index++) {
  letterCounts[word.charCodeAt(index) - 97]++;
}
```

### Step 2：將出現次數由高至低排序

對固定的 26 格陣列進行由大到小的插入排序；由於規模固定且不需比較器函式呼叫，可省去額外的呼叫開銷。

```typescript
// 對固定 26 格陣列進行由大到小的插入排序：無比較器呼叫開銷
for (let current = 1; current < 26; current++) {
  const value = letterCounts[current];
  let position = current - 1;

  while (position >= 0 && letterCounts[position] < value) {
    letterCounts[position + 1] = letterCounts[position];
    position--;
  }

  letterCounts[position + 1] = value;
}
```

### Step 3：依排名累加按壓成本

初始化總按壓次數，接著依照排名走訪每個字母；出現次數越高的字母對應越便宜的槽位。當遇到出現次數為 0 時，代表後續字母皆未出現，可提前結束。

```typescript
let totalPushes = 0;

// 高頻字母取得最便宜的鍵盤槽位；出現次數為 0 代表有效範圍結束
for (let rank = 0; rank < 26; rank++) {
  const count = letterCounts[rank];

  if (count === 0) {
    break;
  }

  totalPushes += count * PUSH_COST_BY_RANK[rank];
}

return totalPushes;
```

## 時間複雜度

- 統計字母出現次數需掃描整個字串，花費 $O(n)$；
- 排序與累加皆在固定 26 格的規模下進行，為常數時間 $O(1)$。
- 總時間複雜度為 $O(n)$。

> $O(n)$

## 空間複雜度

- 僅使用固定大小的統計陣列與少數變數；
- 不隨字串長度增長而配置額外空間。
- 總空間複雜度為 $O(1)$。

> $O(1)$
