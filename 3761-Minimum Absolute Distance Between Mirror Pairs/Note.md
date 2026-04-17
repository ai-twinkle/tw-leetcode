# 3761. Minimum Absolute Distance Between Mirror Pairs

You are given an integer array `nums`.

A mirror pair is a pair of indices `(i, j)` such that:

- `0 <= i < j < nums.length`, and
- `reverse(nums[i]) == nums[j]`, where `reverse(x)` denotes the integer formed by reversing the digits of `x`. 
  Leading zeros are omitted after reversing, for example `reverse(120) = 21`.

Return the minimum absolute distance between the indices of any mirror pair. 
The absolute distance between indices `i` and `j` is `abs(i - j)`.

If no mirror pair exists, return `-1`.

**Constraints:**

- `1 <= nums.length <= 10^5`
- `1 <= nums[i] <= 10^9`

## 基礎思路

本題要求找出陣列中所有「鏡像對」的最小索引距離，其中鏡像對的定義為：某兩個位置的值互為數字反轉。
若不存在任何鏡像對，則回傳 `-1`。

在思考解法時，可掌握以下核心觀察：

- **鏡像關係具有方向性**：
  對於位置 `i` 和 `j`（`i < j`），需要 `reverse(nums[i]) == nums[j]`，即從左側看到的某個值的反轉，必須等於右側的某個值本身；
  因此掃描到右側值時，可查找左側是否有對應的反轉來源。

- **逐位掃描可將查找複雜度降至常數**：
  若使用雜湊表記錄每個「反轉值」最後一次出現的索引，則對於每個新元素，只需一次查詢即可得知是否存在配對，整體達成線性時間。

- **最近的配對才有意義**：
  為求最小距離，當同一個反轉值在多個位置出現時，只需保留最新索引；因為越晚出現的索引與後續配對的距離才可能更小。

- **距離 1 是理論最小值**：
  兩個相鄰元素若互為鏡像，距離為 1，不可能更小，因此一旦找到距離為 1 的配對可立即提前終止。

依據以上特性，可以採用以下策略：

- **以雜湊表將每個反轉值映射至其最新索引**，掃描時對每個元素查詢其本身是否曾作為某個左側元素的反轉值出現，並更新最小距離。
- **每輪在完成查詢後，再將當前元素的反轉值寫入雜湊表**，確保後續元素能查到正確的配對來源。
- **最終判斷是否找到合法配對**，若最小距離仍為初始的不可能值，則回傳 `-1`。

此策略僅需一次線性掃描配合常數時間的查表操作，整體效率最優。

## 解題步驟

### Step 1：實作數字反轉的輔助函數

對一個正整數逐位提取最低位，依序拼接到結果上，直到數字被清空為止；因為是從最低位開始組合，最終得到的結果即為原數字的數字反轉，前導零自然被省略。

```typescript
/**
 * 反轉一個非負整數的各位數字。
 * @param num - 要反轉的整數
 * @returns 省略前導零後的反轉整數
 */
function reverseNumber(num: number): number {
  let reversed = 0;
  while (num > 0) {
    // 提取最低位並附加到 reversed
    reversed = reversed * 10 + (num % 10);
    num = (num / 10) | 0;
  }
  return reversed;
}
```

### Step 2：初始化主函數所需的狀態

記錄陣列長度，並建立一個雜湊表，用來追蹤每個反轉值最後一次以「左側元素身份」出現的索引；同時將最小距離初始化為一個不可能達到的哨兵值，確保只有真實配對才能更新它。

```typescript
const length = nums.length;
// 雜湊表：反轉值 -> 最後一個產生該反轉值的索引
const reversedValueLastIndex = new Map<number, number>();

// 使用一個不可能的距離，使得提前終止只在真實配對出現時觸發
let minimumDistance = length + 1;
```

### Step 3：掃描陣列，查詢當前值是否為某個左側元素的鏡像

對每個位置，計算其值的反轉，並查詢雜湊表中是否有某個左側位置曾以此值的反轉作為反轉值；若存在，則計算距離並嘗試更新最小距離。

```typescript
for (let index = 0; index < length; index++) {
  const currentValue = nums[index];
  const currentReversed = reverseNumber(currentValue);

  // 檢查 nums[index] 是否與某個較早的 i 滿足 reverse(nums[i]) == nums[index]
  const previousIndex = reversedValueLastIndex.get(currentValue);
  if (previousIndex !== undefined) {
    const distance = index - previousIndex;
    if (distance < minimumDistance) {
      minimumDistance = distance;
    }
  }

  // ...
}
```

### Step 4：若最小距離已達理論下界則提前終止

距離 1 是任意兩個不同索引之間的最小可能間距，一旦發現此結果即可立即結束搜尋，無須繼續掃描。

```typescript
for (let index = 0; index < length; index++) {
  // Step 3：查詢當前值是否為某個左側元素的鏡像

  // 提前終止：距離 1 是理論最小值
  if (minimumDistance === 1) {
    return 1;
  }

  // ...
}
```

### Step 5：將當前元素的反轉值寫入雜湊表，供後續元素查詢

在完成查詢與提前終止的判斷後，將當前索引對應的反轉值登記到雜湊表中；若該反轉值已存在記錄，只在當前索引更新時才覆寫，確保雜湊表始終保留最新索引以最小化後續距離。

```typescript
for (let index = 0; index < length; index++) {
  // Step 3：查詢當前值是否為某個左側元素的鏡像

  // Step 4：若距離已為 1 則提前終止

  // 記錄 reverse(nums[index]) = currentReversed 於此索引產生
  const existingIndex = reversedValueLastIndex.get(currentReversed);
  if (existingIndex === undefined || index > existingIndex) {
    reversedValueLastIndex.set(currentReversed, index);
  }
}
```

### Step 6：回傳最終結果

掃描結束後，若最小距離仍為哨兵值，代表整個陣列中不存在任何鏡像對，回傳 `-1`；否則回傳找到的最小距離。

```typescript
return minimumDistance <= length ? minimumDistance : -1;
```

## 時間複雜度

- 陣列共 $n$ 個元素，每個元素進行一次數字反轉，數字最多 10 位，為 $O(1)$；
- 雜湊表的查詢與寫入皆為 $O(1)$，總掃描為 $O(n)$；
- 總時間複雜度為 $O(n)$。

> $O(n)$

## 空間複雜度

- 雜湊表最多儲存 $n$ 筆反轉值與索引的映射；
- 總空間複雜度為 $O(n)$。

> $O(n)$
