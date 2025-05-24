# 2381. Shifting Letters II

You are given a string `s` of lowercase English letters and a 2D integer array `shifts` where `shifts[i] = [start_i, end_i, direction_i]`. 
For every `i`, shift the characters in `s` from the index `start_i` to the index `end_i` (inclusive) forward if `direction_i = 1`, 
or shift the characters backward if `direction_i = 0`.

Shifting a character **forward** means replacing it with the next letter in the alphabet (wrapping around so that `'z'` becomes `'a'`). 
Similarly, shifting a character **backward** means replacing it with the previous letter in the alphabet (wrapping around so that `'a'` becomes `'z'`).

Return the final string after all such shifts to `s` are applied.

**Constraints:**

- `1 <= s.length, shifts.length <= 5 * 10^4`
- `shifts[i].length == 3`
- `0 <= start_i <= end_i < s.length`
- `0 <= direction_i <= 1`
- `s` consists of lowercase English letters.

## 基礎思路

本題需對字串多次指定區間進行字母「平移」操作，每個操作可以是正向（往後一個字母）或反向（往前一個字母），且允許重疊區間。

如果直接每次操作都對字串進行平移，將導致大量重複計算，效率不佳。
因此，可先用「差分陣列」記錄每個區間應該增加或減少多少偏移，最後一次計算所有偏移量，再統一完成字串轉換。

## 解題步驟

### Step 1: 計算每個字元的偏移量

首先，建立一個長度為 $n+1$ 的差分陣列 `diff`，用於記錄每個索引的「增量」與「減量」標記。

遍歷所有 `shifts` 操作並更新 `diff` 陣列：

- 若是正向（direction = 1）就在區間開頭加 1，區間結尾+1 處減 1；
- 若反向則分別做 -1。

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

### Step 2: 根據偏移量處理原字串

此時我們需將累積的偏移量作用到每一個字元上。
將原字串轉為字元陣列（便於更改），依序疊加偏移量並根據偏移計算每個字元的新值。

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

### Step 3: 返回最終結果

最後將字元陣列轉回字串並返回。

```typescript
return result.join('');
```

## 時間複雜度

- 差分標記：遍歷 $shifts$ 陣列，每次 $O(1)$，總共 $O(m)$，$m$ 為操作次數。
- 統計偏移並處理字串：遍歷 $n$ 個字元，每次 $O(1)$，總共 $O(n)$。
- 總時間複雜度為 $O(m + n)$。

> $O(m + n)$

## 空間複雜度

- 差分陣列：需長度 $n+1$ 的 diff 陣列，$O(n)$。
- 結果陣列：與原字串等長的陣列，$O(n)$。
- 其他變數皆為常數級。
- 總空間複雜度為 $O(n)$。

> $O(n)$
