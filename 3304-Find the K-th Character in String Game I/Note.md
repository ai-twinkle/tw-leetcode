# 3304. Find the K-th Character in String Game I

Alice and Bob are playing a game. 
Initially, Alice has a string `word = "a"`.

You are given a positive integer `k`.

Now Bob will ask Alice to perform the following operation forever:

- Generate a new string by changing each character in `word` to its next character in the English alphabet, and append it to the original `word`.

For example, performing the operation on `"c"` generates `"cd"` and performing the operation on `"zb"` generates `"zbac"`.

Return the value of the $k^{th}$ character in `word`, after enough operations have been done for `word` to have at least `k` characters.

Note that the character `'z'` can be changed to `'a'` in the operation.

**Constraints:**

- `1 <= k <= 500`

## 基礎思路

本題的核心策略是分析題目中每次「字串成長」操作的規律，透過觀察以下特性：

- 初始字串為 `"a"`，每一次操作將字串長度翻倍。
- 每次新增的右半段字串，會是左半段字串的每個字元依照英文字母順序往後移動一個位置（如 `"a"` 變成 `"ab"`、`"ab"` 變成 `"ab bc"`）。
- 因此，我們可以用「逆向推導」的方式，從題目要求的第 `k` 個位置逐步回推到原始位置，藉此計算此位置上的字元總共被向後推進了多少次（記為 `increment`）。
- 最終，再利用英文字母共 26 個的循環特性（例如 `'z'` 的下一個字母回到 `'a'`），從 `'a'` 出發，根據總推進次數計算出第 `k` 個位置的字元。

因此，我們可以利用以下步驟來解決問題：

- **向上逆推**：從第 `k` 個字元位置往回反推，逐層確認它位於字串的左半段或右半段。
- **計算字元推進次數**：每次向上反推若位於右半段，則增加推進次數。
- **字母循環計算**：最終以推進次數對 26 取餘，得到實際的字元位置。

## 解題步驟

### Step 1：初始化輔助變數與尋找涵蓋位置 `k` 的字串長度

- `increment` 用來紀錄向後推移的次數。
- `left` 是當前世代的字串長度，初始為 1 (`"a"` 的長度)。
- 此步驟找到第一個長度足夠大（`left >= k`）的字串世代。


```typescript
let increment = 0;  // 計算字元總共被推進的次數
let left = 1;       // 初始字串長度為 1 (第0代字串)

// 找出足以涵蓋位置 k 的字串長度（第n代）
while (left < k) {
  left *= 2;
}
```
### Step 2：逆向反推位置 `k` 所處的字串世代並統計推進次數

- 每次檢查位置 `k` 是否超過字串一半：
    - 若超過（即在右半段），則表示該字元曾被推進一個字母，累計一次推進次數 `increment++`。
    - 調整 `k` 至上一代對應位置繼續向上反推。
- 將 `left` 長度減半，以反推至上一世代，持續直到回到初始字串（長度為1）。

```typescript
// 開始逆向反推，逐步回到最初的字串
while (left > 1) {
  let half = left / 2;  // 計算字串中點
  if (k > half) {       // 若位於右半段，則字元曾被推進一次
    increment += 1;
    k -= half;          // 更新k到上一代的位置
  }
  left = half;          // 將字串長度縮減為上一代的長度
}
```

### Step 3：根據推進次數計算最終字元

- 使用 ASCII 編碼計算最終字元：
    - 英文小寫字母 `'a'` 的 ASCII 編碼為 97。
    - 利用模運算 (`increment % 26`) 確保推進循環不超過26個字母的範圍。
    - 最後轉換回相應的英文字母。

```typescript
// 從字元 'a' 開始，計算推進 increment 次後的字元
let code = increment % 26;
return String.fromCharCode(97 + code);
```

## 時間複雜度

- 兩個主要迴圈各需 $O(\log k)$ 時間（字串長度每次倍增或減半）。
- 總時間複雜度為 $O(\log k)$。

> $O(\log k)$

## 空間複雜度

- 使用了固定數量的輔助變數，未使用額外動態空間。
- 總空間複雜度為 $O(1)$。

> $O(1)$
