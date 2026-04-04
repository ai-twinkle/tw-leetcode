# 2075. Decode the Slanted Ciphertext

A string `originalText` is encoded using a slanted transposition cipher to a string `encodedText` 
with the help of a matrix having a fixed number of rows `rows`.

`originalText` is placed first in a top-left to bottom-right manner.

```
\B  R  Y ...
 W \B  R  Y ...
 W  W \B  R  Y ...
 W  W  W \B  R  Y ...
             v
```

The blue cells are filled first, followed by the red cells, then the yellow cells, and so on, 
until we reach the end of `originalText`. 
The `\` and `v` form an arrow indicates the order in which the cells are filled. 
All empty cells are filled with `' '`. 
The number of columns is chosen such that the rightmost column will not be empty after filling in `originalText`.

`encodedText` is then formed by appending all characters of the matrix in a row-wise fashion.

```
 B- B- B- B- B->
 R  R  R  R  R
 .  .  .  .  .
 Y  Y  Y  Y  Y
```

The characters in the blue cells are appended first to `encodedText`, 
then the red cells, and so on, and finally the yellow cells. 
The `-` and `>` form an arrow indicates the order in which the cells are accessed.

For example, if `originalText = "cipher"` and `rows = 3`, then we encode it in the following manner:

```
\c-\h-  -  ->     
  -\i-\e-  ->
  -  -\p-\r->
         v  v
```

The combined `\` and `v` symbols represent diagonal arrows showing how `originalText` is placed,
while the combined `-` and `>` arrows show the horizontal order in which `encodedText` is formed.
In the above example, `encodedText = "ch ie pr"`.

Given the encoded string `encodedText` and number of rows `rows`, return the original string `originalText`.

Note: `originalText` does not have any trailing spaces `' '`. 
The test cases are generated such that there is only one possible `originalText`.

**Constraints:**

- `0 <= encodedText.length <= 10^6`
- `encodedText` consists of lowercase English letters and `' '` only.
- `encodedText` is a valid encoding of some `originalText` that does not have trailing spaces.
- `1 <= rows <= 1000`
- The testcases are generated such that there is only one possible `originalText`.

## 基礎思路

本題要求將一段以「斜向轉置密碼」編碼的字串還原，也就是將編碼過程逆向執行。理解解碼策略的關鍵在於先清楚掌握編碼時的矩陣結構，再以此推算字元的還原順序。

在思考解法時，可掌握以下核心觀察：

- **編碼方式為沿對角線填入，再逐列讀出**：
  原始字串依照從左上到右下的對角線順序排列於矩陣中，再以逐列掃描的方式組成編碼字串；解碼時必須反轉此順序，即從矩陣中沿對角線逐格讀回。

- **矩陣的行數可由編碼字串長度與列數推算**：
  編碼後的字串長度等於矩陣的總格數（列數 × 行數），因此可直接求得行數，不需要額外資訊。

- **對角線之間的起始位置具有規律性**：
  每條對角線在矩陣中的起始行為該對角線的索引，沿線向下每步同時向右移動一格；相鄰對角線的起始行相差一格，這使得遍歷每條對角線的邏輯一致且可參數化。

- **編碼字串中的格子索引可由列號與行號直接計算**：
  在逐列展平的矩陣中，位於第 $r$ 列第 $c$ 行的字元，其在編碼字串中的索引為 $r \times \text{行數} + c$，可以直接定址而無需還原完整矩陣。

- **結尾空白為填充字元，不屬於原始字串**：
  矩陣中未被對角線覆蓋的格子填入空格，解碼後須從尾端去除這些填充空格以還原真正的原始文字。

依據以上特性，可以採用以下策略：

- **直接計算矩陣行數，然後按對角線順序遍歷每個格子，從扁平化的編碼字串中讀取對應字元**，逐一寫入輸出緩衝區。
- **對角線遍歷完成後，從緩衝區尾端移除填充空白**，以確保輸出不含多餘字元。
- **全程使用固定大小的型別陣列作為緩衝區**，避免字串反覆串接造成的效能損耗。

此策略僅需單次掃描所有字元，空間使用亦限定於輸入規模，整體效率可靠。

## 解題步驟

### Step 1：處理邊界情況

若編碼字串為空，可直接回傳空字串；若矩陣只有一列，則對角線退化為水平方向，編碼等同於原文，可直接回傳。

```typescript
const totalLength = encodedText.length;

