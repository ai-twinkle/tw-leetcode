# 763. Partition Labels

You are given a string `s`. 
We want to partition the string into as many parts as possible so that each letter appears in at most one part. 
For example, the string `"ababcc"` can be partitioned into `["abab", "cc"]`, 
but partitions such as `["aba", "bcc"]` or `["ab", "ab", "cc"]` are invalid.

Note that the partition is done so that after concatenating all the parts in order, the resultant string should be `s`.

Return a list of integers representing the size of these parts.

**Constraints:**

- `1 <= s.length <= 500`
- `s` consists of lowercase English letters.

## 基礎思路

這題希望我們把字串切割成許多片段，並要求每個字母只能出現在其中一個片段，不能跨越到其他片段。我們的目標是：**盡可能地將字串分割成更多的小段**。

那麼，要如何判斷哪些字母能被放在同一片段，而哪些字母必須分開呢？這裡的關鍵在於**每個字母最後一次出現的位置**：

- 如果我們希望某個字母只出現在一個片段中，那麼這個片段的邊界至少要延伸到該字母最後一次出現的位置，否則這個字母就會出現在後面的片段中，違反題意。

因此，我們可以透過以下策略來解決問題：

1. **先記錄每個字母最後一次出現的位置**，這樣我們便知道每個字母能容許的「最遠邊界」在哪裡。
2. 接著從頭到尾掃描整個字串，一邊掃描一邊動態調整目前片段的邊界：
    - 每遇到一個新的字母，就更新當前片段的最遠邊界。
    - 當掃描位置剛好到達這個最遠邊界時，表示當前片段已經完成。我們就可以紀錄下這段的長度，並且開始進行下一段的切割。

透過這種方式，我們一邊掃描一邊動態調整邊界，確保字母不會跨越片段，從而成功達到最多分段的目標。

## 解題步驟

### Step 1：建立資料結構

我們需要一個大小為26的整數數組（對應26個英文字母），用來記錄每個字母最後一次出現的位置：

```typescript
const last = new Int32Array(26);
```

### Step 2：紀錄每個字母最後的位置

遍歷整個字串，更新每個字母在字串中最後一次出現的位置：

```typescript
for (let i = 0; i < s.length; i++) {
  last[s.charCodeAt(i) - 97] = i;
}
```

此時，每個字母最後一次出現的位置都已經被儲存在 `last` 中。

### Step 3：遍歷字串並建立分段

設定兩個指標 `start` 和 `end` 來追蹤當前片段的範圍：

- `start` 表示當前片段的起始位置。
- `end` 表示當前片段的最遠邊界位置。

```typescript
let start = 0;
let end = 0;
const result: number[] = [];

for (let i = 0; i < s.length; i++) {
  const idx = s.charCodeAt(i) - 97; // 當前字母對應的索引
  end = Math.max(end, last[idx]);   // 更新當前片段的邊界

  // 當前位置為邊界時，表示片段完成
  if (i === end) {
    result.push(end - start + 1);   // 紀錄當前片段大小
    start = i + 1;                  // 開始新的片段
  }
}
```

此迴圈的意義是：
- 每次看到一個字母，就更新當前片段的最遠邊界，確保所有已見字母都能在片段內。
- 如果當前位置 `i` 正好達到當前片段的邊界 `end`，則這個片段結束，計算並紀錄其長度。

### Step 4：返回結果

最終，返回紀錄好的片段長度列表：

```typescript
return result;
```

## 時間複雜度

- 首先遍歷整個字串，更新每個字母的最後位置，時間複雜度為 $O(n)$。
- 接著再一次遍歷整個字串形成片段，時間複雜度同樣為 $O(n)$。
- 總體時間複雜度為 $O(n)$。

> $O(n)$

## 空間複雜度

- 我們使用了一個大小固定的數組來記錄26個英文字母的最後位置，這是常數空間 $O(1)$。
- `result` 最多儲存所有字母（最差情況下，每個字母一段），所以空間複雜度最多 $O(n)$。
- 總空間複雜度為 $O(n)$。

> $O(n)$
