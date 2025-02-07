# 3160. Find the Number of Distinct Colors Among the Balls

You are given an integer `limit` and a 2D array `queries` of size `n x 2`.

There are `limit + 1` balls with distinct labels in the range `[0, limit]`. 
Initially, all balls are uncolored. For every query in `queries` that is of the form `[x, y]`, 
you mark ball `x` with the color `y`. After each query, you need to find the number of distinct colors among the balls.

Return an array result of length `n`, where `result[i]` denotes the number of distinct colors after $i^{th}$ query.

Note that when answering a query, lack of a color will not be considered as a color.

## 基礎思路
因為我們需要每個 `query` 操作後的結果，故我們需要模擬這個過程，並且記錄每次操作後的結果。
我們可以利用兩個對應表，一個是紀錄有被染色的球的顏色，另一個是紀錄每個顏色的數量。
當我們進行染色操作時，我們可以先檢查這個球是否已經被染色，如果已經被染色，我們就需要將原本的顏色數量減一，並且將新的顏色數量加一。
每次模擬操作後，當下的"顏色數量"就是我們的答案。

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
