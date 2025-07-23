# 1717. Maximum Score From Removing Substrings

You are given a string `s` and two integers `x` and `y`. 
You can perform two types of operations any number of times.

- Remove substring `"ab"` and gain `x` points.
  - For example, when removing `"ab"` from `"cabxbae"` it becomes `"cxbae"`.
- Remove substring `"ba"` and gain `y` points.
  - For example, when removing `"ba"` from `"cabxbae"` it becomes `"cabxe"`.

Return the maximum points you can gain after applying the above operations on `s`.

**Constraints:**

- `1 <= s.length <= 10^5`
- `1 <= x, y <= 10^4`
- `s` consists of lowercase English letters.

## 基礎思路

本題的核心是透過適當的順序重複執行兩種操作：「移除子字串『ab』或『ba』並獲得相應分數」，以獲得最大化總分數。
由於每一次移除子字串操作皆會影響後續操作的可能性，我們必須採用「貪婪策略」來決定移除的順序：

- **貪婪策略**：

    - 若「ab」得分較高（即 $x \ge y$），則應先盡可能地移除所有「ab」，再移除所有剩餘的「ba」。
    - 反之，若「ba」得分較高，則先移除所有「ba」，再移除所有剩餘的「ab」。

為有效地實現上述策略，我們使用了模擬堆疊（stack）的方式進行遍歷，透過兩次掃描即可完成所有操作。

## 解題步驟

### Step 1：初始化與映射輸入字串為數值陣列

首先，先初始化所需的變數，並將輸入字串轉換成便於比較的數值陣列（Typed Array）：

```typescript
const stringLength = s.length;
const charCodeA = 'a'.charCodeAt(0);
const charCodeB = 'b'.charCodeAt(0);

// 將輸入字串 s 的每個字元轉為 ASCII 編碼，存入 Typed Array
const inputBuffer = new Uint8Array(stringLength);
for (let i = 0; i < stringLength; i++) {
  inputBuffer[i] = s.charCodeAt(i);
}

let totalScore = 0; // 初始化總得分
```

### Step 2：決定操作順序（貪婪策略）

比較 `x` 和 `y`，決定先移除哪個子字串能使總分數最大：

```typescript
let firstRemoveFirstCode, firstRemoveSecondCode, firstRemoveScore;
let secondRemoveFirstCode, secondRemoveSecondCode, secondRemoveScore;

if (x >= y) {
  // 若移除「ab」得分較高，則優先移除「ab」
  firstRemoveFirstCode = charCodeA; // 'a'
  firstRemoveSecondCode = charCodeB; // 'b'
  firstRemoveScore = x;

  secondRemoveFirstCode = charCodeB; // 'b'
  secondRemoveSecondCode = charCodeA; // 'a'
  secondRemoveScore = y;
} else {
  // 若移除「ba」得分較高，則優先移除「ba」
  firstRemoveFirstCode = charCodeB; // 'b'
  firstRemoveSecondCode = charCodeA; // 'a'
  firstRemoveScore = y;

  secondRemoveFirstCode = charCodeA; // 'a'
  secondRemoveSecondCode = charCodeB; // 'b'
  secondRemoveScore = x;
}
```

### Step 3：第一次遍歷 - 移除高分子字串

透過雙指標（讀寫指標）模擬堆疊操作，遍歷字串移除得分較高的子字串：

```typescript
let writePointer = 0; // 寫入指標作為堆疊的頂端

for (let readPointer = 0; readPointer < stringLength; readPointer++) {
  const currentCode = inputBuffer[readPointer];
  
  if (
    writePointer > 0 && 
    currentCode === firstRemoveSecondCode && 
    inputBuffer[writePointer - 1] === firstRemoveFirstCode
  ) {
    // 若找到匹配的高分子字串，移除並得分
    writePointer--; // 從堆疊頂移除元素
    totalScore += firstRemoveScore;
  } else {
    // 若未找到匹配，則將目前字元加入堆疊頂
    inputBuffer[writePointer++] = currentCode;
  }
}
```

### Step 4：第二次遍歷 - 移除低分子字串

第二次遍歷的對象為第一次遍歷後留下的字串殘餘部分，採相同方式移除低分子字串：

```typescript
let newWritePointer = 0; // 第二次遍歷的新寫入指標

for (let readPointer = 0; readPointer < writePointer; readPointer++) {
  const currentCode = inputBuffer[readPointer];
  
  if (
    newWritePointer > 0 && 
    currentCode === secondRemoveSecondCode && 
    inputBuffer[newWritePointer - 1] === secondRemoveFirstCode
  ) {
    // 若找到匹配的低分子字串，移除並得分
    newWritePointer--; // 從堆疊頂移除元素
    totalScore += secondRemoveScore;
  } else {
    // 若未找到匹配，則將目前字元加入堆疊頂
    inputBuffer[newWritePointer++] = currentCode;
  }
}
```

### Step 5：回傳最終得分結果

最後回傳累積的得分即為所求的最大分數：

```typescript
return totalScore;
```

## 時間複雜度

- 映射輸入字串至 Typed Array 為 $O(n)$。
- 第一次遍歷移除高分子字串為 $O(n)$。
- 第二次遍歷移除低分子字串為 $O(n)$。
- 總時間複雜度為 $O(n)$。

> $O(n)$

## 空間複雜度

- 使用長度為 $n$ 的 Typed Array 來儲存字元資料。
- 其他皆為常數空間的輔助變數。
- 總空間複雜度為 $O(n)$。

> $O(n)$
