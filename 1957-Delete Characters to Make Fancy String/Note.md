# 1957. Delete Characters to Make Fancy String

A fancy string is a string where no three consecutive characters are equal.

Given a string `s`, delete the minimum possible number of characters from `s` to make it fancy.

Return the final string after the deletion. 
It can be shown that the answer will always be unique.

**Constraints:**

- `1 <= s.length <= 10^5`
- `s` consists only of lowercase English letters.

## 基礎思路

本題的核心是透過「貪心」的策略，從左到右檢查字串中的每個字元，確保沒有三個連續相同的字元出現。
在檢查過程中，我們需記錄目前字串末尾連續的兩個字元，並根據以下規則決定是否加入當前字元：

- 若當前字元與結果字串的末尾連續兩個字元皆相同，則跳過此字元，以避免出現三連續相同字元的情況。
- 若當前字元與結果字串末尾的連續兩個字元並非皆相同，則可以安全加入結果字串。

透過以上策略，即可保證最少刪除字元以滿足題意，並唯一地決定最終字串的內容。

## 解題步驟

### Step 1：初始化輔助變數

首先設定三個輔助變數：

- `lastCharacter`：紀錄目前結果字串最後加入的字元，初始為一個不在輸入字串中的任意字元。
- `secondLastCharacter`：紀錄結果字串倒數第二個加入的字元，同樣初始為一個不相干的字元。
- `resultString`：用於存放符合題目條件的最終結果。

```typescript
let lastCharacter = '.';        // 結果字串最後加入的字元
let secondLastCharacter = '.';  // 結果字串倒數第二個加入的字元
let resultString = '';          // 存放最終結果字串
```

### Step 2：逐一檢查字元並決定是否加入結果

從左到右遍歷原始字串 `s`，每次判斷當前字元是否會造成三個連續相同字元的狀況：

- 若當前字元與「最後一個」及「倒數第二個」字元相同，則略過此字元（不加入）。
- 否則，加入當前字元到結果字串中，並更新追蹤用的輔助變數。

```typescript
for (let index = 0; index < s.length; index++) {
  const currentCharacter = s[index]; // 取得目前字元
  
  // 若當前字元與前兩個加入的字元相同，則跳過此字元
  if (currentCharacter === lastCharacter && currentCharacter === secondLastCharacter) {
    continue; // 略過此次迴圈，避免三連續字元
  }
  
  // 加入字元並更新紀錄變數
  resultString += currentCharacter;
  secondLastCharacter = lastCharacter;  // 更新倒數第二個字元
  lastCharacter = currentCharacter;     // 更新最後一個字元
}
```

### Step 3：回傳最終結果字串

當迴圈結束後，`resultString` 即為符合題目要求的 fancy string：

```typescript
return resultString;
```

## 時間複雜度

- 需要遍歷一次輸入字串，並對每個字元進行固定次數的判斷與操作，為 $O(n)$。
- 總時間複雜度為 $O(n)$。

> $O(n)$

## 空間複雜度

- 除輸出字串外，只使用常數數量的輔助變數，不額外使用其他資料結構，為 $O(1)$。
- 總空間複雜度為 $O(1)$。

> $O(1)$
