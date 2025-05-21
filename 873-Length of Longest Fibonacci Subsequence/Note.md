# 873. Length of Longest Fibonacci Subsequence

A sequence $x_1, x_2, ..., x_n$ is Fibonacci-like if:

- $n >= 3$
- $x_i + x_{i+1} == x_{i+2}$ for all $i + 2 <= n$

Given a strictly increasing array `arr` of positive integers forming a sequence, 
return the length of the longest Fibonacci-like subsequence of `arr`. 
If one does not exist, return `0`.

A subsequence is derived from another sequence `arr` by 
deleting any number of elements (including none) from `arr`, 
without changing the order of the remaining elements. 
For example, `[3, 5, 8]` is a subsequence of `[3, 4, 5, 6, 7, 8]`.

**Constraints:**

- `n == grid.length`
- `n == grid[i].length`
- `1 <= n <= 500`
- `grid[i][j]` is either `0` or `1`.

## 基礎思路

我們可以把問題視為對任意連續三個數 $a,b,c$，必須滿足 $a+b=c$。如果不存在這樣的序列，則返回 0。
我們使用動態規劃（DP）的方式來記錄以某對數結尾的 Fibonacci 樣子序列的長度。

對於陣列中的每一對 $(i,j)$ （其中  $i<j$），我們檢查是否存在一個索引 $k$ 使得：

$$
arr[k] + arr[i] = arr[j]
$$

- 如果存在，則可以從以 $(k,i)$ 結尾的序列延伸出新的序列，其長度為 $dp[k,i]+1$；
- 如果不存在，則該對數只能作為初始的 2 長序列。

由於題目中 $arr.length ≤ 1000$，我們可以利用位運算將兩個索引打包成一個整數：
 - 將第一個索引 $i$ 左移 16 位（即 $i ≪ 16$），再用按位或操作把第二個索引 $j$ 合併進來，即 $(i ≪ 16)∣j$。
 - 這樣可以確保生成的整數鍵唯一且運算速度極快，因為數字操作遠比字串連接快。

## 解題步驟

### Step 1: 初始變數並建立數字到索引的映射

建立索引表可以幫助我們快速查找某個數字的索引，使其在後面運算以 $O(1)$ 時間內完成查找。

```typescript
const n = arr.length;

const indexMap = new Map<number, number>();
for (let i = 0; i < n; i++) {
   indexMap.set(arr[i], i);
}
```

### Step 2: 建立動態規劃表

我們可使用 Map 來保存 dp 狀態，dp 的 key 用 `(i << 16) | j` 表示，
代表以 `arr[i] 與 arr[j]` 為結尾的 Fibonacci-like 序列。

```typescript
const dp = new Map<number, number>();
let maxLen = 0;
```

### Step 3: 遍歷所有可能的序列

針對每個數對 $(i,j)$，我們檢查是否存在一個索引 $k$ 使得 $arr[k] + arr[i] = arr[j]$。
如果該條件成立，則更新 dp 表，代表找到更長的以 $(i,j)$ 結尾的序列。
這樣能確保在遍歷過程中，我們能找到最長的 Fibonacci-like 序列。

```typescript
for (let j = 1; j < n; j++) {
   for (let i = 0; i < j; i++) {

      // 3.1 對於以 arr[i] 和 arr[j] 結尾的序列，理想的前一個數應為 arr[j] - arr[i]
      const prev = arr[j] - arr[i];

      // 3.2 由於序列必須嚴格遞增，前一個數必須小於 arr[i]
      // 且必須存在於原始陣列中
      if (prev < arr[i] && indexMap.has(prev)) {
         // 找到前一個數所在的索引 k
         const k = indexMap.get(prev)!;

         // 3.3 從 dp 中取得以 (k, i) 結尾的序列長度，若不存在則默認為 2（即只有 k 與 i 兩個數）
         const key = (k << 16) | i; // 將 k 和 i 打包成一個唯一的鍵
         const currentLength = (dp.get(key) || 2) + 1;

         // 3.4 更新 dp，設置以 (i, j) 為結尾的序列長度
         dp.set((i << 16) | j, currentLength);

         // 3.5 同時更新 maxLength
         maxLength = Math.max(maxLength, currentLength);
      }
   }
}
```

### Step 4: 返回結果

當然如果最長的 Fibonacci-like 序列長度小於 3，則返回 0。
這代表在原始陣列中不存在符合條件的序列。

```typescript
return maxLength >= 3 ? maxLength : 0;
```

## 時間複雜度

- 主要有兩層迴圈：外層迴圈 j 從 1 到 n-1，內層迴圈 i 從 0 到 j。
- 每次迴圈內的操作（包括 Map 查詢、位運算、數學計算）都是常數時間操作。
- 總時間複雜度為 $O(n^2)$。

> $O(n^2)$

## 空間複雜度

- 建立了一個索引 Map，其大小為 $O(n)$。
- 動態規劃 Map（dp）的鍵的數量在最壞情況下可能達到所有 $\frac{n(n-1)}{2}$ 對，故其空間複雜度為 $O(n^2)$。
- 總空間複雜度為 $O(n^2)$。

> $O(n^2)$
