# 3420. Count Non-Decreasing Subarrays After K Operations

You are given an array `nums` of `n` integers and an integer `k`.

For each subarray of `nums`, you can apply up to `k` operations on it. 
In each operation, you increment any element of the subarray by 1.

Note that each subarray is considered independently, meaning changes made to one subarray do not persist to another.

Return the number of subarrays that you can make non-decreasing after performing at most `k` operations.

An array is said to be non-decreasing if each element is greater than or equal to its previous element, if it exists.

**Constraints:**

- `1 <= nums.length <= 10^5`
- `1 <= nums[i] <= 10^9`
- `1 <= k <= 10^9`

## 基礎思路

本題要求統計有多少個子陣列能在至多 `k` 次「將某元素加一」的操作下變成非遞減。
由於陣列長度可達 $10^5$，子陣列總數為平方級，不可能逐一計算成本，因此需要找出成本的結構性質，以線性方式完成統計。

在思考解法時，可掌握以下核心觀察：

- **單一子陣列的最小操作成本有明確公式**：
  只能增加不能減少，因此最佳做法是把每個元素提升到「從子陣列起點到該位置為止的前綴最大值」。最小成本等於所有元素與其前綴最大值的差距總和。

- **成本對左右端點皆具單調性**：
  固定左端時，右端越遠，加入的元素越多，成本只增不減。固定右端時，左端越往左，前綴最大值只會變大或不變，成本同樣只增不減。
  因此，左端往左移動時，可行的最遠右端只會往左收縮，適合以雙指標處理。

- **前綴最大值會把子陣列切成若干「領導者區塊」**：
  從左端起，每個刷新前綴最大值的位置都是一個領導者，它所管轄的區塊內所有元素都要提升到該領導者的值。這些領導者的值由左至右嚴格遞增，形成單調結構。

- **新增左端時只需合併區塊，移除右端時只需扣除單一元素**：
  新的左端值會吞併所有值不高於它的領導者區塊，成本增加量為「值的差距 × 區塊長度」。移除最右端元素時，只需扣除它與所屬領導者之間的差距。

依據以上特性，可以採用以下策略：

- **由右往左枚舉左端點**，並以單調堆疊維護目前視窗內的領導者區塊。
- **加入新左端時合併被吞併的區塊**，以區塊長度一次性更新總成本。
- **若成本超過上限，就從右側逐步縮小視窗**，扣除被移除元素的成本，必要時一併移除最右側的領導者。
- **每個左端點對應的合法右端點都是一段連續區間**，直接累加其長度即可。

此策略讓每個位置最多進出結構常數次，能以線性時間完成統計。

## 解題步驟

### Step 1：取得長度並轉換為型別化陣列

先記錄陣列長度，並將輸入複製為 `Int32Array`，讓後續的元素存取更快速且型別一致。

```typescript
const length = nums.length;

// 複製到型別化陣列以獲得快速且單態的元素存取（數值可容納於 int32）
const values = new Int32Array(nums);
```

### Step 2：建立領導者索引的雙端堆疊

使用一個固定長度的型別化陣列，搭配前端與尾端兩個指標，模擬可兩端彈出的結構。尾端存放最新加入的左端，前端存放視窗中最右側的領導者。

```typescript
// 領導者索引的堆疊：尾端為最新的 left，前端為最右側的領導者
const leaderStack = new Int32Array(length);
let frontIndex = 0;
let backIndex = 0;
```

### Step 3：初始化視窗右界、操作成本與答案計數

右界一開始位於陣列最後一個位置，成本與合法子陣列計數皆從 0 開始。

```typescript
let rightBound = length - 1;
let operationCost = 0;
let validSubarrayCount = 0;
```

### Step 4：由右往左枚舉左端點，並吞併不高於當前值的領導者區塊

每一輪取出新的左端值。只要堆疊尾端的領導者值不高於它，就把該區塊併入新左端的管轄範圍。區塊的結尾位置取決於它右邊的下一個領導者；若它已是最右側的區塊，則以右界加一作為結尾。區塊內每個元素都需改為提升到新的左端值，因此成本增加「值的差距 × 區塊長度」。

```typescript
for (let left = length - 1; left >= 0; left--) {
  const currentValue = values[left];

  // 新的左端值會接管所有最大值不高於它的領導者區塊
  while (backIndex > frontIndex && values[leaderStack[backIndex - 1]] <= currentValue) {
    backIndex--;
    const absorbedLeader = leaderStack[backIndex];
    const segmentEnd = backIndex > frontIndex ? leaderStack[backIndex - 1] : rightBound + 1;

    // 被吸收區塊中的每個元素現在都必須改為提升到 currentValue
    operationCost += (currentValue - values[absorbedLeader]) * (segmentEnd - absorbedLeader);
  }

  // ...
}
```

### Step 5：將當前左端推入堆疊成為新的領導者

吞併完成後，當前左端成為最左側的領導者，推入堆疊尾端。它自身不需任何操作，因此不增加成本。

```typescript
for (let left = length - 1; left >= 0; left--) {
  // Step 4：吞併不高於當前值的領導者區塊

  leaderStack[backIndex] = left;
  backIndex++;

  // ...
}
```

### Step 6：成本超過上限時從右側縮小視窗

若總成本大於 `k`，就逐步移除視窗最右端的元素。被移除元素的成本等於最右側領導者值與它之間的差距。若該元素本身就是最右側領導者，代表此區塊已被完全移除，需一併從前端彈出。

```typescript
for (let left = length - 1; left >= 0; left--) {
  // Step 4：吞併不高於當前值的領導者區塊

  // Step 5：推入當前左端作為新領導者

  // 從右側縮小視窗，直到總成本不超過 k
  while (operationCost > k) {
    const rightmostLeader = leaderStack[frontIndex];

    // 移除位於 rightBound 之元素所貢獻的成本
    operationCost -= values[rightmostLeader] - values[rightBound];

    if (rightmostLeader === rightBound) {
      frontIndex++;
    }
    rightBound--;
  }

  // ...
}
```

### Step 7：累加以當前左端為起點的合法子陣列數量

成本符合限制後，從左端到右界之間的每個位置都能作為合法的右端點，因此直接累加這段區間的長度。

```typescript
for (let left = length - 1; left >= 0; left--) {
  // Step 4：吞併不高於當前值的領導者區塊

  // Step 5：推入當前左端作為新領導者

  // Step 6：成本超過上限時從右側縮小視窗

  // 從 left 到 rightBound 的每個右端點都構成合法子陣列
  validSubarrayCount += rightBound - left + 1;
}
```

### Step 8：回傳合法子陣列總數

所有左端點處理完畢後，累計結果即為答案。

```typescript
return validSubarrayCount;
```

## 時間複雜度

- 每個索引最多被推入堆疊一次，也最多從尾端或前端彈出一次；
- 右界只會單調遞減，整體最多移動 $n$ 次；
- 其餘操作皆為常數時間。
- 總時間複雜度為 $O(n)$。

> $O(n)$

## 空間複雜度

- 需要一個型別化數值陣列與一個領導者堆疊，各為長度 $n$；
- 其餘僅使用固定數量的變數。
- 總空間複雜度為 $O(n)$。

> $O(n)$
