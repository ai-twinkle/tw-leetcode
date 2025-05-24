# 2379. Minimum Recolors to Get K Consecutive Black Blocks

You are given a 0-indexed string `blocks` of length `n`, 
where `blocks[i]` is either `'W'` or `'B'`, representing the color of the $i_{th}$ block. 
The characters `'W'` and `'B'` denote the colors white and black, respectively.

You are also given an integer `k`, which is the desired number of consecutive black blocks.

In one operation, you can recolor a white block such that it becomes a black block.

Return the minimum number of operations needed such that there is at least one occurrence of `k` consecutive black blocks.

**Constraints:**

- `n == blocks.length`
- `1 <= n <= 100`
- `blocks[i]` is either `'W'` or `'B'`.
- `1 <= k <= n`

## 基礎思路

本題目要求找到一段長度為 $k$ 的連續區段，並讓這段區段全部變成黑色區塊。
每次操作可以將一個白色區塊染成黑色。
這類需要在區間內計算某種性質（例如白色區塊數量）的題目，最常見且高效的方式就是滑動窗口法。

解法上，只要滑動一個長度為 $k$ 的窗口，統計每個窗口內白色區塊 ('W') 的數量，並維護一個最小值即可。
這個最小值就是我們要的最少重新上色次數。

若某個窗口內已經沒有白色區塊，代表已經出現 $k$ 個連續黑色區塊，可以直接返回 $0$。

## 解題步驟

### Step 1: 初始化變數

我們需要取得字串長度，並初始化目前窗口內的白色區塊數。

```typescript
const n = blocks.length;
let currentRecolors = 0;
```

### Step 2: 計算第一個窗口內的白色區塊數量

我們計算前 $k$ 個區塊中有多少個白色區塊，並同步初始化最小上色次數。
如果第一個窗口全是黑色，直接回傳 0。

```typescript
for (let i = 0; i < k; i++) {
  if (blocks[i] === 'W') {
    currentRecolors++;
  }
}

let minRecolors = currentRecolors;

// 如果第一個窗口內的白色區塊數量為0，則直接返回0
if (minRecolors === 0) {
  return 0;
}
```

### Step 3: 滑動窗口

從第 $k$ 個區塊開始，往右滑動，分別考慮新滑入和舊滑出的區塊是否為白色，並維護當前窗口的白色區塊數，同時更新最小上色次數。

```typescript
for (let i = k; i < n; i++) {
  if (blocks[i] === 'W') {
    // 如果最右邊的區塊是白色，則滑入一個白色區塊
    currentRecolors++;
  }
  if (blocks[i - k] === 'W') {
    // 如果最左邊的區塊是白色，則滑出一個白色區塊
    currentRecolors--;
  }
  
  // 更新最少需要重新上色的次數
  minRecolors = Math.min(minRecolors, currentRecolors);

  // 如果最少需要重新上色的次數為0，則直接返回0
  if (minRecolors === 0) {
    return 0;
  }
}
```

### Step 4: 返回結果

當所有窗口滑動完後，返回最小上色次數。

```typescript
return minRecolors;
```

## 時間複雜度

- 我們計算滑動窗口內的白色區塊數量的時間會隨者字串長度 $n$ 而增加。故時間複雜度為 $O(n)$。
- 總時間複雜度為 $O(n)$。

> $O(n)$

## 空間複雜度

- 我們只需要常數空間來儲存變數，故空間複雜度為 $O(1)$。
- 總空間複雜度為 $O(1)$。

> $O(1)$