if (totalLength === 0) {
  return "";
}

// 單列矩陣為恆等變換，無須解碼。
if (rows === 1) {
  return encodedText;
}
```

### Step 2：推算矩陣的行數

編碼後的字串長度等於矩陣總格數（列數 × 行數），因此可用字串長度除以列數的方式求得行數。

```typescript
// 每條對角線橫跨 rows 個字元，相鄰對角線共用 (rows - 1) 行，
// 因此每隔 (rows - 1) 行就有一條新對角線起始。
const totalColumns = Math.ceil(totalLength / rows);
```

### Step 3：建立輸出緩衝區並初始化寫入位置

預先配置一個固定大小的型別陣列作為輸出緩衝區，避免後續字串反覆串接；同時初始化寫入指標，記錄目前已寫入的位置。

```typescript
// 預先配置型別陣列，避免反覆字串串接。
const outputBuffer = new Uint16Array(totalLength);

// outputIndex 追蹤下一個要寫入的位置（依對角線順序）。
let outputIndex = 0;
```

### Step 4：按對角線順序遍歷矩陣並讀取字元

逐一枚舉每條對角線，每條對角線從其對應的起始行出發，沿列方向逐步向下，同時計算出該格子在扁平化編碼字串中的索引並讀取字元；若索引已超出矩陣邊界或字串範圍，則提前結束該對角線的遍歷。

```typescript
// 遍歷每條對角線；第 d 條對角線從矩陣第 d 行起始。
for (let diagonalStart = 0; diagonalStart < totalColumns; diagonalStart++) {
  // 沿此對角線逐列向下走。
  for (let rowIndex = 0; rowIndex < rows; rowIndex++) {
    // 此格在矩陣中所在的行號。
    const column = diagonalStart + rowIndex;

    if (column >= totalColumns) {
      // 對角線已超出矩陣邊界，提前結束。
      break;
    }

    // 扁平化索引：第 r 列第 c 行 → r * totalColumns + c。
    const flatIndex = rowIndex * totalColumns + column;

    if (flatIndex >= totalLength) {
      break;
    }

    outputBuffer[outputIndex] = encodedText.charCodeAt(flatIndex);
    outputIndex++;
  }
}
```

### Step 5：移除尾端填充空白並回傳結果

對角線遍歷結束後，緩衝區尾端可能存有填充用的空白字元；從尾端往前掃描，找到第一個非空白字元的位置，再從緩衝區中切出該範圍並轉回字串回傳。

```typescript
// 不配置中間字串，直接在原緩衝區上修剪尾端空白。
let trimmedEnd = outputIndex;
while (trimmedEnd > 0 && outputBuffer[trimmedEnd - 1] === 32) { // ' ' 的 ASCII 碼為 32。
  trimmedEnd--;
}

return String.fromCharCode(...outputBuffer.subarray(0, trimmedEnd));
```

## 時間複雜度

- 將編碼字串展平至矩陣並按對角線讀取，每個字元恰好被存取一次，共 $n$ 次，其中 $n$ 為 `encodedText` 的長度；
- 尾端空白修剪最多掃描 $n$ 個字元；
- 最終字串建構亦為 $O(n)$。
- 總時間複雜度為 $O(n)$。

> $O(n)$

## 空間複雜度

- 使用一個長度為 $n$ 的型別陣列作為輸出緩衝區；
- 不還原完整矩陣，僅以索引計算定址，無額外二維空間。
- 總空間複雜度為 $O(n)$。

> $O(n)$
