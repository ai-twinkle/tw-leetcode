# 3541. Find Most Frequent Vowel and Consonant

You are given a string `s` consisting of lowercase English letters (`'a'` to `'z'`).

Your task is to:

- Find the vowel (one of `'a'`, `'e'`, `'i'`, `'o'`, or `'u'`) with the maximum frequency.
- Find the consonant (all other letters excluding vowels) with the maximum frequency.

Return the sum of the two frequencies.

Note: If multiple vowels or consonants have the same maximum frequency, you may choose any one of them. 
If there are no vowels or no consonants in the string, consider their frequency as 0.

The frequency of a letter `x` is the number of times it occurs in the string.

**Constraints:**

- `1 <= s.length <= 100`
- `s` consists of lowercase English letters only.

## 基礎思路

本題要求我們從字串中找出**出現頻率最高的母音**與**出現頻率最高的子音**，然後將兩者的出現次數加總。

由於英文字母範圍固定為 `'a'` 到 `'z'`，總共 26 個字母，我們可以先建一個長度為 26 的整數陣列來統計每個字母的出現次數，並同時計算目前已知的最大母音與最大子音頻率。

對於判斷某字母是否為母音的方式可以透過 **bitmask 快速查表**，例如 `'a'`, `'e'`, `'i'`, `'o'`, `'u'` 對應的位元可以預先設好，用右移與位元與 (`&`) 判斷當前字母是否是母音。

最後只需回傳最大母音頻率與最大子音頻率的總和即可。

## 解題步驟

### Step 1：定義母音判斷用的 bitmask

我們用一個 26-bit 整數，將 `'a'`, `'e'`, `'i'`, `'o'`, `'u'` 對應的 bit 位置設為 1，其餘為 0。

```typescript
// Bitmask 標記哪些字母是母音（對應 'a' 到 'z'）
const VOWEL_BITMASK_A_TO_Z =
  (1 << 0) | (1 << 4) | (1 << 8) | (1 << 14) | (1 << 20);
```

### Step 2：初始化頻率表與最大值追蹤變數

建立一個長度為 26 的陣列來儲存每個字母出現次數，並準備兩個變數來追蹤目前遇到的最大母音與子音頻率。

```typescript
// 儲存每個字母的出現次數（'a' 為 index 0, 'z' 為 index 25）
const frequencyByLetter = new Uint32Array(26);

// 紀錄目前遇到的最大母音頻率與最大子音頻率
let vowelMaximumFrequency = 0;
let consonantMaximumFrequency = 0;
```

### Step 3：逐字遍歷字串，更新頻率與最大值

我們遍歷整個字串，對每個字元進行以下操作：

- 將字元轉為 `0~25` 的索引
- 更新該字母的出現次數
- 根據是否為母音，更新對應最大值

```typescript
// 遍歷字串中每個字元
for (let i = 0; i < s.length; i++) {
  // 將字元轉換為索引（'a' 為 0，'b' 為 1，…，'z' 為 25）
  const index = s.charCodeAt(i) - 97;

  // 增加該字母的出現次數
  const newCount = ++frequencyByLetter[index];

  if ((VOWEL_BITMASK_A_TO_Z >>> index) & 1) {
    // 若此字元是母音，更新最大母音頻率
    if (newCount > vowelMaximumFrequency) {
      vowelMaximumFrequency = newCount;
    }
  } else {
    // 否則為子音，更新最大子音頻率
    if (newCount > consonantMaximumFrequency) {
      consonantMaximumFrequency = newCount;
    }
  }
}
```

### Step 4：回傳最大頻率加總結果

最後回傳兩個最大頻率的加總值即可。

```typescript
// 回傳最大母音頻率與最大子音頻率的加總
return vowelMaximumFrequency + consonantMaximumFrequency;
```

## 時間複雜度

- 遍歷整個字串長度為 $n$，每個字元處理時間為常數。
- 使用的頻率表長度為 26，屬於固定空間。
- 總時間複雜度為 $O(n)$，其中 $n$ 為字串長度。

> $O(n)$

## 空間複雜度

- 使用固定大小的陣列 `Uint32Array(26)` 來儲存字母頻率。
- 使用數個變數儲存最大值與中間結果。
- 總空間複雜度為 $O(1)$。

> $O(1)$
