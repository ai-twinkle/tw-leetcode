# 1718. Construct the Lexicographically Largest Valid Sequence

Given an integer `n`, find a sequence that satisfies all of the following:

- The integer `1` occurs once in the sequence.
- Each integer between `2` and `n` occurs twice in the sequence.
- For every integer `i` between `2` and `n`, the distance between the two occurrences of `i` is exactly `i`.

The distance between two numbers on the sequence, `a[i] and a[j]`, is the absolute difference of their indices, `|j - i|`.

Return the lexicographically largest sequence. It is guaranteed that under the given constraints, there is always a solution.

A sequence `a` is lexicographically larger than `a` sequence `b` (of the same length) 
if in the first position where `a` and `b` differ, 
sequence `a` has `a` number greater than the corresponding number in `b`. 
For example, `[0,1,9,0]` is lexicographically larger than `[0,1,5,6]` because 
the first position they differ is at the third number, and `9` is greater than `5`.

**Constraints:**

- `1 <= n <= 20`

## 基礎思路

這題的解法可以透過優先分配最大數字到最前面，然後依序分配其餘數字至符合條件的位置。
當遇到無法分配的情況時，則回溯至上一個決策點並重新嘗試其他可能的選擇。
為了確保找到字典序最大的序列，分配過程應遵循從大到小的順序。

由於每個數字 $i$ 需要滿足「兩個相同數字間的距離恰好為 $i$」的約束，因此每一步的決策不僅影響當前的數字分配，也會影響後續數字的可行性。
這使得問題具有明顯的「選擇—驗證—回溯」特性，適合使用深度優先搜索（Depth-First Search, DFS）來依序嘗試所有可能的數字分配方式。

DFS 的每一層遞歸負責選擇當前可放置的最大數字，並嘗試將其放置於符合條件的兩個索引位置。
一旦發現當前選擇導致後續無法完成完整排列，則回溯（Backtracking）撤銷當前選擇，並嘗試下一個可能的數字配置。
這樣的搜尋方式能夠確保在最短時間內找到字典序最大的可行解，並有效避免不必要的重複計算。

### 圖解

Input: `n = 5`

Input: n = 5
```
[5   ,_   ,_   ,_   ,_   ,5   ,_   ,_   ,_   ]  // 在索引 0 放 5，並在 0+5=5 放 5
[5   ,4   ,_   ,_   ,_   ,5→4 ,_   ,_   ,_   ]  // 嘗試在索引 1 放 4，並在 1+4=5 放 4，但發現索引 5已被5占用 → backtrace
[5   ,3   ,_   ,_   ,3   ,5   ,_   ,_   ,_   ]  // 在索引 1 放 3，並在 1+3=4 放 3
[5   ,3   ,4   ,_   ,3   ,5   ,4   ,_   ,_   ]  // 嘗試在索引 2 放 4，並在 2+4=6 放 4
[5   ,3   ,4   ,2   ,3   ,5   ,4→2 ,_   ,_   ]  // 嘗試在索引 6 放 2，並在 6+2=8 放 2，但發現索引 4已被3占用 → backtrace
[5   ,3   ,1   ,_   ,3   ,5   ,_   ,_   ,_   ]  // 在索引 2 改放 1（1只出現一次）
[5   ,3   ,1   ,4   ,3   ,5   ,_   ,4   ,_   ]  // 在索引 3 放 4，並在 3+4=7 放 4
[5   ,3   ,1   ,4   ,3   ,5   ,2   ,4   ,2   ]  // 在索引 6 放 2，並在 6+2=8 放 2，此時找到解，提早停止搜索
```

最終合法序列:
```
[5, 3, 1, 4, 3, 5, 2, 4, 2]
```

## 解題步驟

### Step 1: 初始化變數

由於除了 `1` 之外的數字都會出現兩次，因此我們初始化一個長度為 `2*n-1` 的數組 `result`，並將所有元素初始化為 `0` (視為空位)。
對於每個數字 `i`，我們使用一個布爾數組 `used` 來標記是否已經使用過。

```typescript
const result: number[] = new Array(2 * n - 1).fill(0);
const used: boolean[] = new Array(n + 1).fill(false);
```

### Step 2: 深度優先搜索函數

我們定義一個深度優先搜索函數 `dfs`，其功能是填充 `result` 數組中的空位，並檢查是否滿足所有條件。
透過嘗試填入當前可用的最大數字，並檢查是否滿足「兩個相同數字間的距離恰好為 $i$」的約束，來進行遞歸搜索。
如果在某一步無法找到合法的填充方式，則回溯至上一個決策點並嘗試其他可能的選擇。

```typescript
const dfs = (index: number, result: number[], used: boolean[], n: number): boolean => {
  if (index === result.length) {
    // 當我們達到結果數組的末尾時，代表我們找到了一個合法序列
    return true;
  }

  if (result[index] !== 0) {
    // 如果當前索引已經填充，我們移動到下一個索引
    return dfs(index + 1, result, used, n);
  }

  // 我們從最大的數字開始填充，以確保字典序最大
  for (let i = n; i >= 1; i--) {
    if (used[i]) {
      // 當前數字已經被使用，我們跳過
      continue;
    }

    if (i === 1) {
      // 如果數字是 `1`，我們可以直接填充，不需要檢查第二次出現的位置
      used[i] = true;
      result[index] = i;

      if (dfs(index + 1, result, used, n)) {
        // 繼續遞歸搜索下一個索引，如果是有效序列，則返回 true
        return true;
      }

      // 如果無法找到有效序列，我們回溯
      used[i] = false;
      result[index] = 0;
    } else if (index + i < result.length && result[index + i] === 0) {
      // 當數字不是 `1` 且第二次出現的位置是空的時，我們填充兩個位置
      used[i] = true;
      result[index] = i;
      result[index + i] = i;

      if (dfs(index + 1, result, used, n)) {
        // 繼續遞歸搜索下一個索引，如果是有效序列，則返回 true
        return true;
      }

      // 如果無法找到有效序列，我們回溯
      used[i] = false;
      result[index] = 0;
      result[index + i] = 0;
    }
  }

  return false;
}
```

### Step 3: 執行深度優先搜索

我們從索引 `0` 開始執行深度優先搜索，並將結果存儲在 `result` 數組中。
當搜尋結束時 `result` 數組中存儲的即為字典序最大的合法序列。

```typescript
dfs(0, result, used, n);
```

### Step 4: 返回結果

最後，我們返回 `result` 數組作為最終結果。

```typescript
return result;
```

## 時間複雜度

- 在最壞情況下，DFS 回溯可能會嘗試每個位置最多 O(n) 種選擇，而遞迴深度約為 2n-1，因此最壞情況下的時間複雜度可估計為 $O(n^{2n})$。
- 總時間複雜度為 $O(n^{2n})$。

> $O(n^{2n})$

## 空間複雜度

- 結果序列（長度為 $2n-1$），空間複雜度為 $O(n)$。
- 用於標記數字是否已經使用的布爾數組（長度為 $n+1$），空間複雜度為 $O(n)$。
- 總空間複雜度為 $O(n)$。

> $O(n)$
