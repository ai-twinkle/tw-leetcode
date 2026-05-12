# 1665. Minimum Initial Energy to Finish Tasks

You are given an array tasks where `tasks[i] = [actual_i, minimum_i]`:

- `actual_i` is the actual amount of energy you spend to finish the ith task.
- `minimum_i` is the minimum amount of energy you require to begin the ith task.

For example, if the task is `[10, 12]` and your current energy is `11`, 
you cannot start this task. 
However, if your current energy is `13`, you can complete this task, and your energy will be `3` after finishing it.

You can finish the tasks in any order you like.

Return the minimum initial amount of energy you will need to finish all the tasks.

**Constraints:**

- `1 <= tasks.length <= 10^5`
- `1 <= actual_i <= minimum_i <= 10^4`

## 基礎思路

本題要求找出完成所有任務所需的最少初始能量。每個任務有「消耗量」與「最低門檻」兩個參數，必須在能量達到門檻時才能開始，完成後能量減去消耗量。任務可任意排序，目標是讓所需的初始能量最小化。

在思考解法時，可掌握以下核心觀察：

- **順序影響起始需求**：
  不同的任務排序會影響在每個任務執行時所需的能量，因此選擇最佳排序是問題的核心。

- **「緩衝空間」決定排序優先級**：
  每個任務的門檻與消耗量之差（即緩衝空間）越大，代表該任務對起始能量的「額外要求」越高；若將緩衝空間大的任務排在前面執行，便可讓這份額外要求分攤到較少的前置累積消耗上，從而降低整體所需的初始能量。

- **最優排序為緩衝空間降序**：
  可以用交換論證（exchange argument）證明：任意兩個相鄰任務若緩衝空間較大者排在後面，則交換後整體所需初始能量不增；因此最優排序必為緩衝空間由大到小。

- **一次線性掃描即可計算答案**：
  確定排序後，從前往後累加實際消耗量，同時追蹤「目前累積消耗 + 當前任務門檻」的最大值，即為所需的最少初始能量。

依據以上特性，可以採用以下策略：

- **以位元編碼將多欄位資訊壓縮為單一數值**，利用原生型別陣列的排序速度大幅降低排序開銷，無須自訂比較函數。
- **升序排序後反向遍歷**，等價於按緩衝空間降序處理所有任務。
- **逐步解碼並追蹤所需能量的最大值**，一次遍歷即可得出答案。

此策略在保持演算法正確性的同時，充分利用型別陣列的效能優勢，兼顧理論最優與實作效率。

## 解題步驟

### Step 1：快速處理只有一個任務的情況

若只有一個任務，所需的初始能量就是該任務的門檻值，無需排序或其他計算，可直接回傳。

```typescript
const taskCount = tasks.length;

// 單一任務的快速路徑：答案即為其最低門檻。
if (taskCount === 1) {
  return tasks[0][1];
}
```

### Step 2：定義位元位移常數並將每個任務壓縮編碼為單一數值

為了利用原生型別陣列排序的高效能，將每個任務的緩衝空間、門檻與消耗量三個欄位，以固定倍數位移壓縮成一個浮點數；排序後只需反向遍歷即可等價達到「緩衝空間降序」的效果。

```typescript
// 將每個任務壓縮為一個浮點數：gap * 2^28 + minimum * 2^14 + actual。
// 升序排序後反向遍歷，等價於按緩衝空間降序排列，
// 且無需使用 JS 比較器回呼函數，效能更佳。
const packed = new Float64Array(taskCount);
const SHIFT_MIN = 16384;        // 2^14，足以容納最大值 10^4
const SHIFT_GAP = 268435456;    // 2^28

for (let index = 0; index < taskCount; index++) {
  const currentTask = tasks[index];
  const actual = currentTask[0];
  const minimum = currentTask[1];
  const gap = minimum - actual;
  packed[index] = gap * SHIFT_GAP + minimum * SHIFT_MIN + actual;
}
```

### Step 3：對壓縮陣列進行原生升序排序

對型別陣列直接呼叫排序，速度遠快於帶自訂比較函數的一般陣列排序；排序後最大緩衝空間的任務將位於陣列末尾，反向遍歷即可優先處理。

```typescript
// 原生型別陣列排序（升序）—— 速度遠優於帶比較器的 Array.sort。
packed.sort();
```

### Step 4：反向遍歷並解碼，同步追蹤所需的最少初始能量

從末尾（緩衝空間最大）往前遍歷，每輪先從壓縮值中解碼出門檻與消耗量，接著計算「到目前為止已累積的消耗總量加上當前任務門檻」，若此值超過目前已知的最少初始能量則更新之，最後將實際消耗量累加至前綴總和。

```typescript
// 反向遍歷（從最大緩衝空間開始），累加實際消耗，
// 並追蹤（前綴實際消耗總和 + 門檻）的最大值，即所需的最少初始能量。
let prefixActualSum = 0;
let minimumInitialEnergy = 0;

for (let index = taskCount - 1; index >= 0; index--) {
  const value = packed[index];
  // 解碼低 28 位，其中存有（minimum * SHIFT_MIN + actual）。
  const lower = value % SHIFT_GAP;
  const minimum = (lower / SHIFT_MIN) | 0;
  const actual = lower - minimum * SHIFT_MIN;

  const requiredEnergy = prefixActualSum + minimum;
  if (requiredEnergy > minimumInitialEnergy) {
    minimumInitialEnergy = requiredEnergy;
  }
  prefixActualSum += actual;
}
```

### Step 5：回傳計算出的最少初始能量

遍歷結束後，所追蹤的最大值即為答案，直接回傳。

```typescript
return minimumInitialEnergy;
```

## 時間複雜度

- 編碼階段對所有任務各處理一次，耗時 $O(n)$；
- 排序階段對長度為 $n$ 的型別陣列排序，耗時 $O(n \log n)$；
- 解碼與掃描階段再次線性遍歷，耗時 $O(n)$。
- 總時間複雜度為 $O(n \log n)$。

> $O(n \log n)$

## 空間複雜度

- 使用一個長度為 $n$ 的型別陣列儲存壓縮後的任務資訊；
- 其餘僅為常數個輔助變數。
- 總空間複雜度為 $O(n)$。

> $O(n)$
