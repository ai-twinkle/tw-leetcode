# 3005. Count Elements With Maximum Frequency

You are given an array `nums` consisting of positive integers.

Return the total frequencies of elements in `nums` such that those elements all have the maximum frequency.

The frequency of an element is the number of occurrences of that element in the array.

**Constraints:**

- `1 <= nums.length <= 100`
- `1 <= nums[i] <= 100`

## 基礎思路

本題要我們找出陣列中出現頻率最高的數字，並回傳這些數字的**總出現次數**。
在思考解法時，我們需要特別注意幾個重點：

- 每個元素可能會重複出現，因此我們必須先統計每個數字的出現次數；
- 最後的答案不是最大頻率本身，也不是擁有最大頻率的數字個數，而是**這些數字總共出現了幾次**。

為了解決這個問題，我們可以採用以下策略：

- **頻率統計**：先掃過整個陣列，記錄每個數字的出現次數；
- **即時追蹤最大頻率**：在統計的同時，隨時記錄目前出現過的最大頻率；
- **同步累加**：如果某個數字的頻率等於或超過目前最大值，我就更新目前的累加總和；
- **常數空間優化**：由於數字的取值範圍已知是 1 到 100，我可以直接使用定長陣列來記錄頻率，這樣不但記憶體使用固定，也能提升查詢與更新的效率。

## 解題步驟

### Step 1：初始化直方圖與輔助變數

建立用來統計每個數字出現次數的直方圖，並初始化最大頻率與累加總和。

```typescript
// 固定大小直方圖（索引 0 不使用），TypedArray 預設為 0
const frequencyTable = new Uint8Array(101);

// 追蹤目前最大頻次與對應的總和
let maximumFrequency = 0;
let sumAtMaximum = 0;

// 快取長度以減少屬性存取
const length = nums.length;
```

### Step 2：單趟遍歷陣列並更新統計

逐一處理每個元素，更新其頻次，並根據狀況調整最大頻率與累加總和。

```typescript
// 單趟掃描輸入，更新頻次與答案
for (let index = 0; index < length; index += 1) {
  const value = nums[index]; // 題目保證 1 <= value <= 100

  // 更新該數值的頻次
  const nextFrequency = frequencyTable[value] + 1;
  frequencyTable[value] = nextFrequency;

  // 若產生新的最大頻次，重設總和
  if (nextFrequency > maximumFrequency) {
    maximumFrequency = nextFrequency;
    sumAtMaximum = nextFrequency;
  } else if (nextFrequency === maximumFrequency) {
    // 若追平最大頻次，將最大頻次加總
    sumAtMaximum += maximumFrequency;
  }
}
```

### Step 3：回傳總和結果

回傳所有出現頻率等於最大值的元素的總出現次數。

```typescript
// 回傳所有達到最大頻次的總出現次數
return sumAtMaximum;
```

## 時間複雜度

- 遍歷陣列一次，每次操作為 $O(1)$。
- 總時間複雜度為 $O(n)$。

> $O(n)$

## 空間複雜度

- 使用固定長度的直方圖與常數變數。
- 總空間複雜度為 $O(1)$。

> $O(1)$
