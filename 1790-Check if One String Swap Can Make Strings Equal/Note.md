# 1790. Check if One String Swap Can Make Strings Equal

You are given two strings `s1` and `s2` of equal length. 
A string swap is an operation where you choose two indices in a string (not necessarily different) and 
swap the characters at these indices.

Return `true` if it is possible to make both strings equal by performing at most one string swap on exactly one of the strings. 
Otherwise, return `false`.

## 基礎思路
根據題意我們可以拆解成以下幾個情況

- `s1` 和 `s2` 相等，直接返回 `true`
- `s1` 和 `s2` 不相等，但不同的 char 數量超過 2，直接返回 `false`
- `s1` 和 `s2` 不相等，但不同的 char 數量為 2，令不同的 index 為 `i` 和 `j`， 
   則需檢查 `s1[i]` 和 `s2[j]` 是否相等，以及 `s1[j]` 和 `s2[i]` 是否相等
  - 如果相同，則返回 `true`
  - 如果不同，則返回 `false`

這樣就能實現這個問題了

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
- 遍歷整個字串，時間複雜度為 $O(n)$
- 總時間複雜度為 $O(n)$

> $O(n)$

## 空間複雜度
- 額外使用了 `differentCount` 與 `swapIndexes` 兩個變數，空間複雜度為 $O(1)$
- 總空間複雜度為 $O(1)$

> $O(1)$
