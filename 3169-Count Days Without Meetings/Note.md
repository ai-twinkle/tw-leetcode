# 3169. Count Days Without Meetings

You are given a positive integer `days` representing the total number of days an employee is available for work (starting from day 1). 
You are also given a 2D array `meetings` of size `n` where, 
`meetings[i] = [start_i, end_i]` represents the starting and ending days of meeting `i` (inclusive).

Return the count of days when the employee is available for work but no meetings are scheduled.

Note: The meetings may overlap.

## 基礎思路

題目要求計算在指定的工作天數內，有哪些天數沒有安排任何會議。  
由於會議是以區間的形式表示，且可能存在重疊，因此我們首先要將所有會議按照起始日期排序，接著依序計算以下三段時間內的空閒天數：

1. 從第 1 天到第一個會議開始前一天的空閒天數。
2. 每兩個相鄰會議之間的空閒天數。
3. 從最後一個會議結束後，到工作天數結束的空閒天數。

最後將這三部分的空閒天數加總，即為員工在整段工作期間內完全沒有會議安排的天數。

## 解題步驟

### Step 1：初始檢查與排序

- **初始檢查**：  
  若 `meetings` 陣列為空，則表示整個期間皆無會議安排，直接回傳 `days`。

- **排序**：  
  將會議根據開始日期進行排序，以便後續依序計算各間隔區段。

```typescript
if (meetings.length === 0) {
  return days;
}

meetings.sort((a, b) => a[0] - b[0]);
```

### Step 2：計算第一個會議之前的空閒天數

- 計算第一個會議開始前的空閒天數，即 `meetings[0][0] - 1`，並將此數值初始化為 `freeDays`。

```typescript
let freeDays = meetings[0][0] - 1;
```

### Step 3：初始化最大結束日

- 設定 `maxEnd` 為第一個會議的結束日（`meetings[0][1]`），此變數用來記錄目前所覆蓋的最大日期。

```typescript
let maxEnd = meetings[0][1];
```

### Step 4：遍歷剩餘會議並累計空閒天數

- 循環遍歷從第二個會議開始的每個會議。
- 對每個會議，計算其開始日期與目前 `maxEnd` 之間的間隔天數，若存在間隔（即 `start - maxEnd - 1 > 0`），則將該間隔累加到 `freeDays`。
- 更新 `maxEnd` 為當前會議結束日與現有 `maxEnd` 的較大值，從而考慮會議重疊或相連的情況。

```typescript
for (let i = 1; i < meetings.length; i++) {
  const [start, end] = meetings[i];

  // 計算當前會議開始前與先前會議覆蓋區間之間的空閒天數
  freeDays += Math.max(0, start - maxEnd - 1);

  // 更新最大結束日
  maxEnd = Math.max(maxEnd, end);
}
```

### Step 5：計算最後一個會議之後的空閒天數

- 從最後一個會議結束日到工作天數結束（`days`）之間的空閒天數為 `days - maxEnd`，並將此數值加入 `freeDays`。

```typescript
freeDays += days - maxEnd;
```

### Step 6：回傳最終結果

- 回傳累計的 `freeDays` 作為最終答案。

```typescript
return freeDays;
```

## 時間複雜度

根據 [Time & Space Complexity of Array.sort in V8](https://blog.shovonhasan.com/time-space-complexity-of-array-sort-in-v8/) 的分析：

- **排序**：
    - 若陣列元素數超過 10 個，V8 採用 QuickSort，其平均時間複雜度為 $Θ(n \log(n))$。
    - 若陣列元素數 10 個或更少，則使用 InsertionSort，時間複雜度為 $O(n^2)$。  
      一般而言，我們在大規模資料情況下考慮平均情況，因此排序部分時間複雜度視為 $O(n \log n)$。

- **遍歷**：  
  對排序後的會議陣列進行一次遍歷，時間複雜度為 $O(n)$。

- 總時間複雜度為 $O(n \log n)$ (在大規模資料情況下)。

> $O(n \log n)$ (在大規模資料情況下)

## 空間複雜度

根據參考文章 [Time & Space Complexity of Array.sort in V8](https://blog.shovonhasan.com/time-space-complexity-of-array-sort-in-v8/) 的說明：

- **排序額外空間**：
    - 對於超過 10 個元素的陣列，V8 採用 QuickSort，其平均額外空間複雜度為 $O(\log n)$。
    - 對於 10 個元素或更少的陣列，則使用 InsertionSort，額外空間為 $O(1)$。  
      採用最保守分析，將額外空間複雜度視為 $O(\log n)$。

- **其他變數**：  
  其他輔助變數僅佔用常數空間。

- 總體空間複雜度為 $O(\log n)$。

> $O(\log n)$
