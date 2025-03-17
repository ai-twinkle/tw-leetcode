# 2206. Divide Array Into Equal Pairs

You are given an integer array `nums` consisting of `2 * n` integers.

You need to divide `nums` into n pairs such that:

- Each element belongs to exactly one pair.
- The elements present in a pair are equal.

Return `true` if nums can be divided into `n` pairs, otherwise return `false`.

## 基礎思路

這題最簡單的方式就是用 Hash Table 來記錄每個數字出現的次數，然後再去檢查每個數字出現的次數是否為偶數。

- 如果有一個數字出現的次數是奇數，那麼就無法分成 n 對，直接回傳 false。

但是這樣需要兩次迴圈，代表有進一步的改進空間。

我們重新審視題目，我們實際需求的條件是 odd count 必須為零，這樣才能分成 n 對。

那麼此時我們可以使用一個計數器紀錄 odd count，當當前 frequency 是奇數時，就將 odd count 加一，反之則減一。

如果最後 odd count 是零，代表可以進行分組，回傳 true，否則回傳 false。

## 解題步驟

### Step 1: 初始化 odd count 與 frequency table

由於題目有限制數字的範圍，所以我們可以使用一個固定大小的 Uint16Array 來記錄 frequency。

```typescript
const freq = new Uint16Array(501);
let oddCount = 0;
```

### Step 2: 計算 odd count

接著我們需要計算 odd count，這裡我們可以使用一個迴圈來計算。

> Tips:
> 使用 bitwise operator 來判斷奇數，可以提升效能。

```typescript
for (const num of nums) {
  // 增加 frequency
  freq[num]++;

  // 切換 odd count 的狀態
  // 如果新的 count 是奇數，則增加 oddCount，反之則減少 oddCount
  if (freq[num] & 1) {
    oddCount++;
  } else {
    oddCount--;
  }
}
```

### Step 3: 檢查 odd count

最後我們只需要檢查 odd count 是否為零，如果是則回傳 true，否則回傳 false。

```typescript
return oddCount === 0;
```

## 時間複雜度

- 遍歷一次 nums 陣列，時間複雜度為 $O(n)$
- 總時間複雜度為 $O(n)$

> $O(n)$

## 空間複雜度

- 使用 Uint16Array 來記錄 frequency，空間複雜度為 $O(1)$
- 其餘變數空間複雜度為 $O(1)$
- 總空間複雜度為 $O(1)$

> $O(1)$
