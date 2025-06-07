# 3170. Lexicographically Minimum String After Removing Stars

You are given a string `s`. 
It may contain any number of `'*'` characters. 
Your task is to remove all `'*'` characters.

While there is a `'*'`, do the following operation:

- Delete the leftmost `'*'` and the smallest non-`'*'` character to its left. 
  If there are several smallest characters, you can delete any of them.

Return the lexicographically smallest resulting string after removing all `'*'` characters.

**Constraints:**

- `1 <= s.length <= 10^5`
- `s` consists only of lowercase English letters and `'*'`.
- The input is generated such that it is possible to delete all `'*'` characters.

## 基礎思路

本題的核心在於每次遇到「\*」時，都必須刪除該「\*」以及其左側尚未刪除的最小字母，且最終需要使剩下的字串達到字典序最小。
因此，我們可以利用以下策略：

1. 需快速得知當前可刪除字母中最小的字母位置。
2. 使用有效的資料結構紀錄每個字母的位置，確保每次操作皆能快速完成。
3. 維護已刪除的位置，以便最後重建字串時精確得知哪些位置應該被忽略。

實踐上，本題透過一系列陣列和位元操作，能以 $O(1)$ 時間找出當前的最小字母，以符合題目的效率需求。

## 解題步驟

### Step 1：初始化所有必要資料結構

初始化輔助變數，記錄字母位置、刪除標記、以及快速存取最小字母位置：

```typescript
const stringLength = s.length;
const deletionFlags = new Uint8Array(stringLength);

// 每個字母 (a-z) 都有一個鏈結串列頭
const letterBucketHeads = new Int32Array(26).fill(-1);
// nextIndexInBucket[i] 表示在相同字母鏈結串列中，i 之後的位置
const nextIndexInBucket = new Int32Array(stringLength);

// 用來快速查詢最小的非空字母桶
let nonEmptyBucketMask = 0;
let totalStarCount = 0;

const ASTERISK_CHAR_CODE = '*'.charCodeAt(0);
const LOWERCASE_A_CHAR_CODE = 'a'.charCodeAt(0);
```

### Step 2：單次掃描，標記需刪除的位置

透過遍歷字串，處理每個字元：

- 若為字母，記錄其位置至對應字母的鏈結串列。
- 若為「\*」，立即刪除此星號，並從左側最小字母桶中刪除一個字母位置。

```typescript
for (let currentPosition = 0; currentPosition < stringLength; currentPosition++) {
  const charCode = s.charCodeAt(currentPosition);

  if (charCode === ASTERISK_CHAR_CODE) {
    // 標記此位置星號刪除
    deletionFlags[currentPosition] = 1;
    totalStarCount++;

    // 透過位元操作找到最小字母桶
    const lowestSetBit = nonEmptyBucketMask & -nonEmptyBucketMask;
    const smallestNonEmptyBucketIndex = 31 - Math.clz32(lowestSetBit);

    // 從最小字母桶移除一個位置
    const removedLetterPosition = letterBucketHeads[smallestNonEmptyBucketIndex];
    deletionFlags[removedLetterPosition] = 1;
    letterBucketHeads[smallestNonEmptyBucketIndex] =
      nextIndexInBucket[removedLetterPosition];

    // 如果桶變空，更新位元遮罩
    if (letterBucketHeads[smallestNonEmptyBucketIndex] === -1) {
      nonEmptyBucketMask ^= lowestSetBit;
    }

  } else {
    // 將此字母位置加入鏈結串列
    const bucketIndex = charCode - LOWERCASE_A_CHAR_CODE;
    nextIndexInBucket[currentPosition] = letterBucketHeads[bucketIndex];
    letterBucketHeads[bucketIndex] = currentPosition;

    // 標記此字母桶非空
    nonEmptyBucketMask |= (1 << bucketIndex);
  }
}
```

### Step 3：重建最終的最小字典序字串

再一次掃描字串，將所有未被標記刪除的字元，依序加入結果陣列：

```typescript
const resultLength = stringLength - 2 * totalStarCount;
const resultCharacters: string[] = new Array(resultLength);
let writeIndex = 0;

for (let currentPosition = 0; currentPosition < stringLength; currentPosition++) {
  if (deletionFlags[currentPosition] === 0) {
    resultCharacters[writeIndex++] = s[currentPosition];
  }
}

return resultCharacters.join('');
```

## 時間複雜度

- 遍歷整個字串，每一步皆為 $O(1)$ 操作。
- 最後再一次掃描以建構答案亦為 $O(n)$。
- 總時間複雜度為 $O(n)$。

> $O(n)$

## 空間複雜度

- 使用固定數量的陣列 (`deletionFlags`, `nextIndexInBucket`)。
- 空間用量與輸入字串長度成線性關係。
- 總空間複雜度為 $O(n)$。

> $O(n)$
