# 2375. Construct Smallest Number From DI String

You are given a 0-indexed string `pattern` of length `n` consisting of 
the characters `'I'` meaning increasing and `'D'` meaning decreasing.

A 0-indexed string `num` of length `n + 1` is created using the following conditions:

* `num` consists of the digits `'1'` to `'9'`, where each digit is used at most once.
* If `pattern[i] == 'I'`, then `num[i] < num[i + 1]`.
* If `pattern[i] == 'D'`, then `num[i] > num[i + 1]`.

Return the lexicographically smallest possible string `num` that meets the conditions.

## 基礎思路

我們可以利用 stack 延遲輸出數字的時機。
當遇到連續的 `'D'` 時，我們將數字依序推入 stack；
一旦遇到 `'I'`（或處理到最後一位數字），就將 stack 中的數字全部彈出。
由於 stack 的後進先出性質，這正好可以將原本連續增加的數字反向輸出，從而滿足下降的要求，同時保證整體字串的字典順序最小。

---

## 示例說明

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

```typescript
const resultDigits: number[] = [];
const stack: number[] = [];
```

### Step 2: 遍歷 pattern 字串

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

```typescript
return resultDigits.join("");
```

## 時間複雜度

- 我們需要遍歷一次 pattern 字串，並對每個字符進行堆疊操作，時間複雜度為 $O(n)$。
- 總體時間複雜度為 $O(n)$。

> $O(n)$

## 空間複雜度

- 我們需要陣列，`resultDigits` 其最大長度為 $n+1$，空間複雜度為 $O(n)$。
- 我們需要一個堆疊，其最大長度為 $n$，空間複雜度為 $O(n)$。
- 總空間複雜度為 $O(n)$。

> $O(n)$
