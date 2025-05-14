# 3335. Total Characters in String After Transformations I

You are given a string `s` and an integer `t`, 
representing the number of transformations to perform. 
In one transformation, every character in `s` is replaced according to the following rules:

- If the character is `'z'`, replace it with the string `"ab"`.
- Otherwise, replace it with the next character in the alphabet. 
  For example, `'a'` is replaced with `'b'`, `'b'` is replaced with `'c'`, and so on.

Return the length of the resulting string after exactly `t` transformations.

Since the answer may be very large, return it modulo $10^9 + 7$.

**Constraints:**

- `1 <= s.length <= 10^5`
- `s` consists only of lowercase English letters.
- `1 <= t <= 10^5`

## 基礎思路

本題給予一個字串 `s` 與一個整數 `t`，我們需要計算經過 `t` 次轉換後，字串的長度會變成多少。由於字串在轉換過程中可能不斷增長，因此無法直接模擬每一步轉換。我們觀察轉換規則可以發現：

- 除了字元 `'z'` 之外，每個字元轉換後長度不變（僅變成下一個字母）。
- 唯獨字元 `'z'` 會在轉換過程中變為字串 `"ab"`，使長度從 1 增加為 2。

因此，可以採用動態規劃方式，預先計算一個字元 `'z'` 經過不同轉換次數後會擴展為多少長度，並將結果記錄於緩存中。最後，再依照原字串中各個字母的狀態，利用此緩存快速計算結果。

## 解題步驟

### Step 1：初始化全域緩存與基本設定

- 建立陣列 `zGrowthCache` 用於記錄單一 `'z'` 字元經過不同轉換次數後的長度。
- 初始化第一個元素為 `1`，代表 `'z'` 未經轉換的長度為 `1`。

```ts
// Cache for multiple calls to lengthAfterTransformations
const zGrowthCache = new Uint32Array(100_000 + 1);
let zGrowthCacheComputedUpTo = 0;

// Base case: a single 'z' with 0 transforms has length 1
zGrowthCache[0] = 1;
```

### Step 2：函式內部常數設定

- `MODULO` 為題目要求的模數 $10^9 + 7$。
- `ALPHABET_SIZE` 為英文字母數量（26）。
- `CHAR_CODE_OFFSET` 用來快速轉換字母為陣列索引值。

```ts
const MODULO = 1_000_000_007;
const ALPHABET_SIZE = 26;
const ALPHABET_MINUS_ONE = 26 - 1;
const CHAR_CODE_OFFSET = 97;
```

### Step 3：計算 `zGrowthCache` 到轉換次數 `t`

- 若尚未計算至轉換次數 `t`，則從目前位置開始向後逐步計算。
- 在前 25 次轉換內，字元 `'z'` 的長度恆為 2。
- 超過 25 次後，使用遞推公式計算並取模。

```ts
if (zGrowthCacheComputedUpTo < t) {
  for (let step = zGrowthCacheComputedUpTo + 1; step <= t; ++step) {
    if (step <= ALPHABET_MINUS_ONE) {
      // 在步數 1…25 之間，"z" → "ab"，長度固定為 2
      zGrowthCache[step] = 2;
    } else {
      // 遞推關係： g[k] = g[k–25] + g[k–26]
      const sum =
        zGrowthCache[step - ALPHABET_MINUS_ONE] +
        zGrowthCache[step - ALPHABET_SIZE];
      // 模擬取模保持在 [0, MODULO)
      zGrowthCache[step] = sum >= MODULO ? sum - MODULO : sum;
    }
  }
  zGrowthCacheComputedUpTo = t;
}
```

### Step 4：統計字串中各個字母出現次數

```ts
const letterCounts = new Uint32Array(26).fill(0);
for (let i = 0, len = s.length; i < len; ++i) {
  letterCounts[s.charCodeAt(i) - CHAR_CODE_OFFSET]++;
}
```

* 使用陣列 `letterCounts` 記錄原字串中每個字母出現的次數。
### Step 5：計算每個字母在 `t` 次轉換後的貢獻

- 對每個字母，計算轉換後的長度（使用緩存值），並乘以該字母原本出現次數，累計至 `total` 中。

```ts
let total = 0;
for (let code = 0; code < ALPHABET_SIZE; ++code) {
  const count = letterCounts[code];
  if (count === 0) {
    continue;
  }

  // 該字母變成 'z' 需要的轉換次數
  const untilZ = ALPHABET_MINUS_ONE - code;
  // 變成 'z' 之後剩餘的轉換次數
  const remaining = t - untilZ;
  // 如果 remaining ≤ 0，表示永遠不會到 'z' → 長度維持 1；否則查表 g[remaining]
  const contribution = remaining > 0
    ? zGrowthCache[remaining]
    : 1;

  total += count * contribution;
}
```

### Step 6：回傳最終結果（取模後）

- 將計算結果對 $10^9+7$ 取模後回傳。

```ts
// 最後只需一次取模
return total % MODULO;
```

## 時間複雜度

- 計算 `zGrowthCache` 陣列最差情況需 $O(t)$。
- 統計原字串字母次數需 $O(n)$，其中 $n = s.length$。
- 計算最終長度的貢獻值僅需固定的 26 次迭代，為常數時間。
- 總時間複雜度為 $O(n + t)$。

> $O(n + t)$

## 空間複雜度

- 使用陣列 `zGrowthCache`，其空間大小為 $O(t)$。
- 使用固定大小的字母計數陣列 `letterCounts`，大小為 26，視為常數空間。
- 總空間複雜度為 $O(t)$。

> $O(t)$
