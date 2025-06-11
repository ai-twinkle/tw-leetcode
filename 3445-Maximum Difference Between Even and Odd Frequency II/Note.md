# 3445. Maximum Difference Between Even and Odd Frequency II

You are given a string `s` and an integer `k`. 
Your task is to find the maximum difference between the frequency of two characters, `freq[a] - freq[b]`, in a substring subs of `s`, such that:

- `subs` has a size of at least `k`.
- Character `a` has an odd frequency in `subs`.
- Character `b` has an even frequency in `subs`.
Return the maximum difference.

Note that `subs` can contain more than 2 distinct characters.

**Constraints:**

- `3 <= s.length <= 3 * 10^4`
- `s` consists only of digits `'0'` to `'4'`.
- The input is generated that at least one substring has a character with an even frequency and a character with an odd frequency.
- `1 <= k <= s.length`

## 基礎思路

本題的核心任務是要在字串中，找出一個子字串，使得特定兩個字元之間的頻率差異達到最大，並且符合以下三個條件：

- 子字串長度至少為 $k$。
- 一個字元（記為 $a$）的出現次數必須是奇數次。
- 另一個字元（記為 $b$）的出現次數必須是偶數次。

要有效處理這個問題，必須注意幾個關鍵點：

1. 由於字元只有 '0' 到 '4' 五種可能，因此能夠透過前綴和 (prefix sum) 快速地查詢任何區間內各個字元的頻率。
2. 頻率的奇偶性是決定子字串是否符合題意的重要關鍵，因此需要針對奇偶性建立一種狀態表示。
3. 最終問題可簡化成固定枚舉每一對可能的字元組合，並且使用滑動窗口加上紀錄最小值的技巧，來快速地找到滿足條件的最大頻率差異。

## 解題步驟

### Step 1：初始化並將字串解碼為數字陣列

首先，將字串轉為數字陣列，以便後續快速存取：

```typescript
const n = s.length;

// 將字串 s 轉換成數字陣列 (0-4) 便於後續操作
const digits = new Uint8Array(n);
for (let i = 0; i < n; i++) {
  digits[i] = s.charCodeAt(i) - 48;
}
```

### Step 2：建立每個字元的前綴頻率陣列

為了後續快速查詢任意區間的字元頻率，需建立各字元的前綴頻率：

```typescript
// 產生 5 個數字（0 到 4）的前綴頻率陣列
const prefixFreq: Uint16Array[] = new Array(5);
for (let d = 0; d < 5; d++) {
  const arr = new Uint16Array(n + 1);
  let count = 0;
  for (let i = 0; i < n; i++) {
    if (digits[i] === d) {
      count++;
    }
    arr[i + 1] = count;
  }
  prefixFreq[d] = arr;
}
```

### Step 3：設定初始變數與桶狀結構

定義變數儲存目前找到的最大差值與初始化桶：

```typescript
let maxDiff = Number.NEGATIVE_INFINITY;
const INF = 0x3f3f3f3f; // 設定哨兵值作為無效初始值
```

### Step 4：枚舉所有可能的奇數字元與偶數字元組合

由於數字只有 5 種，逐一枚舉所有可能的字元組合：

```typescript
for (let oddChar = 0; oddChar < 5; oddChar++) {
  const prefixOdd = prefixFreq[oddChar];
  for (let evenChar = 0; evenChar < 5; evenChar++) {
    if (evenChar === oddChar) {
      continue;
    }

    const prefixEven = prefixFreq[evenChar];
    const totalEven = prefixEven[n];
    if (totalEven < 2) {
      continue; // 至少需要兩個 evenChar 才能達成偶數次出現條件
    }

    // 初始化四種奇偶組合的最小差值桶 [00,01,10,11]
    const bucketSize = totalEven + 1;
    const minDiffAtCount: Int32Array[] = new Array(4);
    for (let i = 0; i < 4; i++) {
      const arr = new Int32Array(bucketSize);
      arr.fill(INF);
      minDiffAtCount[i] = arr;
    }

    const minBucket = [INF, INF, INF, INF];
    let prevThreshold = -1;

    // ...
  }
}
```

### Step 5：使用滑動窗口技巧更新答案

利用滑動窗口遍歷整個字串，並動態更新每一個狀態下最小的差值，然後嘗試更新目前的最大差值：

```typescript
for (let oddChar = 0; oddChar < 5; oddChar++) {
  const prefixOdd = prefixFreq[oddChar];
  for (let evenChar = 0; evenChar < 5; evenChar++) {
    // Step 4：枚舉所有可能的奇數字元與偶數字元組合
    
    // 滑動窗口的結尾 end 從 k 開始到 n
    for (let end = k; end <= n; end++) {
      const start = end - k;

      // 子字串起點的頻率與奇偶狀態
      const freqOddStart = prefixOdd[start];
      const freqEvenStart = prefixEven[start];
      const startParity = ((freqOddStart & 1) << 1) | (freqEvenStart & 1);
      const diffAtStart = freqOddStart - freqEvenStart;

      // 更新當前奇偶狀態與 evenChar 出現次數下的最小差值
      const currBucket = minDiffAtCount[startParity];
      if (diffAtStart < currBucket[freqEvenStart]) {
        currBucket[freqEvenStart] = diffAtStart;
      }

      if (freqEvenStart <= prevThreshold && diffAtStart < minBucket[startParity]) {
        minBucket[startParity] = diffAtStart;
      }

      // 結尾處 evenChar 的次數，用以確認是否達到偶數條件
      const freqEvenEnd = prefixEven[end];
      const currThreshold = freqEvenEnd - 2;

      // 若 evenChar 次數提升則更新最小值桶
      if (currThreshold > prevThreshold) {
        for (let x = prevThreshold + 1; x <= currThreshold; x++) {
          if (x < 0 || x >= bucketSize) {
            continue;
          }
          for (let p = 0; p < 4; p++) {
            const val = minDiffAtCount[p][x];
            if (val < minBucket[p]) {
              minBucket[p] = val;
            }
          }
        }
        prevThreshold = currThreshold;
      }

      // 不足偶數條件則跳過
      if (currThreshold < 0) {
        continue;
      }

      // 計算結尾處的頻率差
      const freqOddEnd = prefixOdd[end];
      const diffAtEnd = freqOddEnd - freqEvenEnd;

      // 尋找符合奇偶性條件的起點最小值
      const neededParity = (((freqOddEnd & 1) ^ 1) << 1) | (freqEvenEnd & 1);
      const bestStart = minBucket[neededParity];
      
      if (bestStart === INF) {
        continue;
      }

      // 更新答案
      const candidateDiff = diffAtEnd - bestStart;
      if (candidateDiff > maxDiff) {
        maxDiff = candidateDiff;
      }
    }
  }
}
```

### Step 6：回傳答案

最終取得的 `maxDiff` 即為答案：

```typescript
return maxDiff;
```

## 時間複雜度

- 枚舉字元組合的次數為常數（最多 20 組），每組使用滑動窗口技巧掃描一遍字串，每次操作 $O(1)$。
- 總時間複雜度為 $O(n)$。

> $O(n)$

## 空間複雜度

- 使用了固定的 5 個前綴陣列，每個長度為 $n + 1$，以及若干桶結構，每次桶大小至多為 $n + 1$。
- 總空間複雜度為 $O(n)$。

> $O(n)$
