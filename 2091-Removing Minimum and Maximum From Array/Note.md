# 2091. Removing Minimum and Maximum From Array

You are given a 0-indexed array of distinct integers `nums`.

There is an element in `nums` that has the lowest value and an element that has the highest value. 
We call them the minimum and maximum respectively. 
Your goal is to remove both these elements from the array.

A deletion is defined as either removing an element from the front of the array or removing an element from the back of the array.

Return the minimum number of deletions it would take to remove both the minimum and maximum element from the array.

**Constraints:**

- `1 <= nums.length <= 10^5`
- `-10^5 <= nums[i] <= 10^5`
- The integers in `nums` are distinct.

## 基礎思路

本題要求在一個元素互異的陣列中，將**最小值**與**最大值**兩個元素同時移除，而每次刪除只能從陣列的最前端或最後端進行，求所需的最少刪除次數。

在思考解法時，可掌握以下核心觀察：

- **刪除操作具有前綴與後綴的本質**：
  由於只能從兩端移除元素，任何一組刪除方案的效果，必然等價於「移除一段前綴」加上「移除一段後綴」，中間剩餘的部分保持連續。

- **目標僅由兩個位置決定**：
  真正影響答案的並非數值本身，而是最小值與最大值所處的兩個位置；只要這兩個位置都被前綴或後綴涵蓋，即達成目標。

- **可行方案僅有三種型態**：
  兩個目標位置的涵蓋方式只有三種可能 —— 全部由前端涵蓋、全部由後端涵蓋，或前端涵蓋較早的那個、後端涵蓋較晚的那個。三者取最小值即為答案。

- **兩個位置的先後順序可先正規化**：
  最小值不一定出現在最大值之前，因此在套用上述公式前，先確立兩者的先後關係可讓推導統一而不必分岔討論。

依據以上特性，可以採用以下策略：

- **以單趟掃描同時定位最小值與最大值所在的位置**，由於元素互異，一個元素不可能同時刷新兩端紀錄，可省去多餘的比較。
- **將兩個目標位置正規化為「較前者」與「較後者」**。
- **分別計算三種涵蓋方式所需的刪除數量，取其最小值回傳**。

此策略僅需線性時間與常數額外空間，即可求得最佳解。

## 解題步驟

### Step 1：取得長度並處理單一元素的邊界情況

先取得陣列長度；若陣列只有一個元素，該元素同時身兼最小值與最大值，只需刪除一次即可完成，直接回傳。

```typescript
const length = nums.length;

// 只有一個元素時，該元素同時是最小值與最大值。
if (length === 1) {
  return 1;
}
```

### Step 2：初始化最值與其對應位置

以首個元素作為最小值與最大值的初始基準，並同時記錄其所在位置，作為後續掃描比較的起點。

```typescript
let minimumValue = nums[0];
let maximumValue = nums[0];
let minimumIndex = 0;
let maximumIndex = 0;
```

### Step 3：單趟掃描定位最小值與最大值

從第二個元素開始逐一掃描，每個元素先讀入區域變數再進行比較。由於元素互異，一個能刷新最小值的元素絕不可能同時刷新最大值，因此在更新最小值後可直接跳過後續比較，減少不必要的判斷。

```typescript
// 單趟掃描：每個元素只讀取一次到區域變數，最多比較兩次。
for (let index = 1; index < length; index++) {
  const currentValue = nums[index];

  // 新的最小值絕不可能同時是新的最大值，故可略過第二次比較。
  if (currentValue < minimumValue) {
    minimumValue = currentValue;
    minimumIndex = index;
    continue;
  }

  if (currentValue > maximumValue) {
    maximumValue = currentValue;
    maximumIndex = index;
  }
}
```

### Step 4：正規化兩個目標位置的先後順序

取出兩個目標位置後，若前者反而較大，則交換兩者，確保左側代表較早出現的目標、右側代表較晚出現的目標，使後續公式推導得以統一。

```typescript
let leftIndex = minimumIndex;
let rightIndex = maximumIndex;

// 正規化：使 leftIndex 為較早的目標，rightIndex 為較晚的目標。
if (leftIndex > rightIndex) {
  const temporaryIndex = leftIndex;
  leftIndex = rightIndex;
  rightIndex = temporaryIndex;
}
```

### Step 5：情況一，全部由前端刪除

第一種方案是從前端一路刪到較晚的目標為止，此時較早的目標自然也被涵蓋，所需次數即為該位置加一，先以此作為目前最佳解。

```typescript
// 情況一：從前端刪除直到涵蓋較晚的目標。
let bestDeletionCount = rightIndex + 1;
```

### Step 6：情況二，全部由後端刪除

第二種方案是從後端一路刪到較早的目標為止，同樣能一併涵蓋較晚的目標；計算其所需次數後與目前最佳解比較並更新。

```typescript
// 情況二：從後端刪除直到涵蓋較早的目標。
const deleteBothFromBack = length - leftIndex;

if (deleteBothFromBack < bestDeletionCount) {
  bestDeletionCount = deleteBothFromBack;
}
```

### Step 7：情況三，兩端各自涵蓋一個目標

第三種方案是由前端涵蓋較早的目標、由後端涵蓋較晚的目標，兩段刪除數量相加即為總次數；同樣與目前最佳解比較並更新。

```typescript
// 情況三：較早的目標由前端刪除，較晚的目標由後端刪除。
const deleteFromBothEnds = leftIndex + 1 + (length - rightIndex);

if (deleteFromBothEnds < bestDeletionCount) {
  bestDeletionCount = deleteFromBothEnds;
}
```

### Step 8：回傳最少刪除次數

三種方案皆已比較完畢，此時保留的即為最小值，直接回傳。

```typescript
return bestDeletionCount;
```

## 時間複雜度

- 僅以單趟線性掃描定位最小值與最大值，為 $O(n)$；
- 後續三種情況的計算與比較皆為常數時間。
- 總時間複雜度為 $O(n)$。

> $O(n)$

## 空間複雜度

- 僅使用固定數量的變數記錄最值、位置與候選答案；
- 未配置任何額外陣列或動態空間。
- 總空間複雜度為 $O(1)$。

> $O(1)$
