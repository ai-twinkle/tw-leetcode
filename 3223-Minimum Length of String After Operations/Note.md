# 3223. Minimum Length of String After Operations

You are given a string s.

You can perform the following process on s any number of times:

* Choose an index i in the string such that there is at least one character to the left of index i that is equal to s[i], 
  And at least one character to the right that is also equal to s[i].
* Delete the closest character to the left of index i that is equal to s[i].
* Delete the closest character to the right of index i that is equal to s[i].

Return the minimum length of the final string s that you can achieve.

## 基礎思路

第一個點就是如果字串已經小於等於2，那麼就不用再處理了，因為無法再刪除了。
對於大於等於3的字串，我們始終都可以刪去一對相鄰的相同字元，直到字串長度小於等於2。那只要判定基偶性就可以了。
若數量為奇數，像是5，那麼我們可以刪去一對相鄰的相同字元，剩下3，再刪去一對相鄰的相同字元，剩下1。基數始終剩下1個字元。
同理，若數量為偶數，像是4，那麼我們可以刪去一對相鄰的相同字元，剩下2。偶數始終剩下2個字元。
而本身小於3的字串，則直接加上去，因為無法再刪去了。

## 解題步驟

### Step 1: 若字串長度小於等於2，則直接返回字串長度。

```typescript
if (s.length <= 2) {
  return s.length;
}
```

### Step 2: 計算字串中每個字元的數量。

```typescript
const charCount = new Array(26).fill(0);

for (const char of s) {
  charCount[char.charCodeAt(0) - 'a'.charCodeAt(0)]++;
}
```

### Step 3: 根據字元數量判定基偶性，計算刪去後的字串長度。

```typescript
let result = 0;
for (let i = 0; i < 26; i++) {
  // 若字元數量為0，則跳過。
  if (charCount[i] === 0) {
    continue;
  }

  // 若字元數量大於2，則判定基偶性。
  if (charCount[i] > 2) {
    // 基數則加1，偶數則加2。
    result += charCount[i] % 2 === 0 ? 2 : 1;
  } else {
    // 若字元數量小於等於2，則直接加上去。
    result += charCount[i];
  }
}
```

## 時間複雜度
因為需要遍歷整個字串，所以時間複雜度為O(n)。

> $O(n)$

## 空間複雜度
需要一個長度為26的陣列來存放字元數量，所以空間複雜度為O(1)。

> $O(1)$
