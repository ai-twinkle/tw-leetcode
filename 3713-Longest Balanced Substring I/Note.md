# 3713. Longest Balanced Substring I

You are given a string s consisting of lowercase English letters.

A substring of s is called balanced if all distinct characters in the substring appear the same number of times.

Return the length of the longest balanced substring of `s`.

**Constraints:**

- `1 <= s.length <= 1000`
- `s` consists of lowercase English letters.

## 基礎思路

本題要找出字串中最長的「平衡子字串」：在該子字串內，所有出現過的不同字元，其出現次數必須完全相同。

在思考解法時，可以抓住幾個核心性質：

* **平衡條件等價於「所有非零頻率相同」**：只要某個子字串中，不同字元的出現次數不一致，就不可能平衡。
* **可用「固定左端、逐步擴展右端」的掃描方式枚舉子字串**：因為 `n ≤ 1000`，枚舉所有起點並向右擴張是可行的。
* **必要條件剪枝**：若一段子字串有 `d` 種不同字元，且長度為 `L`，要平衡則必須滿足 `L` 能被 `d` 整除（每個字元頻率才會是整數）。
* **驗證平衡只需檢查所有出現過的字元頻率是否等於同一個目標值**：若全部一致，該子字串即為平衡，可用來更新答案。

透過枚舉起點與終點並搭配必要條件剪枝，我們能在題目規模內找出最長平衡子字串。

## 解題步驟

### Step 1：初始化長度並處理極小案例

先取得字串長度；若長度為 0 或 1，最長平衡子字串長度就是本身長度，可直接返回。

```typescript
const length = s.length;
if (length <= 1) {
  return length;
}
```

### Step 2：預先轉換字元為 0..25 的索引

先把整個字串轉成 0..25 的整數索引序列，避免後續重複做字元轉換的成本。

```typescript
// 預先計算字元代碼（0..25），避免重複呼叫 charCodeAt 的額外成本。
const codes = new Uint8Array(length);
for (let index = 0; index < length; index += 1) {
  codes[index] = (s.charCodeAt(index) - 97) as number;
}
```

### Step 3：準備計數表與最佳答案

使用固定大小的計數表記錄區間內各字母出現次數，並初始化最佳答案為 1。

```typescript
const counts = new Int16Array(26);
let bestLength = 1;
```

### Step 4：固定左端點 left 並做外層剪枝

逐一嘗試每個左端點 `left`。
若剩餘長度已不可能超過目前最佳答案，就可以提早結束外層迴圈。

```typescript
for (let left = 0; left < length; left += 1) {
  if (length - left <= bestLength) {
    break;
  }

  counts.fill(0);
  let distinctCount = 0;

  // ...
}
```

### Step 5：在同一個外層 for 內擴展右端點並更新頻率

在固定 `left` 的前提下，用 `right` 往右擴展。
每次擴展都更新該字元的次數，並在該字元首次出現時更新不同字元種類數量。

```typescript
for (let left = 0; left < length; left += 1) {
  // Step 4：固定左端點 left 並做外層剪枝

  counts.fill(0);
  let distinctCount = 0;

  for (let right = left; right < length; right += 1) {
    const code = codes[right];
    const updatedCount = (counts[code] += 1);

    if (updatedCount === 1) {
      distinctCount += 1;
    }

    // ...
  }
}
```

### Step 6：視窗長度剪枝與整除必要條件剪枝

先計算當前視窗長度，若未超過已知最佳答案就跳過；
另外平衡子字串必須滿足 `windowLength % distinctCount === 0`，否則也可直接跳過。

```typescript
for (let left = 0; left < length; left += 1) {
  // Step 4：固定左端點 left 並做外層剪枝

  counts.fill(0);
  let distinctCount = 0;

  for (let right = left; right < length; right += 1) {
    // Step 5：擴展右端點並更新頻率

    const windowLength = right - left + 1;
    if (windowLength <= bestLength) {
      continue;
    }

    // 重要剪枝：平衡子字串長度必須能被不同字元數整除。
    if (windowLength % distinctCount !== 0) {
      continue;
    }

    const targetFrequency = (windowLength / distinctCount) | 0;

    // ...
  }
}
```

### Step 7：驗證所有非零頻率是否等於 targetFrequency

若通過剪枝，再檢查所有出現過的字元次數是否都等於目標頻率；只要有任一不符就不是平衡。

```typescript
for (let left = 0; left < length; left += 1) {
  // Step 4：固定左端點 left 並做外層剪枝

  counts.fill(0);
  let distinctCount = 0;

  for (let right = left; right < length; right += 1) {
    // Step 5：擴展右端點並更新頻率

    // Step 6：視窗長度剪枝與整除必要條件剪枝

    // 驗證所有非零計數都等於 targetFrequency。
    let isBalanced = true;
    for (let alphabetIndex = 0; alphabetIndex < 26; alphabetIndex += 1) {
      const value = counts[alphabetIndex];
      if (value !== 0 && value !== targetFrequency) {
        isBalanced = false;
        break;
      }
    }

    // ...
  }
}
```

### Step 8：若平衡則更新最佳答案，最後回傳

若驗證為平衡，更新最佳長度；所有枚舉完成後回傳答案。

```typescript
for (let left = 0; left < length; left += 1) {
  // Step 4：固定左端點 left 並做外層剪枝

  counts.fill(0);
  let distinctCount = 0;

  for (let right = left; right < length; right += 1) {
    // Step 5：擴展右端點並更新頻率

    // Step 6：視窗長度剪枝與整除必要條件剪枝

    // Step 7：驗證所有非零頻率是否等於 targetFrequency

    if (isBalanced) {
      bestLength = windowLength;
    }
  }
}

return bestLength;
```

## 時間複雜度

- 外層 `left` 迴圈最多執行 `n` 次。
- 內層 `right` 迴圈在每個 `left` 下最多執行 `n - left` 次，因此總擴展次數為
  
  $$
  \sum_{left=0}^{n-1}(n-left)=\frac{n(n+1)}{2}=O(n^2)
  $$

- 在每次 `right` 擴展時，平衡驗證會掃描固定 26 個字母，為 **常數 26 次**，因此每次擴展額外成本為 `O(1)`。
- 因此總時間為 $O(26 \cdot \frac{n(n+1)}{2})=O(n^2)$。
- 總時間複雜度為 $O(n^2)$。

> $O(n^2)$

## 空間複雜度

- `codes` 長度為 `n` 的 `Uint8Array`：$O(n)$
- `counts` 為固定 26 長度：$O(1)$
- 其餘變數皆為常數空間
- 總空間複雜度為 $O(n)$。

> $O(n)$
