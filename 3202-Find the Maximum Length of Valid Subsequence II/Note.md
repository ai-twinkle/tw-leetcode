# 3202. Find the Maximum Length of Valid Subsequence II

You are given an integer array `nums` and a positive integer `k`.
A subsequence `sub` of `nums` with length `x` is called valid if it satisfies:

- `(sub[0] + sub[1]) % k == (sub[1] + sub[2]) % k == ... == (sub[x - 2] + sub[x - 1]) % k`.

Return the length of the longest valid subsequence of `nums`.

**Constraints:**

- `2 <= nums.length <= 10^3`
- `1 <= nums[i] <= 10^7`
- `1 <= k <= 10^3`

## 基礎思路

本題的核心要求尋找一個子序列，使得其中任意兩個相鄰元素的和取餘數後均相同：

即需滿足：

$$
(sub[0] + sub[1]) \bmod k = (sub[1] + sub[2]) \bmod k = \dots
$$

根據上述條件，若我們考慮子序列的餘數序列：

$$
r[i] = nums[i] \bmod k
$$

則可觀察到滿足上述條件的子序列必然具有以下特性：

- 若序列只有一種餘數，則一定滿足條件。
- 若序列包含至少兩種餘數，則必須滿足：

    - 偶數位置的元素具有相同餘數，奇數位置的元素具有另一種相同餘數。
    - 因此，最多只能由**兩種餘數交替出現**。

因此，我們可以利用以下策略：

- 計算所有數字的餘數頻率，取單一餘數頻率最高值作為候選答案。
- 透過動態規劃（DP）策略，考慮所有兩兩餘數之間的交替組合，以得出更佳答案。

最後，我們透過這兩種方式，就能夠找到滿足條件的最長子序列長度。

## 解題步驟

### Step 1：預先計算每個元素的餘數及頻率

我們首先建立兩個陣列來儲存：

- 每個數字對 `k` 取餘的結果。
- 每個餘數出現的頻率。

```typescript
const totalElements = nums.length;

// 預先計算每個元素的餘數及其頻率
const remainderArray = new Uint16Array(totalElements);
const residueFrequency = new Uint16Array(k);

for (let index = 0; index < totalElements; index++) {
  const currentResidue = nums[index] % k;
  remainderArray[index] = currentResidue;
  residueFrequency[currentResidue]++;
}
```

### Step 2：收集存在的餘數並初始化答案

在此步驟中，我們：

- 將有出現過的餘數收集起來，以便後續計算。
- 先將答案初始化為單一餘數情況下的最大頻率。

```typescript
const existingResidueList: number[] = [];
let longestValidSubsequence = 1;

for (let residueValue = 0; residueValue < k; residueValue++) {
  const frequency = residueFrequency[residueValue];
  if (frequency <= 0) {
    continue;
  }
  existingResidueList.push(residueValue);
  if (frequency > longestValidSubsequence) {
    longestValidSubsequence = frequency;
  }
}

const totalResidues = existingResidueList.length;
```

### Step 3：建立餘數索引映射表

我們將每個存在的餘數對應到一個壓縮過的索引，以優化DP過程中查詢效率。

```typescript
const residueToIndexMapping = new Int16Array(k);
residueToIndexMapping.fill(-1);

for (let i = 0; i < totalResidues; i++) {
  residueToIndexMapping[existingResidueList[i]] = i;
}
```

### Step 4：建立 DP 表格

我們定義 DP 表格為：

- `dpTable[i][j]` 表示當前以餘數 `i` 結尾且前一個元素餘數為 `j` 的情況下，子序列的最長長度。

```typescript
const dpTable = new Uint16Array(totalResidues * totalResidues);
```

### Step 5：更新 DP 表格，計算兩種餘數交替的情況

對於每個元素：

- 考慮將其餘數作為目前子序列的最後一個元素。
- 對所有可能的前一個餘數，更新 DP 表，紀錄能得到的最大長度。

```typescript
for (let currentElementIndex = 0; currentElementIndex < totalElements; currentElementIndex++) {
  const currentResidue = remainderArray[currentElementIndex];
  const currentResidueIndex = residueToIndexMapping[currentResidue];

  for (let previousResidueIndex = 0; previousResidueIndex < totalResidues; previousResidueIndex++) {
    if (previousResidueIndex === currentResidueIndex) {
      continue;  // 跳過相同餘數的情況，因為交替餘數必須不同
    }

    // 取得以「上一個餘數」為結尾的子序列長度，並嘗試延伸
    const previousLength = dpTable[previousResidueIndex * totalResidues + currentResidueIndex];
    const newLength = previousLength + 1;

    // 更新 DP 表
    dpTable[currentResidueIndex * totalResidues + previousResidueIndex] = newLength;

    // 更新目前最長合法子序列的長度
    if (newLength > longestValidSubsequence) {
      longestValidSubsequence = newLength;
    }
  }
}
```

### Step 6：回傳最終結果

遍歷完成後，即可得到最長子序列長度：

```typescript
return longestValidSubsequence;
```

## 時間複雜度

- 計算餘數及頻率：$O(n)$。
- 建立並初始化餘數相關資料結構：$O(k)$。
- DP 表更新：$O(n \times k)$。
- 總時間複雜度為 $O(nk + k^2)$。

> $O(nk + k^2)$

## 空間複雜度

- 儲存所有元素的餘數：$O(n)$。
- 儲存餘數頻率和索引映射：$O(k)$。
- DP 表空間複雜度：$O(k^2)$。
- 總空間複雜度為 $O(n + k^2)$。

> $O(n + k^2)$
