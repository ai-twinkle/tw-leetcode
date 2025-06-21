# 3085. Minimum Deletions to Make String K-Special

You are given a string word and an integer `k`.

We consider `word` to be k-special if `|freq(word[i]) - freq(word[j])| <= k` for all indices `i` and `j` in the string.

Here, `freq(x)` denotes the frequency of the character `x` in `word`, and `|y|` denotes the absolute value of `y`.

Return the minimum number of characters you need to delete to make `word` k-special.

**Constraints:**

- `1 <= word.length <= 10^5`
- `0 <= k <= 10^5`
- `word` consists only of lowercase English letters.

## 基礎思路

本題的核心在於將字串調整成符合「k-special」的條件，即任意兩個字元頻率之間的差距不超過 $k$。
要達到此目的，我們的策略如下：

- **統計字元頻率**：先了解每個字元的出現頻率。
- **排序頻率**：將頻率排序，方便快速判斷哪些頻率超過指定範圍。
- **範圍滑動（Sliding Window）**：利用頻率排序後的結果，以滑動視窗方式枚舉可行的頻率範圍，找出最少需要刪除的字元數量。
- **前綴和快速計算**：透過前綴和，快速得出超出範圍字元的數量。

透過以上方法，我們能高效地計算答案。

## 解題步驟

### Step 1：初始化並處理極端情況

首先，確認字串長度，並快速處理不需運算的極端情形。

```typescript
const length = word.length;
// 處理邊界條件：空字串或 k 大於等於字串長度不需刪除任何字元
if (length === 0 || k >= length) {
  return 0;
}
```

### Step 2：計算字元出現頻率

計算字串中每個小寫字母出現的頻率。

```typescript
const characterCounts = new Uint32Array(26);
const asciiOffset = 97;
for (let i = 0; i < length; i++) {
  // 將每個字元轉成對應的索引 (0~25)，然後頻率加一
  characterCounts[word.charCodeAt(i) - asciiOffset]++;
}
```

### Step 3：提取非零頻率並確認是否需要進一步處理

從計算的頻率中提取非零值，並紀錄最大與最小頻率，若差值已符合條件則直接回傳 0。

```typescript
const frequencies = new Uint32Array(26);
let distinctCount = 0;
let maxFrequency = 0;
let minFrequency = length + 1;
for (let c = 0; c < 26; c++) {
  const freq = characterCounts[c];
  if (freq <= 0) {
    continue;
  }

  frequencies[distinctCount++] = freq;
  if (freq > maxFrequency) {
    maxFrequency = freq;
  }
  if (freq < minFrequency) {
    minFrequency = freq;
  }
}
// 如果已經滿足 k-special 條件，直接返回結果
if (distinctCount <= 1 || maxFrequency - minFrequency <= k) {
  return 0;
}
```

### Step 4：對頻率進行排序

由於最多只有 26 個字母，我們直接使用插入排序，時間複雜度可視為常數。

```typescript
for (let i = 1; i < distinctCount; i++) {
  const key = frequencies[i];
  let j = i - 1;
  while (j >= 0 && frequencies[j] > key) {
    frequencies[j + 1] = frequencies[j];
    j--;
  }
  frequencies[j + 1] = key;
}
```

### Step 5：建立前綴和陣列，便於快速計算區間頻率和

為了快速計算特定範圍的頻率總和，建立前綴和陣列。

```typescript
const prefixSum = new Uint32Array(distinctCount + 1);
for (let i = 0; i < distinctCount; i++) {
  prefixSum[i + 1] = prefixSum[i] + frequencies[i];
}
const totalSum = prefixSum[distinctCount];
```

### Step 6：滑動視窗計算最少刪除數量

透過滑動視窗方式，逐一檢查每個頻率可能的範圍，計算出在此範圍外需要刪除的字元數量，取最小值即為最終答案。

```typescript
let minimumDeletionsNeeded = length;
let rightPointer = 0;
for (let leftPointer = -1; leftPointer < distinctCount; leftPointer++) {
  const lowFreq = leftPointer >= 0 ? frequencies[leftPointer] : 0;
  const highFreq = lowFreq + k;

  // 向右推進右指針，找到符合範圍的最大索引
  while (rightPointer < distinctCount && frequencies[rightPointer] <= highFreq) {
    rightPointer++;
  }

  // 計算左邊需要刪除的頻率和
  const deletionsFromLower = leftPointer >= 0 ? prefixSum[leftPointer] : 0;

  // 計算右邊超出範圍需刪除的字元數
  const sumAbove = totalSum - prefixSum[rightPointer];
  const countAbove = distinctCount - rightPointer;
  const deletionsFromUpper = sumAbove - countAbove * highFreq;

  const totalDeletions = deletionsFromLower + deletionsFromUpper;
  // 取最小刪除數量
  if (totalDeletions < minimumDeletionsNeeded) {
    minimumDeletionsNeeded = totalDeletions;
  }
}
```

### Step 7：返回最小刪除數量

```typescript
return minimumDeletionsNeeded;
```

## 時間複雜度

- 統計字元頻率需掃描一次字串，時間複雜度為 $O(n)$。
- 字母種類有限且固定（26 個），排序和滑動視窗操作時間複雜度可忽略不計為 $O(1)$。
- 總時間複雜度為 $O(n)$。

> $O(n)$

## 空間複雜度

- 僅使用固定大小的輔助陣列（最多 26 個元素），沒有額外空間需求。
- 總空間複雜度為 $O(1)$。

> $O(1)$
