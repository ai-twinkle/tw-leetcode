# 1331. Rank Transform of an Array

Given an array of integers `arr`, replace each element with its rank.

The rank represents how large the element is. 
The rank has the following rules:

- Rank is an integer starting from 1.
- The larger the element, the larger the rank. If two elements are equal, their rank must be the same.
- Rank should be as small as possible.

**Constraints:**

- `0 <= arr.length <= 10^5`
- `-10^9 <= arr[i] <= 10^9`

## 基礎思路

本題要求將陣列中每個元素替換為其「排名」，排名規則為：數值越大排名越高，相同數值共享同一排名，且排名從 1 開始盡可能緊湊。

在思考解法時，可掌握以下核心觀察：

- **排名本質是排序後的相對位置**：
  若先將所有元素排序，排名即為每個值在去重後序列中的索引加一。

- **重複值共享排名，需先去重**：
  排序後若直接以索引對應排名，重複值會得到不同排名，因此需先對排序結果去重，使索引能正確反映唯一排名。

- **原始陣列的順序不可改變**：
  排名轉換需保留元素的原始位置，因此不能直接對原陣列排序，必須另行建立排序副本。

- **去重後可用二分搜尋取得排名**：
  對去重後的有序序列進行二分搜尋，能以 $O(\log n)$ 的時間精確定位每個元素的排名。

依據以上特性，可以採用以下策略：

- **複製原始陣列並排序**，保留原始順序以便後續對應。
- **原地去重排序副本**，使每個唯一值的索引加一即為其排名。
- **對每個原始元素進行二分搜尋**，在去重序列中找到其排名並填入結果陣列。

此策略兼顧正確性與效率，整體時間複雜度由排序主導。

## 解題步驟

### Step 1：處理空陣列的邊界情況

若輸入陣列為空，無須任何運算，可直接回傳空陣列。

```typescript
const length = arr.length;

// 提前處理空輸入以避免不必要的記憶體配置
if (length === 0) {
  return [];
}
```

### Step 2：複製原始陣列並排序

將原始陣列複製至 `Int32Array` 以利用原生數值排序的效能，排序後可得到從小到大的有序序列。

```typescript
// 複製至型別化陣列以利用更快的原生數值排序
const sorted = Int32Array.from(arr);
sorted.sort();
```

### Step 3：對排序結果原地去重

透過雙指標原地去重，使去重後序列中每個唯一值的索引加一能直接等於其排名；`uniqueCount` 記錄去重後的有效長度。

```typescript
// 原地去重，使索引加一直接等於每個值的排名
let uniqueCount = 1;

for (let index = 1; index < length; index++) {
  if (sorted[index] !== sorted[uniqueCount - 1]) {
    sorted[uniqueCount] = sorted[index];
    uniqueCount++;
  }
}
```

### Step 4：初始化結果陣列

建立與原始陣列等長的結果陣列，準備依序填入每個元素的排名。

```typescript
// 透過二分搜尋建立結果：找到的位置加一即為排名
const result = new Array<number>(length);
```

### Step 5：對每個元素進行二分搜尋以確定排名

遍歷原始陣列，對每個元素在去重後的有序序列中執行二分搜尋，找到目標值的位置後加一即為其排名，並寫入結果陣列。

```typescript
for (let index = 0; index < length; index++) {
  const target = arr[index];
  let low = 0;
  let high = uniqueCount - 1;

  // 在唯一排序值中定位目標
  while (low < high) {
    const mid = (low + high) >>> 1;

    if (sorted[mid] < target) {
      low = mid + 1;
    } else {
      high = mid;
    }
  }

  // 排名為在唯一排序序列中以 1 為基底的位置
  result[index] = low + 1;
}
```

### Step 6：回傳結果陣列

所有元素皆已填入對應排名，回傳結果陣列。

```typescript
return result;
```

## 時間複雜度

- 複製陣列需 $O(n)$；
- 排序需 $O(n \log n)$；
- 去重遍歷需 $O(n)$；
- 對每個元素進行二分搜尋共需 $O(n \log n)$。
- 總時間複雜度為 $O(n \log n)$。

> $O(n \log n)$

## 空間複雜度

- `sorted` 排序副本佔用 $O(n)$；
- `result` 結果陣列佔用 $O(n)$；
- 其餘皆為固定數量的輔助變數。
- 總空間複雜度為 $O(n)$。

> $O(n)$
