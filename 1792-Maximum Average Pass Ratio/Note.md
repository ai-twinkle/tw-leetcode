# 1792. Maximum Average Pass Ratio

There is a school that has classes of students and each class will be having a final exam.
You are given a 2D integer array `classes`, where `classes[i] = [pass_i, total_i]`.
You know beforehand that in the $i^{th}$ class, there are `total_i` total students,
but only `pass_i` number of students will pass the exam.

You are also given an integer `extraStudents`.
There are another `extraStudents` brilliant students that are guaranteed to pass the exam of any class they are assigned to.
You want to assign each of the `extraStudents` students to a class in a way that maximizes the average pass ratio across all the classes.

The pass ratio of a class is equal to the number of students of the class that will pass the exam divided by the total number of students of the class.
The average pass ratio is the sum of pass ratios of all the classes divided by the number of the classes.

Return the maximum possible average pass ratio after assigning the `extraStudents` students.
Answers within `10^-5` of the actual answer will be accepted.

**Constraints:**

- `1 <= classes.length <= 10^5`
- `classes[i].length == 2`
- `1 <= pass_i <= total_i <= 10^5`
- `1 <= extraStudents <= 10^5`

## 基礎思路

本題的目標是最大化所有班級的**平均通過率**。由於我們可以將額外的學生分配給任意班級，且這些學生保證通過，因此每一次的分配都會提升某個班級的通過率。

關鍵觀察在於：
對於每個班級，其通過率提升的幅度（也就是「**增益**」）可以透過公式：

$$
\Delta(p, t) = \frac{p + 1}{t + 1} - \frac{p}{t} = \frac{t - p}{t(t + 1)}
$$

這是一個 **邊際遞減** 的函數，表示班級越接近滿分，分配額外學生的效益越低。因此，我們需要採取 **貪婪策略**，每次都把學生分配給「目前增益最大」的班級。

為了高效實現這樣的策略，我們使用 **最大堆（Max-Heap）** 維護所有班級的當前增益，每次從堆頂取出增益最大的班級進行分配，並更新該班級的狀態與其增益，重建堆。

## 解題步驟

### Step 1：初始化所有班級資訊與初始平均通過率

首先建立各個班級的 `通過人數` 與 `總人數` 陣列，並使用公式計算每班加入一名學生後的「單次增益」，同時計算整體初始平均通過率。

```typescript
const numberOfClasses = classes.length;

const passedCount = new Int32Array(numberOfClasses);
const totalCount = new Int32Array(numberOfClasses);
const gainArray = new Float64Array(numberOfClasses); // 對某班級再加入 1 名學生時的增益
const heapIndices = new Int32Array(numberOfClasses); // 最大堆，儲存班級索引

// 初始化各班級資料與平均通過率總和
let sumOfRatios = 0.0;
for (let i = 0; i < numberOfClasses; i++) {
  const classRow = classes[i];
  const passed = classRow[0];
  const total = classRow[1];

  passedCount[i] = passed;
  totalCount[i] = total;
  sumOfRatios += passed / total;

  gainArray[i] = (total - passed) / (total * (total + 1));
  heapIndices[i] = i;
}
```

### Step 2：建構最大堆，以增益值為鍵

使用 `siftDown` 將 `heapIndices` 轉換為以 `gainArray` 為鍵的最大堆，確保堆頂永遠是增益最大的班級。

```typescript
// O(n) 建堆過程
for (let i = (numberOfClasses >> 1) - 1; i >= 0; i--) {
  siftDown(heapIndices, i, numberOfClasses, gainArray);
}
```

### Step 3：逐一分配額外學生給增益最大的班級

依序將每位額外學生分配給目前增益最大的班級，並更新該班級的資料與堆結構。

```typescript
let remaining = extraStudents;
while (remaining > 0) {
  const topIndex = heapIndices[0];
  const bestGain = gainArray[topIndex];

  // 若沒有正增益可分配則提早終止
  if (bestGain <= 0) {
    break;
  }

  // 加入本次增益
  sumOfRatios += bestGain;

  // 更新班級通過與總人數
  const newPassed = passedCount[topIndex] + 1;
  const newTotal = totalCount[topIndex] + 1;
  passedCount[topIndex] = newPassed;
  totalCount[topIndex] = newTotal;

  // 計算新的增益
  gainArray[topIndex] = (newTotal - newPassed) / (newTotal * (newTotal + 1));

  // 恢復堆的最大性質
  siftDown(heapIndices, 0, numberOfClasses, gainArray);

  remaining--;
}
```

### Step 4：回傳最終的平均通過率

最後回傳通過率總和除以班級數，即為最終最大平均通過率。

```typescript
return sumOfRatios / numberOfClasses;
```

### Step 5：最大堆的 siftDown 函式

此輔助函式用於從某個索引開始調整堆結構，使其滿足最大堆條件。

```typescript
/**
 * 自指定位置開始恢復最大堆性質。
 * 此函式會使得位置 positionIndex 的元素往下沉，
 * 直到滿足最大堆條件：每個父節點的增益不小於其子節點。
 */
function siftDown(
  heap: Int32Array,
  positionIndex: number,
  heapSize: number,
  keyArray: Float64Array
): void {
  let current = positionIndex;

  while (true) {
    const leftChild = (current << 1) + 1;
    const rightChild = leftChild + 1;
    let largest = current;

    if (leftChild < heapSize) {
      if (keyArray[heap[leftChild]] > keyArray[heap[largest]]) {
        largest = leftChild;
      }
    }

    if (rightChild < heapSize) {
      if (keyArray[heap[rightChild]] > keyArray[heap[largest]]) {
        largest = rightChild;
      }
    }

    if (largest === current) {
      break;
    }

    const swapTemp = heap[current];
    heap[current] = heap[largest];
    heap[largest] = swapTemp;

    current = largest;
  }
}
```

## 時間複雜度

- 建堆需要 $O(n)$。
- 每次額外學生的分配都要進行一次 `siftDown`，為 $O(\log n)$，共分配 `extraStudents = m` 位。
- 總時間複雜度為 $O(n + m \log n)$。

> $O(n + m \log n)$

## 空間複雜度

- 使用四個長度為 `n` 的輔助陣列（皆為 TypedArray）：`passedCount`, `totalCount`, `gainArray`, `heapIndices`
- 總空間複雜度為 $O(n)$。

> $O(n)$
