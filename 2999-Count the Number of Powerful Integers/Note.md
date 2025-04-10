# 2999. Count the Number of Powerful Integers

You are given three integers `start`, `finish`, and `limit`. 
You are also given a 0-indexed string `s` representing a positive integer.

A positive integer `x` is called powerful if it ends with `s` 
(in other words, `s` is a suffix of `x`) and each digit in `x` is at most `limit`.

Return the total number of powerful integers in the range `[start..finish]`.

A string `x` is a suffix of a string `y` if and only if `x` is a substring of `y` 
that starts from some index (including `0`) in `y` and extends to the index `y.length - 1`. 
For example, `25` is a suffix of `5125` whereas `512` is not.

## 基礎思路

本題要求計算區間 `[start, finish]` 中滿足下列條件的數字個數：

1. 該數字每個位數的值皆不超過給定的 `limit`。
2. 該數字必須以字串 `s` 作為結尾（後綴）。

要有效解決這題，我們定義一個輔助函數 `calculate(x, s, limit)`，它能計算範圍 `[0, x]` 中滿足上述條件的數字個數。

最後，透過區間差分的方式：

$$
\text{答案} = calculate(finish, s, limit) - calculate(start - 1, s, limit)
$$

## 解題步驟

### Step 1：數字轉換與區間差分

首先在主函數內將區間的邊界轉成字串：

```typescript
const startStr = (start - 1).toString();
const finishStr = finish.toString();
return calculate(finishStr, s, limit) - calculate(startStr, s, limit);
```

透過這個方式，可將問題轉換為計算 `[0, finish]` 與 `[0, start-1]` 的個數差。

### Step 2：輔助函數 `calculate` 逐步解析

`calculate(x, s, limit)` 計算的是從 `0` 到字串表示的數字 `x` 中，滿足條件的數量：

#### Step 2.1：初步篩選與邊界處理

定義：

- `n` 為字串 `x` 的長度。
- `suffixLen` 為字串 `s` 的長度。

當：

- 若 `n < suffixLen` 時，數字 `x` 根本無法包含後綴 `s`，直接返回 `0`。
- 若 `n === suffixLen` 時，可能的候選數只有 `s` 自己，比較兩字串大小，決定是否返回 `1`。

```typescript
const n = x.length;
const suffixLen = s.length;

// 長度不足以構成後綴 s
if (n < suffixLen) {
  return 0;
}

// 長度剛好等於後綴 s，直接比較大小
if (n === suffixLen) {
  return x >= s ? 1 : 0;
}
```

#### Step 2.2：預計算前綴組合數

接下來，將數字 `x` 分割成：

- **前綴部分**：長度為 `preLen = n - suffixLen`
- **後綴部分**：最後 `suffixLen` 個位數

前綴每位數字可選範圍是 `0 ~ limit`，共 `(limit + 1)` 種選擇，因此我們預先計算每一個位數對應的總組合數：

```typescript
const preLen = n - suffixLen;

// 預計算 (limit + 1)^i 的組合數量
const pows = new Float64Array(preLen + 1);
pows[0] = 1;
for (let i = 1; i <= preLen; i++) {
  pows[i] = pows[i - 1] * (limit + 1);
}
```

#### Step 2.3：逐位計算前綴的可能組合

設定變數 `count` 累計符合條件的數量。  
逐位遍歷前綴，每一位計算如下：

- 若該位數字大於 `limit`，表示此位已不符限制，立即加上後面所有可能組合 (`pows[preLen - i]`)，然後返回結果。
- 若該位數字小於或等於 `limit`，則加上「當前位數字乘以下面位數的可能組合數」。

```typescript
let count = 0;
for (let i = 0; i < preLen; i++) {
  const digit = x.charCodeAt(i) - 48;
  if (digit > limit) {
    count += pows[preLen - i];
    return count;
  }
  count += digit * pows[preLen - 1 - i];
}
```

#### Step 2.4：確認後綴並完成計算

若前綴完全符合條件，則比較 `x` 的後綴是否大於等於 `s`：

- 若符合，`count` 額外加上 `1`。

```typescript
const suffix = x.slice(preLen);
if (suffix >= s) {
  count++;
}

return count;
```

## 時間複雜度

- 預計算中計算指數組合數的迴圈，耗時為 $O(n)$。
- 逐位計算中遍歷前綴每個位數，耗時為 $O(n)$。
- 總時間複雜度為 $O(n)$。

> $O(n)$


## 空間複雜度

- 預計算中建立大小為 `preLen+1` 的陣列 `pows`，佔用 $O(n)$ 空間。
- 其他變數只需 $O(1)$ 的空間。
- 總空間複雜度為$O(n)$。

> $O(n)$
