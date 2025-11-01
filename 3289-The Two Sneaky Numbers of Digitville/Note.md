# 3289. The Two Sneaky Numbers of Digitville

In the town of Digitville, there was a list of numbers called `nums` containing integers from `0` to `n - 1`. 
Each number was supposed to appear exactly once in the list, however, two mischievous numbers sneaked in an additional time, making the list longer than usual.

As the town detective, your task is to find these two sneaky numbers. 
Return an array of size two containing the two numbers (in any order), so peace can return to Digitville.

**Constraints:**

- `2 <= n <= 100`
- `nums.length == n + 2`
- `0 <= nums[i] < n`
- The input is generated such that `nums` contains exactly two repeated elements.

## 基礎思路

本題要求在一個應該包含 `0` 到 `n - 1` 各一次的整數列表中，找出那兩個偷偷重複出現的數字。
題目保證：

- 整體長度為 `n + 2`（比預期多出 2 個元素）；
- 共有且僅有兩個數字出現兩次。

在思考解法時，我們需要掌握幾個重點：

- 每個數字介於 `0` 到 `n - 1`，範圍固定；
- 恰有兩個數字重複出現兩次；
- 其餘數字皆出現一次，因此我們可透過「出現次數」辨識重複者。

為了解決這個問題，我們可以採取以下策略：

- **建立頻率表**：使用雜湊結構（如 `Map`）來記錄每個數字出現次數；
- **偵測重複出現**：在每次更新頻率時檢查是否等於 2，若是則紀錄該數；
- **輸出結果**：題目保證正好兩個重複數，返回長度為 2 的陣列即可。

此法邏輯直觀、實作簡潔，且在題目限制下能以線性時間完成。

## 解題步驟

### Step 1：建立頻率表與結果陣列

宣告一個 `Map` 來記錄每個數字出現的次數，並建立空陣列用於儲存找到的重複數字。

```typescript
// 建立頻率映射表與儲存重複數的陣列
const frequencyMap = new Map<number, number>();
const duplicates: number[] = [];
```

### Step 2：遍歷整個陣列並統計出現次數

逐一讀取每個數字，若該數尚未出現則設為 1，否則累加次數。
若某數字次數達到 2，代表該數為重複數，立即加入結果陣列。

```typescript
// 逐一檢查 nums 中的每個數字
for (let i = 0; i < nums.length; i++) {
  // 更新該數字的出現次數
  frequencyMap.set(nums[i], (frequencyMap.get(nums[i]) || 0) + 1);

  // 若該數字出現第二次，加入結果陣列
  if (frequencyMap.get(nums[i]) === 2) {
    duplicates.push(nums[i]);
  }
}
```

### Step 3：返回結果陣列

當整個陣列處理完畢後，`duplicates` 陣列即包含兩個重複數字，直接回傳即可。

```typescript
// 返回兩個找到的重複數字
return duplicates;
```

---

## 輔助函數完整實作

```typescript
function getSneakyNumbers(nums: number[]): number[] {
  // 建立頻率映射表與儲存重複數的陣列
  const frequencyMap = new Map<number, number>();
  const duplicates: number[] = [];

  // 逐一檢查 nums 中的每個數字
  for (let i = 0; i < nums.length; i++) {
    // 更新該數字的出現次數
    frequencyMap.set(nums[i], (frequencyMap.get(nums[i]) || 0) + 1);

    // 若該數字出現第二次，加入結果陣列
    if (frequencyMap.get(nums[i]) === 2) {
      duplicates.push(nums[i]);
    }
  }

  // 返回兩個找到的重複數字
  return duplicates;
}
```

## 時間複雜度

- 需遍歷整個陣列一次以建立頻率表；
- `Map` 的查詢與更新操作平均為常數時間。
- 總時間複雜度為 $O(n)$。

> $O(n)$

## 空間複雜度

- 額外使用一個 `Map` 來記錄出現次數；
- `duplicates` 陣列只儲存兩個元素，為常數級別。
- 總空間複雜度為 $O(n)$。

> $O(n)$
