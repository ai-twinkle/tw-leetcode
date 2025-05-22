# 3160. Find the Number of Distinct Colors Among the Balls

You are given an integer `limit` and a 2D array `queries` of size `n x 2`.

There are `limit + 1` balls with distinct labels in the range `[0, limit]`. 
Initially, all balls are uncolored. For every query in `queries` that is of the form `[x, y]`, 
you mark ball `x` with the color `y`. After each query, you need to find the number of distinct colors among the balls.

Return an array result of length `n`, where `result[i]` denotes the number of distinct colors after $i^{th}$ query.

Note that when answering a query, lack of a color will not be considered as a color.

**Constraints:**

- `1 <= limit <= 10^9`
- `1 <= n == queries.length <= 10^5`
- `queries[i].length == 2`
- `0 <= queries[i][0] <= limit`
- `1 <= queries[i][1] <= 10^9`

## 基礎思路

由於每次查詢都要求出當前所有球的**不同顏色數量**，我們需要模擬整個染色過程，並能夠即時地追蹤每個顏色的分布情形。

為了有效地完成這個任務，我們可以使用兩個映射（Map）結構：

1. **球的顏色對應表（`ballColor`）**：紀錄每個已經被染色的球目前的顏色。
2. **顏色計數表（`colorCount`）**：紀錄每種顏色目前出現了多少次。

每次染色操作時：

- 先判斷這顆球之前是否已經有顏色。如果有，則需要將原本顏色的計數減一；如果減到零，則將該顏色從計數表中移除。
- 接著將球染上新顏色，並更新新顏色的計數。
- 最後，計算當下不同顏色的數量（即`colorCount`的鍵數量），作為這一步的答案。

## 解題步驟

### Step 1: 初始化對應表

```typescript
const ballColor = new Map<number, number>();  // 紀錄有被染色的球的顏色
const colorCount = new Map<number, number>(); // 紀錄每個顏色的數量
```

### Step 2: 模擬操作

```typescript
// 紀錄每次操作後的結果
const result: number[] = [];

for (const [index, color] of queries) {
  if (ballColor.has(index)) {
    // 如果該球已經被染色，我們需要將原本的顏色數量減一
    const prevColor = ballColor.get(index)!;
    const count = colorCount.get(prevColor)!;
    if (count === 1) {
      // 當數量洽為 1 時，我們需要將這個顏色從對應表中移除
      colorCount.delete(prevColor);
    } else {
      // 減少前一個顏色的數量
      colorCount.set(prevColor, count - 1);
    }
  }

  // 將球染上新的顏色
  ballColor.set(index, color);
  // 增加新的顏色數量
  colorCount.set(color, (colorCount.get(color) || 0) + 1);

  // 紀錄當前的顏色數量
  result.push(colorCount.size);
}
```

## 時間複雜度

- 我們需要進行 `n` 次操作，故時間複雜度為 $O(n)$
- 總時間複雜度為 $O(n)$

> $O(n)$

## 空間複雜度

- 我們需要儲存每個被更新球的對應表，最壞下會全部都被更新，故空間複雜度為 $O(n)$
- 對於顏色數量的對應表，如果每次查詢的顏色都不同，也會是 $O(n)$ 的空間複雜度
- 總空間複雜度為 $O(n)$

> $O(n)$
