# 2375. Construct Smallest Number From DI String

You are given a 0-indexed string `pattern` of length `n` consisting of 
the characters `'I'` meaning increasing and `'D'` meaning decreasing.

A 0-indexed string `num` of length `n + 1` is created using the following conditions:

- `num` consists of the digits `'1'` to `'9'`, where each digit is used at most once.
- If `pattern[i] == 'I'`, then `num[i] < num[i + 1]`.
- If `pattern[i] == 'D'`, then `num[i] > num[i + 1]`.

Return the lexicographically smallest possible string `num` that meets the conditions.

**Constraints:**

- `1 <= pattern.length <= 8`
- `pattern` consists of only the letters `'I'` and `'D'`.

## 基礎思路

本題給定一個只包含 'I'（上升）與 'D'（下降）的字串 `pattern`，要求我們從 1~9 不重複的數字中，組成一個長度為 `pattern.length + 1` 的字串 `num`，使其同時滿足：

- 若 `pattern[i] == 'I'`，則 `num[i] < num[i+1]`
- 若 `pattern[i] == 'D'`，則 `num[i] > num[i+1]`
- 並且要求 `num` 在所有符合條件的字串中字典序最小。

這類型的問題可用「遞增排列」思維處理，但若直接暴力排列組合容易超時。
關鍵在於用堆疊 stack 來延遲決定下降區間的數字，讓字典序最小且局部順序正確。每當遇到 'I' 或已到達字串尾端，就把 stack 內容倒序加入結果，這樣所有 'D' 區段都會反轉，符合遞減需求，而連續 'I' 則及時輸出，確保字典序最小。

### 示例說明

Input: `pattern = "IIIDIDDD"`

```
resultDigits: [] // 最終結果數字，初始為空
stack: []        // 暫存數字的堆疊，初始為空
```

**i = 0**

```
resultDigits: []          // 尚未輸出數字
stack: [1]                // 推入 1

// 因為 pattern[0] 為 'I'，彈出 1 並輸出
resultDigits: [1]         // 輸出 1
stack: []                 // 清空
```

**i = 1**

```
resultDigits: [1]         // 當前結果：1
stack: [2]                // 推入 2

// 因為 pattern[1] 為 'I'，彈出 2 並輸出
resultDigits: [1, 2]      // 輸出 2
stack: []                 // 清空
```

**i = 2**

```
resultDigits: [1, 2]      // 當前結果：1,2
stack: [3]                // 推入 3

// 因為 pattern[2] 為 'I'，彈出 3 並輸出
resultDigits: [1, 2, 3]   // 輸出 3
stack: []                 // 清空
```

**i = 3**

```
resultDigits: [1, 2, 3]   // 當前結果：1,2,3
stack: [4]                // 推入 4

// 因為 pattern[3] 為 'D'，不彈出，等待後續數字以形成下降序列
resultDigits: [1, 2, 3]   // 結果保持不變
stack: [4]                // 保留 4
```

**i = 4**

```
resultDigits: [1, 2, 3]        // 當前結果：1,2,3
stack: [4, 5]                  // 推入 5，stack 為 [4, 5]

// 因為 pattern[4] 為 'I'，彈出 5 並輸出
resultDigits: [1, 2, 3, 5, 4]  // 輸出 5,4，滿足局部下降需求
stack: []                      // 清空
```

**i = 5**

```
resultDigits: [1, 2, 3, 5, 4]  // 當前結果：1,2,3,5,4
stack: [6]                     // 推入 6

// 因為 pattern[5] 為 'D'，不彈出，等待後續數字以形成下降序列
resultDigits: [1, 2, 3, 5, 4]  // 結果保持不變
stack: [6]                     // 保留 6
```

**i = 6**

```
resultDigits: [1, 2, 3, 5, 4]  // 當前結果：1,2,3,5,4
stack: [6, 7]                  // 推入 7，stack 為 [6, 7]

// 因為 pattern[6] 為 'D'，不彈出，等待後續數字以形成下降序列
resultDigits: [1, 2, 3, 5, 4]  // 結果保持不變
stack: [6, 7]                  // 保留 6,7
```

**i = 7**

```
resultDigits: [1, 2, 3, 5, 4]  // 當前結果：1,2,3,5,4
stack: [6, 7, 8]               // 推入 8，stack 為 [6, 7, 8]

// 因為 pattern[7] 為 'D'，不彈出，等待後續數字以形成下降序列
resultDigits: [1, 2, 3, 5, 4]  // 結果保持不變
stack: [6, 7, 8]               // 保留數字
```

**i = 8** (最後一次迭代)

```
resultDigits: [1, 2, 3, 5, 4]              // 當前結果：1,2,3,5,4
stack: [6, 7, 8, 9]                        // 推入 9，stack 為 [6, 7, 8, 9]

// 因為是最後一次迭代，彈出 stack 中所有數字
resultDigits: [1, 2, 3, 5, 4, 9, 8, 7, 6]  // 輸出 9,8,7,6，最終結果
stack: []                                  // 清空
```

**最終結果：**  

將 `resultDigits` 連接成字串，得到 `"123549876"`。

## 解題步驟

### Step 1: 初始化結果數字和堆疊

`resultDigits` 用來累積每一位答案，`stack` 則用來延遲決定某段數字的輸出順序。

```typescript
const resultDigits: number[] = []; // 最終結果
const stack: number[] = [];        // 臨時存放數字的堆疊
```

### Step 2: 遍歷 pattern 字串

每次將當前數字推入 stack 時，只要遇到 'I' 或最後一位（一定要全部輸出），就把 stack 內數字依序 pop（反序），接到結果陣列。
這樣能確保 'D' 形成遞減（反序），'I' 及時決定，整體字典序最小

```typescript
for (let i = 0; i <= pattern.length; i++) {
  // 推入下一個數字（i+1）到堆疊中。(由於數字是由 1 開始，所以是 i+1)
  stack.push(i + 1);

  if (i === pattern.length || pattern[i] === "I") {
    // 當遇到 'I' 或處理到最後一位數字時，彈出 stack 中所有數字
    while (stack.length) {
      // 彈出堆疊中的數字（反轉順序）並添加到結果數組中。
      resultDigits.push(stack.pop()!);
    }
  }
}
```

### Step 3: 將結果數字連接成字串

最後把數字陣列全部串接為一個字串，就是最小字典序的答案。

```typescript
return resultDigits.join("");
```

## 時間複雜度

- 遍歷 pattern 一次，每個字符至多會推入與彈出各一次，時間複雜度 $O(n)$，其中 $n$ 為 pattern 長度。
- 總時間複雜度為 $O(n)$。

> $O(n)$

## 空間複雜度

- 我們需要陣列，`resultDigits` 其最大長度為 $n+1$，空間複雜度為 $O(n)$。
- 我們需要一個堆疊，其最大長度為 $n$（全為 'D' 時），空間複雜度為 $O(n)$。
- 總空間複雜度為 $O(n)$。

> $O(n)$
