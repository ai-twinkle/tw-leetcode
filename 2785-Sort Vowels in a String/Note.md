# 2785. Sort Vowels in a String

Given a 0-indexed string `s`, permute `s` to get a new string `t` such that:

- All consonants remain in their original places. 
  More formally, if there is an index `i` with `0 <= i < s`.length such that `s[i]` is a consonant, then `t[i] = s[i]`.
- The vowels must be sorted in the nondecreasing order of their ASCII values. 
  More formally, for pairs of indices `i`, `j` with `0 <= i < j < s.length` such that `s[i]` and `s[j]` are vowels, 
  then `t[i]` must not have a higher ASCII value than `t[j]`.

Return the resulting string.

The vowels are `'a'`, `'e'`, `'i'`, `'o'`, and `'u'`, and they can appear in lowercase or uppercase. 
Consonants comprise all letters that are not vowels.

**Constraints:**

- `1 <= s.length <= 10^5`
- `s` consists only of letters of the English alphabet in uppercase and lowercase.

## 基礎思路

本題目標是在不改變子音位置的前提下，將母音依 ASCII 值**非遞減順序**重新排列。為了做到這點，我們可以使用**計數排序**的方式處理母音：

1. 掃描整個字串，將母音的出現次數依照 ASCII 順序分類至 10 個桶中。
2. 同時紀錄哪些位置是母音，以便稍後重建字串時保留子音原位。
3. 最後再掃描一次字串，子音保留原字，遇到母音則從桶中依序填入最小 ASCII 母音。

這種方法比直接抽出母音陣列後排序再填回（需要 $O(k \log k)$ 時間）更高效，因為母音種類固定為 10 種，可於 **$O(n)$ 時間與 $O(n)$ 空間** 完成。

## 解題步驟

### Step 1：建立母音查表與母音序列

我們先建立一個大小為 128 的陣列（對應 ASCII 碼），將母音對應到 `0 ~ 9` 的索引值，其餘字元填入 `-1`。同時準備一個母音字元陣列，按照 ASCII 排序排列，用來在重建字串時依序放入。

```typescript
// 建立 ASCII 對應的母音索引映射表；若非母音則為 -1
const VOWEL_INDEX = (() => {
  const vowelIndexTable = new Int8Array(128);
  vowelIndexTable.fill(-1);

  // 依 ASCII 排序順序將母音對應至 0 ~ 9
  vowelIndexTable[65] = 0;   // 'A'
  vowelIndexTable[69] = 1;   // 'E'
  vowelIndexTable[73] = 2;   // 'I'
  vowelIndexTable[79] = 3;   // 'O'
  vowelIndexTable[85] = 4;   // 'U'
  vowelIndexTable[97] = 5;   // 'a'
  vowelIndexTable[101] = 6;  // 'e'
  vowelIndexTable[105] = 7;  // 'i'
  vowelIndexTable[111] = 8;  // 'o'
  vowelIndexTable[117] = 9;  // 'u'

  return vowelIndexTable;
})();

// 母音字元表（依照 ASCII 非遞減排序）
const VOWEL_CHARACTERS = ['A', 'E', 'I', 'O', 'U', 'a', 'e', 'i', 'o', 'u'];
```

### Step 2：處理特殊情況

若字串長度小於等於 1，無需處理，直接回傳。

```typescript
const stringLength = inputString.length;

if (stringLength <= 1) {
  return inputString;
}
```

### Step 3：建立計數桶與位置遮罩

建立一個長度為 10 的陣列來記錄每種母音的出現次數，並建立一個布林遮罩陣列來標記字串中哪些位置是母音。

```typescript
// 依照母音索引統計每種母音出現次數（共 10 種）
const vowelCountByIndex = new Uint32Array(10);

// 紀錄哪些位置是母音，避免第二次掃描時重複呼叫 charCodeAt
const vowelPositionMask = new Uint8Array(stringLength);
```

### Step 4：第一次遍歷字串，統計母音出現情況

在第一次遍歷中，我們透過 `charCodeAt` 查表判斷是否為母音；若是母音則增加計數，並在遮罩陣列中標記。

```typescript
// 第一次遍歷：計算每種母音出現次數，並記錄母音位置
for (let characterIndex = 0; characterIndex < stringLength; characterIndex++) {
  const characterCode = inputString.charCodeAt(characterIndex); // 題目保證輸入為英文字母

  let vowelIndex = -1;
  if (characterCode < 128) {
    vowelIndex = VOWEL_INDEX[characterCode];
  }

  if (vowelIndex >= 0) {
    vowelCountByIndex[vowelIndex]++;
    vowelPositionMask[characterIndex] = 1;
  }
}
```

### Step 5：第二次遍歷，重建字串

在第二次遍歷時，我們建立輸出陣列。若當前位置是子音，直接複製原字；若是母音，則從當前桶取出一個母音字元，並將桶數減一。指標會持續往後移，直到找到下一個非空母音桶。

```typescript
// 第二次遍歷：固定子音位置，依序插入已排序的母音
const outputCharacters: string[] = new Array(stringLength);
let vowelBucketPointer = 0; // 指向目前要取出的母音桶索引

for (let characterIndex = 0; characterIndex < stringLength; characterIndex++) {
  if (vowelPositionMask[characterIndex]) {
    // 前進至下一個非空母音桶（最多前進 10 次）
    while (vowelBucketPointer < 10) {
      if (vowelCountByIndex[vowelBucketPointer] > 0) {
        break;
      }
      vowelBucketPointer++;
    }

    // 將當前母音插入結果陣列
    outputCharacters[characterIndex] = VOWEL_CHARACTERS[vowelBucketPointer];
    vowelCountByIndex[vowelBucketPointer]--;
  } else {
    // 子音直接保留原字
    outputCharacters[characterIndex] = inputString[characterIndex];
  }
}
```

### Step 6：輸出結果

最後，將陣列轉換成字串並回傳。

```typescript
return outputCharacters.join('');
```

## 時間複雜度

- 第一次遍歷與第二次遍歷皆為 $O(n)$。
- 母音桶只有 10 個，因此指標推進成本可忽略不計。
- 總時間複雜度為 $O(n)$。

> $O(n)$

## 空間複雜度

- 額外需要兩個長度為 $n$ 的陣列（遮罩與輸出）。
- 其他僅使用固定大小的桶與查表。
- 總空間複雜度為 $O(n)$。

> $O(n)$
