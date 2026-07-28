# 3517. Smallest Palindromic Rearrangement I

You are given a palindromic string `s`.

Return the lexicographically smallest palindromic permutation of `s`.

**Constraints:**

- `1 <= s.length <= 10^5`
- `s` consists of lowercase English letters.
- `s` is guaranteed to be palindromic.

## 基礎思路

本題給定一個保證為迴文的字串 `s`，要求回傳能由其字元重新排列而成、且字典序最小的迴文字串。

在思考解法時，可掌握以下核心觀察：

- **迴文的對稱性讓我們只需關注一半**：
  由於字串本身已保證為迴文，每個字元出現的次數在左右兩側是鏡像對稱的。因此只要統計前半段的字元分布，即可得到每個字元在半邊應出現的數量。

- **字典序最小等價於字元由小到大排列**：
  要使迴文字典序最小，前半段必須讓較小的字元盡量靠前。因此只要將字元依字母順序由小到大依序填入前半段，再鏡像至後半段，即可得到最小迴文。

- **奇數長度的中心字元是被唯一決定的**：
  當長度為奇數時，正中央的字元是唯一出現奇數次的字元，其位置固定不變，不影響前後兩半的排列。

- **對稱填寫可一次完成兩側**：
  由於每個字元區塊在前半與後半是對稱的，填寫某字元於前半的一段時，即可同時將對應區段鏡像填入後半，節省重複掃描。

依據以上特性，可以採用以下策略：

- **僅掃描前半段以統計各字元的半邊數量**，善用迴文的對稱性避免重複計算。
- **依字母順序由小到大填入前半段，並同步鏡像填入後半段**，以構造出字典序最小的迴文。
- **針對奇數長度，先固定中心字元**，確保最終結果合法且對稱。

此策略能在線性時間內完成整個迴文的重建，兼具效率與正確性。

## 解題步驟

### Step 1：預先定義常數與共用解碼器

在進入主要邏輯前，先定義字母表大小與小寫字母 `a` 的字元碼作為計算基準，並建立單一的 latin1 解碼器實例，避免每次呼叫時重複建立而造成額外開銷。

```typescript
const ALPHABET_SIZE = 26;
const LOWERCASE_A_CODE = 97;

// 單一解碼器實例可避免每次呼叫時重新建立
const latin1Decoder = new TextDecoder("latin1");
```

### Step 2：處理長度過短的邊界情況

若字串長度為 0 或 1，其排列方式唯一，直接回傳原字串即可。

```typescript
const length = s.length;

// 長度為 0 或 1 的字串只有唯一一種排列方式
if (length < 2) {
  return s;
}
```

### Step 3：計算半邊長度並統計前半段字元數量

取字串長度的一半作為半邊長度，並建立計數陣列。由於輸入保證為迴文，只需掃描前半段，即可得到每個字元的半邊數量（即 `floor(count / 2)`）。

```typescript
const halfLength = length >> 1;
const halfCounts = new Int32Array(ALPHABET_SIZE);

// 輸入保證為迴文，因此只掃描前半段
// 即可得到每個字元的 floor(count / 2)
for (let index = 0; index < halfLength; index++) {
  halfCounts[s.charCodeAt(index) - LOWERCASE_A_CODE]++;
}
```

### Step 4：建立輸出緩衝區並處理奇數長度的中心字元

配置一個位元組陣列作為輸出緩衝區。若長度為奇數，正中央的字元是唯一出現奇數次的字元，其位置固定，先行填入。

```typescript
const output = new Uint8Array(length);

// 對於奇數長度，中心字元是被唯一決定的：它是唯一出現奇數次的字元
if ((length & 1) === 1) {
  output[halfLength] = s.charCodeAt(halfLength);
}
```

### Step 5：依字母順序由小到大填入各字元區塊

初始化寫入位置後，依字母順序遍歷所有字元。若某字元的半邊數量為 0 則跳過，否則進入實際的填寫邏輯。

```typescript
let writeIndex = 0;

// 依升序輸出字元，並在單次遍歷中將每個區塊鏡像至尾端
for (let letter = 0; letter < ALPHABET_SIZE; letter++) {
  const count = halfCounts[letter];

  if (count === 0) {
    continue;
  }

  // ...
}
```

### Step 6：對稱填寫前半段與後半段對應區塊

計算目前字元的區塊在前半段的結束位置後，以原生填充方式一次性將該字元填入前半段的對應區段，並同步鏡像填入後半段的對應區段，最後更新寫入位置。

```typescript
for (let letter = 0; letter < ALPHABET_SIZE; letter++) {
  // Step 5：取得計數並跳過數量為 0 的字元

  const characterCode = letter + LOWERCASE_A_CODE;
  const nextIndex = writeIndex + count;

  // 原生 memset 式填充遠比逐字元寫入更有效率
  output.fill(characterCode, writeIndex, nextIndex);
  output.fill(characterCode, length - nextIndex, length - writeIndex);

  writeIndex = nextIndex;
}
```

### Step 7：解碼輸出緩衝區並回傳結果

所有字元填寫完成後，使用 latin1 解碼器將位元組陣列轉為字串並回傳。

```typescript
return latin1Decoder.decode(output);
```

## 時間複雜度

- 統計前半段字元需掃描 `n / 2` 個字元，為 $O(n)$；
- 依字母順序填寫時，各字元區塊的總填充長度合計為 `n`，故為 $O(n)$；
- 字母種類為常數 26，不影響整體級數。
- 總時間複雜度為 $O(n)$。

> $O(n)$

## 空間複雜度

- 計數陣列大小固定為 26，為常數空間；
- 輸出緩衝區需儲存 `n` 個位元組，為 $O(n)$。
- 總空間複雜度為 $O(n)$。

> $O(n)$
