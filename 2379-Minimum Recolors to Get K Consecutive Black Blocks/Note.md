# 2379. Minimum Recolors to Get K Consecutive Black Blocks

You are given a 0-indexed string `blocks` of length `n`, 
where `blocks[i]` is either `'W'` or `'B'`, representing the color of the $i_{th}$ block. 
The characters `'W'` and `'B'` denote the colors white and black, respectively.

You are also given an integer `k`, which is the desired number of consecutive black blocks.

In one operation, you can recolor a white block such that it becomes a black block.

Return the minimum number of operations needed such that there is at least one occurrence of `k` consecutive black blocks.

## 基礎思路

對於需要關注一段連續陣列的問題，可以使用滑動窗口的方法來解決。
我們可以比對每一個窗口內的白色區塊數量，找到最少的白色區塊數量，而該數量即為最少需要重新上色的次數。
如果有找到一個窗口內的白色區塊數量為0，則表示已經找到了一個連續的黑色區塊，可以直接返回0。

## 解題步驟

### Step 1: 初始化變數

我們需要初始化當前窗口內的白色區塊數量。

```typescript
const n = blocks.length;
let currentRecolors = 0;
```

### Step 2: 計算第一個窗口內的白色區塊數量

我們需要計算第一個窗口內的白色區塊數量。
並且，如果第一個窗口內的白色區塊數量為0，則直接返回0。

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

我們需要滑動窗口，並且計算每一個窗口內的白色區塊數量。

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

## 時間複雜度

- 我們計算滑動窗口內的白色區塊數量的時間會隨者字串長度 $n$ 而增加。故時間複雜度為 $O(n)$。
- 總時間複雜度為 $O(n)$。

> $O(n)$

## 空間複雜度

- 我們只需要常數空間來儲存變數，故空間複雜度為 $O(1)$。

> $O(1)$
