# 17. Letter Combinations of a Phone Number

Given a string containing digits from `2-9` inclusive, 
return all possible letter combinations that the number could represent. 
Return the answer in any order.

A mapping of digits to letters (just like on the telephone buttons) is given below. 
Note that 1 does not map to any letters.

**Constraints:**

- `1 <= digits.length <= 4`
- `digits[i]` is a digit in the range `['2', '9']`.

## 基礎思路

本題要求將一串由 `2` 到 `9` 組成的數字字串，依照電話按鍵上的對應關係，列出所有可能的字母組合。
每個數字對應 3 到 4 個字母，因此組合數量會隨數字長度呈指數成長。

在思考解法時，可掌握以下核心觀察：

- **對應關係固定不變**：
  數字與字母的對應在所有輸入中都相同，可在一開始建好查表結構並重複使用，避免每次呼叫都重新建構。

- **組合具有逐層擴展的結構**：
  處理完前若干個數字後所得的所有組合，都可視為「前綴」。加入下一個數字時，只需將每個前綴分別接上該數字的每個字母，即可得到新一層的完整組合。

- **每層結果的數量可事先精確得知**：
  新一層的組合數量恰好等於「前一層組合數」乘上「當前數字對應的字母數」，因此可預先配置剛好大小的空間，省去動態擴充的成本。

- **空輸入需特別處理**：
  若沒有任何數字，則不存在任何組合，應直接回傳空結果。

依據以上特性，可以採用以下策略：

- **以查表方式取得每個數字對應的字母集合**。
- **以第一個數字的字母作為初始組合**，再逐一處理後續數字。
- **每處理一個數字，就將所有既有前綴與該數字的每個字母配對**，寫入預先配置好大小的新集合，再以新集合取代舊集合。

此策略以迭代方式逐層展開所有組合，不需遞迴，也不會產生多餘的重新配置，效率穩定。

## 解題步驟

### Step 1：預先建立數字到字母的對應表

在函數外建立一次性的查表結構。索引為數字字元的字元碼減去 48，對應 `'0'` 到 `'9'`；其中 `0` 與 `1` 沒有對應字母，以空陣列表示。

```typescript
// 每個數字 '0'-'9' 對應的字母（以字元碼減 48 作為索引），於函數外僅建立一次
const DIGIT_TO_LETTERS: readonly (readonly string[])[] = [
  [], [],
  ["a", "b", "c"], ["d", "e", "f"], ["g", "h", "i"], ["j", "k", "l"],
  ["m", "n", "o"], ["p", "q", "r", "s"], ["t", "u", "v"], ["w", "x", "y", "z"],
];
```

### Step 2：處理空字串的邊界情況

先取得數字字串的長度。若長度為 0，則不存在任何組合，直接回傳空陣列。

```typescript
const digitCount = digits.length;

if (digitCount === 0) {
  return [];
}
```

### Step 3：以第一個數字的字母作為初始組合

透過查表取得第一個數字對應的字母，並以 `slice()` 複製一份，作為後續擴展的初始前綴集合，避免修改到共用的對應表。

```typescript
// 以第一個數字對應的字母作為初始組合
let combinations: string[] = DIGIT_TO_LETTERS[digits.charCodeAt(0) - 48].slice();
```

### Step 4：逐一處理後續數字並預先配置新一層的空間

從第二個數字開始依序處理。每一輪先查出當前數字對應的字母集合，並記錄字母數與前一層的組合數；接著依兩者乘積配置剛好大小的新陣列，並初始化寫入位置。

```typescript
for (let digitIndex = 1; digitIndex < digitCount; digitIndex++) {
  const letters = DIGIT_TO_LETTERS[digits.charCodeAt(digitIndex) - 48];
  const letterCount = letters.length;
  const previousCount = combinations.length;

  // 預先配置精確大小，避免使用 push 以及陣列重新配置
  const nextCombinations: string[] = new Array(previousCount * letterCount);
  let writeIndex = 0;

  // ...
}
```

### Step 5：將每個前綴接上當前數字的所有字母，並以新集合取代舊集合

對前一層的每個組合，依序接上當前數字的每個字母，並寫入新陣列的下一個位置。全部寫入後，以新集合取代舊集合，作為下一輪的前綴。

```typescript
for (let digitIndex = 1; digitIndex < digitCount; digitIndex++) {
  // Step 4：取得當前數字的字母集合並預先配置新一層空間

  for (let previousIndex = 0; previousIndex < previousCount; previousIndex++) {
    const prefix = combinations[previousIndex];

    for (let letterIndex = 0; letterIndex < letterCount; letterIndex++) {
      nextCombinations[writeIndex++] = prefix + letters[letterIndex];
    }
  }

  combinations = nextCombinations;
}
```

### Step 6：回傳所有組合

所有數字處理完畢後，`combinations` 即為完整的字母組合集合，直接回傳。

```typescript
return combinations;
```

## 時間複雜度

- 設數字字串長度為 $n$，每個數字最多對應 4 個字母，最終組合數最多為 $4^n$；
- 第 $i$ 輪會產生最多 $4^i$ 個長度為 $i$ 的字串，各輪成本加總後由最後一輪主導；
- 總時間複雜度為 $O(4^n \cdot n)$。

> $O(4^n \cdot n)$

## 空間複雜度

- 結果集合最多包含 $4^n$ 個長度為 $n$ 的字串；
- 迭代過程中同時存在前一層與新一層兩份集合，前一層的大小不超過新一層；
- 總空間複雜度為 $O(4^n \cdot n)$。

> $O(4^n \cdot n)$
