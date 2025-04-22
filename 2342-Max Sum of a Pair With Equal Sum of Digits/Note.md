# 2342. Max Sum of a Pair With Equal Sum of Digits

You are given a 0-indexed array nums consisting of positive integers. 
You can choose two indices `i` and `j`, such that `i != j`, and 
the sum of digits of the number `nums[i]` is equal to that of `nums[j]`.

Return the maximum value of `nums[i] + nums[j]` that 
you can obtain overall possible indices `i` and `j` that satisfy the conditions.

## 基礎思路

將「從陣列中找出一對數字，使它們具有相同的數位和且總和最大」這一問題轉化為
「對於每個可能的數位和，我們希望記錄下目前見到的最大數字，這樣當遇到另一個具有相同數位和的數字時，就可以快速計算出一個候選總和。」

我們可以利用一個映射（例如固定大小的陣列或散列表），將每個數位和與當前最大的數字關聯。  
每次處理一個新數字時，
- 我們只關注「數位和」這一特徵，而非數字本身。
- 查詢映射時，看是否已存在相同數位和的數字。如果存在，這個數字與當前數字組成一個候選解，計算總和並更新全局最優值。
- 不論是否形成了候選解，都要更新該數位和對應的數字為更大的那個，確保映射中始終保存著局部最優選擇。

透過一次遍歷所有數字、及時更新映射和候選總和，我們最終能夠得到全局最優解，而無需暴力比較所有數對。

> Tips
> - 題目是有限 $1 <= \text{nums}[i] <= 10^9$ 的數字，所以數位和最大為 81。
> - 用陣列替代散列表，可以提高效率。

## 解題步驟

### Step 1: 初始化映射

根據題目定義的有效範圍，我們可以確定數位和的最大值為 81。
我們可以用一個固定大小為 82 的陣列 `best` 來保存每個數位和對應的最大數字。
初始化時，將所有元素設為 -1，表示尚未見過該數位和。

```typescript
const maxDigitSum = 81;
const best: number[] = new Array(maxDigitSum + 1).fill(-1);
```

### Step 2: 遍歷所有數字

對於每個數字，我們計算其數位和，並查詢映射 `best`。
- 如果該數位和已經見過，則更新全局最優值 `maxSum` 和該數位和對應的最大數字。
- 如果該數位和尚未見過，則將該數字存入映射。

```typescript
let maxSum = -1;
for (const num of nums) {
  let sum = 0;
  // 計算數位和
  for (let n = num; n > 0; n = Math.floor(n / 10)) {
    sum += n % 10;
  }

  if (best[sum] !== -1) {
    // 更新全局最優值與映射
    maxSum = Math.max(maxSum, num + best[sum]);
    best[sum] = Math.max(best[sum], num);
  } else {
    // 尚未見過該數位和則存入映射
    best[sum] = num;
  }
}
```

## 時間複雜度

- 我們須遍歷所有數字，這需要 $O(n)$ 的時間。
- 計算數位和的時間最多 10 次迴圈 (數字最大為 $10^9$)，因此時間複雜度為 $O(1)$。
- 總時間複雜度為 $O(n)$。

> $O(n)$

## 空間複雜度
- 映射 `best` 的不論有多少元素，空間複雜度都是固定長度的 $O(1)$。
- 其餘變數和常數的空間複雜度也是 $O(1)$。
- 總空間複雜度為 $O(1)$。

> $O(1)$
