# 1980. Find Unique Binary String

Given an array of strings `nums` containing `n` unique binary strings each of length `n`, 
return a binary string of length `n` that does not appear in `nums`. 
If there are multiple answers, you may return any of them.

## 基本思路

此題的目標是找出一個與 `nums` 中所有二進位字串長度相同、但又不屬於 `nums` 的二進位數。
每個數字必須滿足：對於 `nums` 中的每一個數字，至少存在一個位元是不同的。
由於題目中給定的陣列恰好包含 `n` 個長度為 `n` 的二進位字串，因此我們可以利用這一特性來構造解法。

我們可以沿著這些字串的「對角線」位置進行遍歷，並將對角線上每個數字的位元取反後依序拼接成新的字串。
這樣生成的字串，保證在對角線上的每個位置都與 `nums` 中對應的字串不同，因此整個字串也必然不會出現在 `nums` 中。

## 解題步驟

### Step 1: 記錄長度與初始化結果

```typescript
const n = nums.length;
let result = '';
```

### Step 2: 沿對角線生成新字串

我們可以利用 `for` 迴圈來遍歷對角線上的每個位置，即 `nums[i][i]` 的位置。
然後把對角線上每個數字的位元取反後依序拼接成新的字串。

```typescript
for (let i = 0; i < n; i++) {
  result += nums[i][i] === '0' ? '1' : '0';
}
```

## 時間複雜度

- 遍歷對角線上的每個位置，我們需要 $O(n)$ 的時間。
- 總時間複雜度為 $O(n)$。

> $O(n)$

## 空間複雜度

- 我們需要一個變數 `result` 來存儲結果。其空間複雜度為 $O(n)$。
- 總空間複雜度為 $O(n)$。

> $O(n)$
