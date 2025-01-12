# 2116. Check if a Parentheses String Can Be Valid

A parentheses string is a non-empty string consisting only of '(' and ')'. It is valid if any of the following conditions is true:

* It is ().
* It can be written as AB (A concatenated with B), where A and B are valid parentheses strings.
* It can be written as (A), where A is a valid parentheses string.

You are given a parentheses string s and a string locked, both of length n. locked is a binary string consisting only of '0's and '1's. For each index i of locked,

* If locked[i] is '1', you cannot change s[i].
* But if locked[i] is '0', you can change s[i] to either '(' or ')'.

Return true if you can make s a valid parentheses string. Otherwise, return false.

## 基礎思路
檢查平衡狀態，我們需要拆成兩個部分來看，一個是左括號是否能滿足閉合，另一個是右括號是否能滿足閉合。
對於左括號，遇到左括號或自由括號，則增加一個左括號，遇到一個鎖上右括號，則減少一個左括號。一旦平衡變成負數，則代表無法滿足左括號的閉合。直接返回false。
同理，右括號也做對應的處理。
只有當兩個方向的檢查都通過時，才說明字符串能夠重新排列形成有效的括號。

## 解題步驟

### Step 1: 基數直接返回false

```typescript
if (s.length % 2 !== 0) {
  return false;
}
```

### Step 2: 紀錄平衡狀態

```typescript
let forwardBalance = 0;
let backwardBalance = 0;
```

### Step 3: 檢查括號

```typescript
for (let i = 0; i < s.length; i++) {
  // 左括號檢查，若是左括號或自由括號，則平衡增加，否則減少
  forwardBalance += (s[i] === '(' || locked[i] === '0') ? 1 : -1;
  
  // 一旦平衡變成負數，則代表至少有一個左括號無法閉合
  if (forwardBalance < 0) {
    return false;
  }

  // 反向索引
  const reverseIndex = s.length - i - 1;
  
  // 右括號檢查，若是右括號或自由括號，則平衡增加，否則減少
  backwardBalance += (s[reverseIndex] === ')' || locked[reverseIndex] === '0') ? 1 : -1;
  
  // 一旦平衡變成負數，則代表至少有一個右括號無法閉合
  if (backwardBalance < 0) {
    return false;
  }
}
```

### Step 4: 返回結果

由於上方的檢查都通過，所以直接返回true。

```typescript
return true;
```

## 時間複雜度
我們只需要遍歷一次字符串，所以時間複雜度為O(n)。

## 空間複雜度
我們只需要常數空間來存儲平衡狀態，所以空間複雜度為O(1)。
