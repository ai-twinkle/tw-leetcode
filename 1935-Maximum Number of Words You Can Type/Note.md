# 1935. Maximum Number of Words You Can Type

There is a malfunctioning keyboard where some letter keys do not work. 
All other keys on the keyboard work properly.

Given a string `text` of words separated by a single space (no leading or trailing spaces) and a string `brokenLetters` of all distinct letter keys that are broken, 
return the number of words in `text` you can fully type using this keyboard.

**Constraints:**

- `1 <= text.length <= 10^4`
- `0 <= brokenLetters.length <= 26`
- `text` consists of words separated by a single space without any leading or trailing spaces.
- Each word only consists of lowercase English letters.
- `brokenLetters` consists of distinct lowercase English letters.

## 基礎思路

題目要求計算在一個字串中，有多少單字可以完整輸入，而限制在於部分字母鍵已經壞掉。

我們可以從以下幾點出發：

- 一個單字若包含任何壞掉的字母，就不能被完整輸入；反之，若不包含壞字母，則可輸入。
- 字串以空白分隔單字，因此只要逐一檢查每個單字是否含有壞字母，就能決定該單字是否有效。
- 為了避免多次重複比對，可以事先把壞字母整理好，使得每次檢查單字時都能快速判斷。
- 在檢查過程中，逐一累計可以完整輸入的單字數量。
- 最後別忘了處理字串末尾的單字，因為最後一個單字後面不會再有空白。

透過這樣的策略，我們能在線性時間內完成計算，並且僅需固定額外空間。

## 解題步驟

### Step 1：特判沒有壞鍵的情況（全部單字都可輸入）

若 `brokenLetters` 為空，代表所有字母鍵可用；此時答案就是「單字數量」，也就是**空白數 + 1**。

```typescript
// 情況 1：沒有壞鍵，所有單字皆可輸入
if (brokenLetters.length === 0) {
  let spaceCount = 0;
  for (let i = 0; i < text.length; i++) {
    if (text.charCodeAt(i) === 32) {
      // 發現空白（ASCII 32）
      spaceCount++;
    }
  }
  return spaceCount + 1; // 單字數 = 空白數 + 1
}
```

### Step 2：建立壞字母查表（`brokenMap`）

把 `brokenLetters` 轉成 `Uint8Array(26)` 的查表，`brokenMap[c - 'a']` 為 1 表示該字母壞掉。

```typescript
// 建立壞鍵查表
const brokenMap = new Uint8Array(26);
for (let i = 0; i < brokenLetters.length; i++) {
  const index = brokenLetters.charCodeAt(i) - 97; // 將 'a' 到 'z' 映射為 0 到 25
  brokenMap[index] = 1;
}
```

### Step 3：單趟掃描 `text`，逐字判定單字有效性

用兩個變數：

- `typableWords`：可輸入單字數量
- `currentWordIsValid`：目前掃描中的單字是否仍有效（尚未遇到壞字母）

掃描每個字元：

- 遇到空白：一個單字結束，若 `currentWordIsValid` 為真就累計，並重置為真以準備下一個單字。
- 遇到字母：若尚未失效，檢查是否壞字母；若是則把 `currentWordIsValid` 設為假。

```typescript
let typableWords = 0;
let currentWordIsValid = true;

// 單趟掃描：逐字檢查並標記單字是否有效
for (let i = 0; i < text.length; i++) {
  const code = text.charCodeAt(i);

  if (code === 32) {
    // 單字結束
    if (currentWordIsValid) {
      typableWords++;
    }
    currentWordIsValid = true; // 重置，準備下一個單字
  } else {
    if (currentWordIsValid) {
      const index = code - 97;
      if (brokenMap[index] === 1) {
        // 此單字包含壞鍵字母
        currentWordIsValid = false;
      }
    }
  }
}
```

### Step 4：處理結尾最後一個單字（沒有尾隨空白）

字串結尾不會有空白，因此最後一個單字需要在掃描完成後補判一次。

```typescript
// 處理最後一個單字（結尾沒有空白）
if (currentWordIsValid) {
  typableWords++;
}

return typableWords;
```

## 時間複雜度

- 建立壞字母查表最多處理 26 個字元，為常數時間。
- 單趟掃描 `text` 的長度為 $n$，每步檢查與更新為常數操作。
- 總時間複雜度為 $O(n)$。

> $O(n)$

## 空間複雜度

- 使用一個固定大小的陣列 `Uint8Array(26)` 作為查表，以及少量計數與旗標變數。
- 不隨輸入長度成長的額外空間。
- 總空間複雜度為 $O(1)$。

> $O(1)$
