# 6. Zigzag Conversion

The string `"PAYPALISHIRING"` is written in a zigzag pattern on a given number of rows like this: 
(you may want to display this pattern in a fixed font for better legibility)

```
P   A   H   N
A P L S I I G
Y   I   R
```

And then read line by line: `"PAHNAPLSIIGYIR"`

Write the code that will take a string and make this conversion given a number of rows:

> string convert(string s, int numRows);

**Constraints:**

- `1 <= s.length <= 1000`
- `s` consists of English letters (lower-case and upper-case), `','` and `'.'`.
- `1 <= numRows <= 1000`

## 基礎思路

本題要求將字串按照指定行數以 **Zigzag（之字形）排列**，再依照「逐行讀取」的順序組合成新的字串。關鍵在於理解 Zigzag 排列的行走規律，而不必真的建立二維矩陣。

可掌握以下核心觀察：

* **Zigzag 排列的本質是一條在行之間來回移動的路徑**
  字元會從第 0 行一路向下走到最後一行，之後再向上回到第 0 行，形成重複的「下 → 上」循環。

* **每個字元只會被放入某一行的結果序列中**
  因此只需為每一行維護一個字串容器，將對應字元依序加入即可。

* **方向在邊界行發生反轉**
  當走到最上方行時，路徑必定開始向下；
  當走到最下方行時，路徑必定開始向上。

* **最終結果只是把所有行依序串接**
  Zigzag 排列完成後，只需按照行順序將每一行的字串連接起來即可得到答案。

依據上述觀察，整體策略如下：

* 若只有一行或行數大於等於字串長度，排列不會產生 Zigzag 變化，可直接回傳原字串。
* 建立一個陣列存放每一行的字串。
* 逐字掃描字串，按照目前行索引將字元加入對應行。
* 在到達最上或最下行時反轉行進方向。
* 最後依序合併所有行字串形成結果。

## 解題步驟

### Step 1：取得字串長度並處理不需要 Zigzag 的情況

若只有一行，或行數大於等於字串長度，則所有字元本來就會落在同一垂直方向，Zigzag 不會產生任何變化，可直接回傳原字串。

```typescript
const length = s.length;

// 當只有一行時不需要 Zigzag 轉換
// 或當每個字元都能放入不同的行時也不會產生 Zigzag。
if (numRows === 1 || numRows >= length) {
  return s;
}
```

### Step 2：建立行容器並計算最後一行索引

建立一個陣列用來儲存每一行的字串，並先計算最後一行的索引，方便後續判斷何時需要反轉方向。

```typescript
const lastRow = numRows - 1;
const rows = new Array<string>(numRows);
```

### Step 3：初始化每一行的字串容器

在正式填入字元之前，先將每一行初始化為空字串，讓後續能直接進行字串累加。

```typescript
// 初始化每一行為空字串，方便後續追加字元。
for (let row = 0; row < numRows; row++) {
  rows[row] = "";
}
```

### Step 4：初始化目前所在行與移動方向

需要兩個狀態變數：

* `currentRow`：目前字元應該放入的行
* `rowStep`：目前移動方向（向下為 `1`，向上為 `-1`）

```typescript
let currentRow = 0;
let rowStep = 1;
```

### Step 5：逐字掃描並加入對應的 Zigzag 行

開始走訪整個字串，將每個字元加入目前所在行。

```typescript
for (let index = 0; index < length; index++) {
  // 將目前字元加入對應的 Zigzag 行
  rows[currentRow] += s[index];

  // ...
}
```

### Step 6：在最上與最下行時反轉移動方向

當路徑到達邊界行時，需要改變方向：

* 到達第 0 行 → 開始向下
* 到達最後一行 → 開始向上

```typescript
for (let index = 0; index < length; index++) {
  // Step 5：加入字元到目前行

  // 在最上方行時反轉方向，開始向下移動
  if (currentRow === 0) {
    rowStep = 1;
  } else if (currentRow === lastRow) {
    // 在最下方行時反轉方向，開始向上移動
    rowStep = -1;
  }

  // ...
}
```

### Step 7：根據目前方向移動到下一行

在方向確定後，更新目前行索引，使下一個字元落在正確的行。

```typescript
for (let index = 0; index < length; index++) {
  // Step 5：加入字元到目前行

  // Step 6：在邊界行反轉方向

  // 根據目前方向移動到下一行
  currentRow += rowStep;
}
```

### Step 8：依序合併所有行字串形成最終結果

當所有字元都完成 Zigzag 分配後，只需依序將每一行字串串接即可得到最終答案。

```typescript
// 將所有行依序串接形成最終 Zigzag 讀取結果
return rows.join("");
```

## 時間複雜度

- 需要掃描整個字串一次並將每個字元加入對應行，耗時為 $O(n)$。
- 最後串接所有行字串也需要處理所有字元一次。
- 總時間複雜度為 $O(n)$。

> $O(n)$

## 空間複雜度

- 需要建立一個大小為 `numRows` 的陣列來儲存各行字串。
- 最終結果字串長度為 `n`。
- 總空間複雜度為 $O(n)$。

> $O(n)$
