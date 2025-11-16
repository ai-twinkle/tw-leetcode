# 1513. Number of Substrings With Only 1s

Given a binary string `s`, return the number of substrings with all characters `1`'s. 
Since the answer may be too large, return it modulo `10^9 + 7`.

**Constraints:**

- `1 <= s.length <= 10^5`
- `s[i]` is either `'0'` or `'1'`.

## 基礎思路

本題要求計算一個二元字串中，所有由 `'1'` 組成的子字串總數。
若直接枚舉所有子字串，最壞情況須檢查約 $10^{10}$ 個，完全不可行。

在思考高效作法時，可觀察以下性質：

- 任一連續長度為 `k` 的 `'1'` 區段，能形成的有效子字串數量為：

  $$
  1 + 2 + \cdots + k = \frac{k(k+1)}{2}
  $$

- 因此，只要能快速找出所有 `"111...1"` 的區段長度即可。

- 進一步觀察，可在線性掃描中維護當前連續 `'1'` 的長度：

    - 若讀到 `'1'`，則當前區段長度 `+1`，並可立即貢獻「以此位置作為結尾」的有效子字串數；
    - 若讀到 `'0'`，表示區段結束，長度重置為 0。

- 此方式一次掃描即可完成所有計算，不需額外資料結構即可達成最優效率。

因此，本題可用單一循環、線性時間完成。

## 解題步驟

### Step 1：初始化變數

建立模數，並準備累積答案的變數與當前連續 `'1'` 區段長度。

```typescript
const MODULO = 1000000007;
const length = s.length;

// 由 '1' 構成的有效子字串總數（取模）
let totalSubstrings = 0;

// 當前連續 '1' 區段的長度
let consecutiveOnesLength = 0;
```

### Step 2：逐字元掃描並處理每段連續的 `'1'`

使用索引迴圈掃描字串，並根據是否遇到 `'1'` 來更新連續區段長度與累積子字串數。

```typescript
// 以索引迴圈掃描字串以避免迭代器開銷
for (let index = 0; index < length; index++) {
  // 只讀取一次字元碼以提升效能
  const characterCode = s.charCodeAt(index);

  // '1' 的字元碼為 49
  if (characterCode === 49) {
    // 延伸當前的 '1' 區段
    consecutiveOnesLength++;

    // 每新增一個 '1'，會額外增加 consecutiveOnesLength 個以該位置結尾的子字串
    totalSubstrings += consecutiveOnesLength;

    // 若超過模數則調整回模數範圍
    if (totalSubstrings >= MODULO) {
      totalSubstrings -= MODULO;
    }
  } else {
    // 遇到 '0'，表示此區段結束，重置長度
    consecutiveOnesLength = 0;
  }
}
```

### Step 3：回傳最終結果

```typescript
return totalSubstrings;
```

## 時間複雜度

- 只需一次線性掃描字串，每個字元皆為 O(1) 操作。
- 總時間複雜度為 $O(n)$。

> $O(n)$

## 空間複雜度

- 只使用常數額外變數（計數器與區段長度）。
- 總空間複雜度為 $O(1)$。

> $O(1)$
