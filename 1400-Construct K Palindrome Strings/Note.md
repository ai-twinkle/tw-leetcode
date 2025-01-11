# 1400. Construct K Palindrome Strings

Given a string s and an integer k, return true if you can use all the characters in s to construct k palindrome strings or false otherwise.

## 基礎思路
會需要特別計算的是基數的字母數量，因為基數的字母一定會要佔掉一個位置，所以基數的字母數量一定要小於等於k，否則無法構成k個回文串。

## 解題步驟

### Step 1: 若 k 已經大於 s 的長度，則回傳 False
```typescript
if (s.length < k) {
  return false;
}
```

### Step 2: 計算基數字母的數量
```typescript
const charCount = new Array(26).fill(0);
for (const char of s) {
  charCount[char.charCodeAt(0) - 97]++;
}
```

### Step 3: 計算基數字母的數量
```typescript
let oddCount = 0;
for (const count of charCount) {
  if (count % 2 === 1) {
    oddCount++;
  }
}
```

### Step 4: 若基數字母的數量大於 k，則回傳 False
```typescript
return oddCount <= k;
```

## 時間複雜度
由於計算字母數量要遍歷一次字串，所以時間複雜度為 O(n)。

> $$O(n)$$

## 空間複雜度
我們使用了一個長度為 26 的陣列來存放字母數量，不管字串有多長，空間複雜度都是固定的。

> $$O(1)$$
