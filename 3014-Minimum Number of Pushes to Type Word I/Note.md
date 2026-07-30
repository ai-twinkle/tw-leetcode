# 3014. Minimum Number of Pushes to Type Word I

You are given a string `word` containing distinct lowercase English letters.

Telephone keypads have keys mapped with distinct collections of lowercase English letters, 
which can be used to form words by pushing them. 
For example, the key 2 is mapped with `["a","b","c"]`, we need to push the key one time to type `"a"`, 
two times to type `"b"`, and three times to type `"c"` .

It is allowed to remap the keys numbered `2` to `9` to distinct collections of letters. 
The keys can be remapped to any amount of letters, but each letter must be mapped to exactly one key. 
You need to find the minimum number of times the keys will be pushed to type the string `word`.

Return the minimum number of pushes needed to type `word` after remapping the keys.

An example mapping of letters to keys on a telephone keypad is given below. 
Note that `1`, `*`, `#`, and `0` do not map to any letters.

**Constraints:**

- `1 <= word.length <= 26`
- `word` consists of lowercase English letters.
- All letters in `word` are distinct.

## 基礎思路

本題要求在可自由重新映射電話鍵盤（按鍵 `2` 至 `9`，共 8 個可用按鍵）的前提下，找出輸入一個由相異小寫字母組成的字串所需的最少總按鍵次數。由於每個字母只出現一次，因此輸入成本僅取決於字母數量，而與字母種類或順序無關。

在思考解法時，可掌握以下核心觀察：

- **按鍵次數取決於字母在按鍵上的排序位置**：
  每個按鍵上的第一個字母只需按一次，第二個字母需按兩次，第三個需按三次，以此類推。因此，越晚被分配到的字母，其按鍵成本越高。

- **貪婪地分層填滿所有按鍵最為划算**：
  為了讓總成本最小，應優先把所有按鍵的第一層位置填滿（每個字母只需一次），再填第二層（每個字母兩次），依序推進。如此可確保高成本的位置盡量晚被使用。

- **每個位置的成本存在固定規律**：
  若以零基索引排列字母，第 `i` 個字母恰好落在第 `(i / 8) + 1` 輪，因此其成本即為 `(i / 8) + 1` 次。此規律不受具體字母影響，只與位置有關。

- **答案僅由字串長度決定**：
  因為所有字母皆相異，字串長度即為相異字母的數量，故可直接依長度查表得出答案。

依據以上特性，可以採用以下策略：

- **預先建立一張以字母數量為索引的查表**，在模組載入時一次性計算完成，涵蓋所有可能的長度。
- **累加每個位置的按鍵成本**，利用分層填滿的規律逐步累積出各長度對應的最小總按鍵次數。
- **查詢時僅需以字串長度作為索引取值**，即可在常數時間內回傳答案。

此策略將重複計算完全轉移至預處理階段，使每次查詢皆能以極高效率完成。

## 解題步驟

### Step 1：預先建構以字母數量為索引的查表

在模組載入時，透過立即執行函數建立一張大小為 27 的查表（涵蓋長度 0 至 26），並準備一個累積變數。逐位走訪 26 個字母位置，利用右移 3 位（等同整除 8）計算目前字母所處的輪次，將該位置成本累加至總和後寫入對應長度的位置，最後回傳完整查表供後續查詢使用。

```typescript
/**
 * 以字串長度為索引的查表，於模組載入時建構一次。
 * 索引 i 儲存長度為 i 個相異字母的字串所需的最少按鍵次數。
 * 字母以輪為單位橫跨 8 個可用按鍵依序填入，因此位於零基
 * 位置 i 的字母，其成本恆為 (i / 8 | 0) + 1 次。
 */
const MINIMUM_PUSHES_BY_LENGTH = ((): Uint8Array => {
  const table = new Uint8Array(27);
  let runningTotal = 0;

  for (let letterIndex = 0; letterIndex < 26; letterIndex++) {
    // 右移 3 位等同於精確整除 8，得出目前所在的按鍵輪次。
    runningTotal += (letterIndex >> 3) + 1;
    table[letterIndex + 1] = runningTotal;
  }

  return table;
})();
```

### Step 2：依字串長度查表回傳最小按鍵次數

由於所有字母皆相異，字串長度即等於相異字母數量，因此直接以長度作為索引，於查表中取得對應的最小按鍵次數並回傳。

```typescript
// 字母相異保證字串長度即等於相異字母的數量。
return MINIMUM_PUSHES_BY_LENGTH[word.length];
```

## 時間複雜度

- 查表建構於模組載入時進行，固定走訪 26 個位置，為一次性的常數成本；
- 每次查詢僅為單次索引存取，不受輸入內容影響。
- 總時間複雜度為 $O(1)$。

> $O(1)$

## 空間複雜度

- 查表大小固定為 27 個位元組，不隨輸入規模成長；
- 查詢過程未使用任何額外動態空間。
- 總空間複雜度為 $O(1)$。

> $O(1)$
