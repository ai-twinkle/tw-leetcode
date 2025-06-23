# 2081. Sum of k-Mirror Numbers

A k-mirror number is a positive integer without leading zeros that reads the same both forward and backward in base-10 as well as in base-k.

- For example, `9` is a 2-mirror number. 
  The representation of `9` in base-10 and base-2 are `9` and `1001` respectively, which read the same both forward and backward.
- On the contrary, `4` is not a 2-mirror number. The representation of `4` in base-2 is `100`, 
  which does not read the same both forward and backward.

Given the base `k` and the number `n`, return the sum of the `n` smallest k-mirror numbers.

**Constraints:**

- `2 <= k <= 9`
- `1 <= n <= 30`

## 基礎思路

本題的核心為找到同時滿足以下條件的數字：

- 在十進位（base-10）是回文數。
- 在指定進位 $k$ 下也是回文數。

由於題目僅要求 $n$ 個最小此類數字之和，且 $n$ 上限為 $30$，因此我可以透過以下方式高效地生成和檢查回文數：

1. **從小到大枚舉所有十進位回文數**：

    - 利用回文數的對稱性質，只需枚舉前半部分並透過反轉拼接即可快速生成十進位回文數。

2. **檢查每個數字在 $k$ 進位下是否也是回文數**：

    - 若為回文數，則收集起來。
    - 若不是，則繼續枚舉下一個數字，直到蒐集到所需數量的數字。

3. **使用快取機制（Prefix Sum）**：

    - 由於不同次的查詢可能使用相同的進位 $k$，透過前綴和陣列快取先前的計算結果，可有效降低重複計算的成本。

## 解題步驟

### Step 1：建構十進制回文數

- 藉由指定的前綴快速生成完整回文數字。
- 奇數長度的回文數須排除中間數字，避免重複。

```typescript
function buildPalindrome(prefix: number, oddLength: boolean): number {
  // 從前綴建構十進制回文數
  let pal = prefix;
  let remainder = oddLength ? Math.floor(prefix / 10) : prefix;
  while (remainder > 0) {
    pal = pal * 10 + (remainder % 10);
    remainder = Math.floor(remainder / 10);
  }
  return pal;
}
```

### Step 2：檢查在指定進位下是否為回文數

- 透過數字緩衝區 (digitBuffer) 逐位記錄並檢查回文。
- 二進位有特殊的位元操作可優化速度。

```typescript
function isPalindromeInBase(value: number, radix: number, digitBuffer: Uint8Array): boolean {
  if (radix === 2) {
    // 基於位元反轉技巧，快速檢查二進位回文
    let original = value;
    let reversed = 0;
    while (original > 0) {
      reversed = (reversed << 1) | (original & 1);
      original >>>= 1;
    }
    return reversed === value;
  } else {
    // 其他進位透過數字緩衝區前後對比
    let length = 0, t = value;
    while (t > 0) {
      digitBuffer[length++] = t % radix;
      t = Math.floor(t / radix);
    }
    for (let i = 0, j = length - 1; i < j; i++, j--) {
      if (digitBuffer[i] !== digitBuffer[j]) return false;
    }
    return true;
  }
}
```

### Step 3：生成並快取指定進位下的前綴和陣列

* 枚舉並檢查回文數，直至獲得指定數量 (30個)。
* 產生前綴和快取陣列以優化未來查詢。

```typescript
function getKMirrorPrefixSums(radix: number): number[] {
  if (kMirrorPrefixSums[radix]) {
    return kMirrorPrefixSums[radix];
  }

  const digitBuffer = new Uint8Array(64);    
  const mirrorNumbers: number[] = [];        
  const maxNeeded = 30;                      

  // 枚舉十進位回文數，直到蒐集滿30個
  for (let decimalLength = 1; mirrorNumbers.length < maxNeeded; decimalLength++) {
    const halfLen = (decimalLength + 1) >> 1;
    const start = halfLen === 1 ? 1 : 10 ** (halfLen - 1);
    const end = 10 ** halfLen;
    const odd = (decimalLength & 1) !== 0;

    for (
      let prefix = start;
      prefix < end && mirrorNumbers.length < maxNeeded;
      prefix++
    ) {
      const candidate = buildPalindrome(prefix, odd);
      if (isPalindromeInBase(candidate, radix, digitBuffer)) {
        mirrorNumbers.push(candidate);
      }
    }
  }

  // 計算並快取前綴和
  const prefixSums = new Array<number>(mirrorNumbers.length);
  let runningTotal = 0;
  for (let i = 0; i < mirrorNumbers.length; i++) {
    runningTotal += mirrorNumbers[i];
    prefixSums[i] = runningTotal;
  }

  kMirrorPrefixSums[radix] = prefixSums;
  return prefixSums;
}
```

### Step 4：透過快取直接取得答案

透過前綴和陣列快取直接返回結果。

```typescript
function kMirror(radix: number, count: number): number {
  const sums = getKMirrorPrefixSums(radix);
  return sums[count - 1];
}
```

## 時間複雜度

- 最多枚舉前 $n$ 個十進位回文數，每個檢查耗費 $O(d)$ 時間，其中 $d$ 為回文數字的位數。
  由於 $n$ 有固定上限（最多30個），可視為常數操作。
- 總時間複雜度為 $O(n)$。

> $O(n)$

## 空間複雜度

- 使用固定大小的數字緩衝區 (digitBuffer)，額外使用數量為 $n$ 的陣列儲存回文數字與前綴和快取。
- 總空間複雜度為 $O(n)$。

> $O(n)$
