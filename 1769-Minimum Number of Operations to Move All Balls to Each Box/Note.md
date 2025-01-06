# 1769. Minimum Number of Operations to Move All Balls to Each Box

You have n boxes. 
You are given a binary string boxes of length n, where boxes[i] is '0' if the ith box is empty, and '1' if it contains one ball.
In one operation, you can move one ball from a box to an adjacent box. Box i is adjacent to box j if abs(i - j) == 1. 
Note that after doing so, there may be more than one ball in some boxes.
Return an array answer of size n, where answer[i] is the minimum number of operations needed to move all the balls to the i_th box.
Each answer[i] is calculated considering the initial state of the boxes.

## 基礎思路
分解成兩個部分，第一部分是計算從左邊到右邊的"傳遞"次數，第二部分是計算從右邊到左邊的"傳遞"次數。

## 解題步驟

### Step 1: 初始化紀錄變數

```typescript
const n = boxes.length;                            // 總共有 n 個盒子
const operations: number[] = new Array(n).fill(0); // 紀錄每個盒子的操作次數

let count = 0; // 紀錄目前位置需要傳遞數量
let steps = 0; // 累積操作次數
```

### Step 2: 計算從左邊傳遞到右邊的操作次數

```typescript
// 順向計算 (從左邊傳遞到右邊)
for (let i = 0; i < n; i++) {
  operations[i] += steps; // 1. 把前一輪迭代的操作次數加到當前位置 (因為第三步已經傳遞到當前位置)
  
  // 2. 如果當前位置有球，需要增加之後需要傳遞的球數
  if (boxes[i] === '1') {
    count++;
  }
  
  // 3. 把球傳遞到下一個位置，累積操作次數
  steps += count;
}
```

此時，`operations` 變數中的值就是，僅考慮從左邊傳遞到右邊的操作次數。

### Step 3: 計算從右邊傳遞到左邊的操作次數

```typescript
count = 0; // 重置 count 變數
steps = 0; // 重置 steps 變數

// 逆向計算 (從右邊傳遞到左邊)
for (let i = n - 1; i >= 0; i--) {
  // 1. 添加前一輪迭代的操作次數 到 已經計算過的左到右傳遞的操作次數 上
  operations[i] += steps;
  
  // 2. 如果當前位置有球，需要增加之後需要傳遞的球數
  if (boxes[i] === '1') {
    count++;
  }
  
  // 3. 把球傳遞到下一個位置 (向左傳)，累積操作次數
  steps += count;
}
```

## 時間複雜度
由於只需要迭代兩次，共有 n 個盒子，所以時間複雜度為 O(n)。

## 空間複雜度
需要一個額外的空間來存儲操作次數，且大小為 n，所以空間複雜度為 O(n)。
