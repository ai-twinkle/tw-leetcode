# 2381. Shifting Letters II

You are given a string s of lowercase English letters and a 2D integer array shifts where shifts[i] = [start_i, end_i, direction_i]. 
For every i, shift the characters in s from the index start_i to the index end_i (inclusive) forward if direction_i = 1, or shift the characters backward if direction_i = 0.

Shifting a character **forward** means replacing it with the next letter in the alphabet (wrapping around so that 'z' becomes 'a'). 
Similarly, shifting a character **backward** means replacing it with the previous letter in the alphabet (wrapping around so that 'a' becomes 'z').

Return the final string after all such shifts to s are applied.

## 基礎思路
由於執行多次字串操作，為了減少運行時間，可以先計算變更後的偏移量，再進行字串操作。

## 解題步驟

### Step 1: 計算偏移量

```typescript
const n = s.length;
const diff = Array(n + 1).fill(0);

// 計算偏移量
for (const [start, end, direction] of shifts) {
  const increment = direction === 1 ? 1 : -1; // 由於1是正向，0是反向，所以可以直接用1和-1代表增加和減少
  diff[start] += increment;                   // 設定起始位置的偏移量，標記 start 後的偏移量
  diff[end + 1] -= increment;                 // 設定結束位置的偏移量，標記需要復原的 end + 1 後的偏移量，所以用 -increment
}
```

### Step 2: 計算最終字串

```typescript
let shift = 0;              // 初始化偏移量，用於累積所有的偏移變化
const result = s.split(''); // 將字串轉換為字元陣列，以便逐一修改字元

for (let i = 0; i < n; i++) {
  shift += diff[i]; // 累積當前字元應該應用的偏移量
  result[i] = String.fromCharCode(
    // 計算偏移後的新字元：
    // 1. 將字元轉換為 0~25 的範圍：'a' -> 0, 'z' -> 25
    // 2. 加上累積偏移量 shift，考慮正負偏移
    // 3. 確保結果在 0~25 內，透過 (x % range + range) % range 解決負數問題
    // 4. 將結果轉換回 ASCII 碼，加上 97
    ((result[i].charCodeAt(0) - 97 + shift) % 26 + 26) % 26 + 97
  );
}
```

## 時間複雜度
由於需要遍歷所有的字元，所以時間複雜度為 O(n)。

## 空間複雜度
需要額外使用一個大小為 n + 1 的陣列來記錄偏移量，所以空間複雜度為 O(n)。