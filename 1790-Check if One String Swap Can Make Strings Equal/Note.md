# 1790. Check if One String Swap Can Make Strings Equal

You are given two strings `s1` and `s2` of equal length. 
A string swap is an operation where you choose two indices in a string (not necessarily different) and 
swap the characters at these indices.

Return `true` if it is possible to make both strings equal by performing at most one string swap on exactly one of the strings. 
Otherwise, return `false`.

**Constraints:**

- `1 <= s1.length, s2.length <= 100`
- `s1.length == s2.length`
- `s1` and `s2` consist of only lowercase English letters.

## 基礎思路

本題要求**判斷能否透過至多一次 swap 操作（在其中一個字串）使兩個字串相等**。

我們可以先分析哪些情境會成立：

- **情境一：兩字串本來就相等**
  若 `s1` 與 `s2` 完全一樣，直接回傳 `true`，不需要任何操作。

- **情境二：兩字串有超過兩個位置不同**
  由於一次 swap 最多能改變兩個位置，若不同位置超過兩個，一定無法只靠一次 swap 使兩字串相等。

- **情境三：恰好有兩個位置不同**
  這時有機會讓兩字串透過一次 swap 變成相等。
  需要檢查：

    - 對於這兩個不同的位置 $i$ 與 $j$，
      只要 $s1[i]$ 等於 $s2[j]$ 且 $s1[j]$ 等於 $s2[i]$，
      代表只要把 $s1$ 的第 $i$ 和 $j$ 個字元交換即可使兩字串完全相等。

最後，我們只需要依照上述情境進行判斷即可知道是否能透過一次 swap 使兩個字串相等。

## 解題步驟

### Step 1: 情況一

```typescript
// 情況一: s1 和 s2 相等
if (s1 === s2) {
  return true;
}
```

### Step 2: 初始化紀錄不同的 char 數量與 index

```typescript
let differentCount = 0;
const swapIndexes: number[] =  new Array(2);
```

### Step 3: 檢查不同的 char 數量與判別情況二

```typescript
for (let i = 0; i < s1.length; i++) {
  // 跳過相同的 char
  if (s1[i] === s2[i]) {
    continue;
  }

  // 情況二: s1 和 s2 不相等，但不同的 char 數量超過 2
  // 如果已經有兩個以上的不同 char，則不可能透過 swap 讓兩個 string 相等
  if (differentCount === 2) {
    return false;
  }

  // 紀錄不同位置的 index
  swapIndexes[differentCount] = i;

  // 增加不同的 char 數量
  differentCount++;
}
```

### Step 4: 情況三

```typescript
// 情況三: s1 和 s2 不相等，但不同的 char 數量為 2
//        我們需要檢查 s1[i] 和 s2[j] 是否相等，以及 s1[j] 和 s2[i] 是否相等 (代表交換後相等)
return s1[swapIndexes[0]] === s2[swapIndexes[1]] && s1[swapIndexes[1]] === s2[swapIndexes[0]];
```

## 時間複雜度

- 遍歷整個字串，時間複雜度為 $O(n)$。
- 總時間複雜度為 $O(n)$。

> $O(n)$

## 空間複雜度

- 額外使用了 `differentCount` 與 `swapIndexes` 兩個變數，空間複雜度為 $O(1)$。
- 總空間複雜度為 $O(1)$。

> $O(1)$
