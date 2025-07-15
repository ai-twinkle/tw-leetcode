# 3136. Valid Word

A word is considered valid if:

- It contains a minimum of 3 characters.
- It contains only digits (0-9), and English letters (uppercase and lowercase).
- It includes at least one vowel.
- It includes at least one consonant.

You are given a string `word`.

Return `true` if `word` is valid, otherwise, return `false`.

Notes:

- `'a'`, `'e'`, `'i'`, `'o'`, `'u'`, and their uppercases are vowels.
- A consonant is an English letter that is not a vowel.

**Constraints:**

- `1 <= word.length <= 20`
- `word` consists of English uppercase and lowercase letters, digits, `'@'`, `'#'`, and `'$'`.

## 基礎思路

本題的核心是要確認給定的字串是否符合題目所定義的「有效字串」條件。為達成此目的，我們需要進行以下檢查：

* **長度檢查**：首先確保字串至少包含 3 個字元，若不足則立即回傳 `false`。
* **字元有效性檢查**：檢查每個字元，確保它們僅由英文字母（不區分大小寫）與數字所構成。
* **母音與子音存在性檢查**：確認字串中至少存在一個母音字元與一個子音字元。

基於上述策略，我們可以透過單次掃描整個字串，並且透過設置旗標（flag）來追蹤母音與子音的出現情況，最終根據掃描結果決定字串的有效性。

## 解題步驟

## Step 1：定義輔助集合

為了快速判斷一個字元屬於母音、子音或數字，先定義三個集合：

```typescript
const consonantSet = new Set('bcdfghjklmnpqrstvwxyz'.split('')); // 子音集合
const digitSet = new Set('1234567890'); // 數字集合
const vowelSet = new Set('aeiou'.split('')); // 母音集合
```

### Step 2：字串長度初步檢查

首先判斷字串是否符合最低字元數的要求：

```typescript
if (word.length < 3) {
  // 若字串長度小於 3，則立即回傳 false
  return false;
}
```

### Step 3：字串正規化與旗標初始化

為了簡化後續處理，將整個字串轉換成小寫，並設定旗標變數，用來追蹤母音與子音是否存在：

```typescript
word = word.toLowerCase(); // 將字串轉為小寫，以便統一比對

let hasVowel = false;      // 標記字串中是否出現母音
let hasConsonant = false;  // 標記字串中是否出現子音
```

### Step 4：逐字元檢查與旗標更新

接著，我們透過遍歷字串中的每一個字元，進行字元有效性的判斷：

```typescript
for (const character of word.split('')) {
  // 若發現任何不屬於母音、子音或數字的字元，即視為無效字串
  if (
    !consonantSet.has(character) &&
    !vowelSet.has(character) &&
    !digitSet.has(character)
  ) {
    return false; // 存在非法字元，直接回傳 false
  }

  // 若該字元為母音，將母音旗標設為 true
  hasVowel = hasVowel || vowelSet.has(character);

  // 若該字元為子音，將子音旗標設為 true
  hasConsonant = hasConsonant || consonantSet.has(character);
}
```

### Step 5：根據母音與子音出現情況判斷有效性

完成字串掃描後，根據母音與子音旗標的情況決定最終結果：

```typescript
return hasVowel && hasConsonant; // 當且僅當母音與子音均出現時，回傳 true
```

## 時間複雜度

- 單次掃描字串，且每個字元的檢查操作為常數時間 $O(1)$。
- 總時間複雜度為 $O(n)$。

> $O(n)$

## 空間複雜度

- 除了預設的固定集合外，僅使用數個旗標變數，不隨輸入規模而增加。
- 總空間複雜度為 $O(1)$。

> $O(1)$
