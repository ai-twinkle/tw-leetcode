# 916. Word Subsets

You are given two string arrays words1 and words2.

A string b is a subset of string a if every letter in b occurs in a including multiplicity.

For example, "wrr" is a subset of "warrior" but is not a subset of "world".
A string a from words1 is universal if for every string b in words2, b is a subset of a.

Return an array of all the universal strings in words1. You may return the answer in any order.

## 基礎思路

需要把題目拆解成兩個步驟，第一個是把words2字串陣列轉換成每個字母的最低需求數量。
用一個最低需求數量的陣列來記錄，因為需求較大的需求滿足了，需求較小的需求也會滿足，這能減少比對的次數與儲存空間。
接下來只要找尋words1字串陣列中的字串是否符合每個字母的最低需求數量即可。

## 解題步驟

### Step 1: 計算words2字串陣列中每個字母的最低需求數量

```typescript
const charCount = new Array(26).fill(0); // 紀錄每個字母的最低需求數量

// 遍歷每個"要求"字串
for (const word of words2) {
  const wordCount = new Array(26).fill(0); // 紀錄當前需求的字母計數
  
  // 計算當前需求的字母計數
  for (const char of word) {
    wordCount[char.charCodeAt(0) - 97]++;
  }

  // 比對每個字母的最低需求數量
  for (let i = 0; i < 26; i++) {
    // 如果當前需求的字母計數大於最低需求數量，則更新最低需求數量
    charCount[i] = Math.max(charCount[i], wordCount[i]);
  }
}
```

### Step 2: 找尋words1字串陣列中的字串是否符合每個字母的最低需求數量

```typescript
// 初始化結果陣列
const result: string[] = [];

// 遍歷每個"檢驗目標"字串
for (const word of words1) {
  const wordCount = new Array(26).fill(0); // 計算當前檢驗目標的字母計數
  
  // 計算當前檢驗目標的字母計數
  for (const char of word) {
    wordCount[char.charCodeAt(0) - 97]++;
  }

  let isUniversal = true; // 旗標，檢驗目標是否符合全部字母的最低需求數量
  
  // 檢驗每個字母是否符合最低需求數量
  for (let i = 0; i < 26; i++) {
    // 當不滿足時，則標記為不符合，並跳出迴圈，這能減少比對的次數
    if (wordCount[i] < charCount[i]) {
      isUniversal = false;
      break;
    }
  }

  // 如果檢驗目標符合全部字母的最低需求數量，則加入結果陣列
  if (isUniversal) {
    result.push(word);
  }
}
```

## 時間複雜度

- 預處理 words2 的時間複雜度： $O(n_2 \cdot m_2)$ ，其中 $n_2$ 是 words2 的長度，$m_2$ 是 words2 中字串的平均長度
- 遍歷 words1 的時間複雜度： $O(n_1 \cdot m_1)$ ，其中 $n_1$ 是 words1 的長度，$m_1$ 是 words1 中字串的平均長度
- 總時間複雜度：$O(n_1 \cdot m_1 + n_2 \cdot m_2)$

> $O(n_1 \cdot m_1 + n_2 \cdot m_2)$

## 空間複雜度

- 預處理 words2 的空間複雜度： $O(1)$
- 遍歷 words1 的空間複雜度： $O(n_1)$
- 結果陣列的空間複雜度： $O(n_1)$
- 總空間複雜度：$O(n_1)$

> $O(n_1)$
