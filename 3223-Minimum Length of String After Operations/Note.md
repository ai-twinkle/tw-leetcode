# 3223. Minimum Length of String After Operations

You are given a string s.

You can perform the following process on s any number of times:

- Choose an index i in the string such that there is at least one character to the left of index i that is equal to s[i], 
  And at least one character to the right that is also equal to s[i].
- Delete the closest character to the left of index i that is equal to s[i].
- Delete the closest character to the right of index i that is equal to s[i].

Return the minimum length of the final string s that you can achieve.

**Constraints:**

- `1 <= s.length <= 2 * 10^5`
- `s` consists only of lowercase English letters.

## 基礎思路

本題的核心在於：**每次操作都會同時刪除目標字元左右各一個最近的相同字元**。
換句話說，每種字元每兩個可以成對移除。

需要特別注意的是，當字串長度小於等於2時，無法滿足操作條件，因此直接回傳原長度。

對於其他情況，可以分成兩類討論：

- 若某字元出現次數為**偶數**，經過多次操作後，最終會剩下0或2個；
- 若出現次數為**奇數**，最終則一定會剩下1個（最後那一個無法再配對刪除）。

因此，只要計算每種字元經過操作後剩下的數量，將其總和即為最終字串長度。


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

對於每一種字元：

- 如果次數大於2，則剩下 $1$（若奇數）或 $2$（若偶數）；
- 如果次數小於等於2，則照原本數量累加。

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

- 因為需要遍歷整個字串，所以時間複雜度為 $O(n)$。
- 總時間複雜度為 $O(n)$。

> $O(n)$

## 空間複雜度

- 需要一個長度為26的陣列來存放字元數量，所以空間複雜度為 $O(1)$。
- 總空間複雜度為 $O(1)$。

> $O(1)$
