# 3069. Distribute Elements Into Two Arrays I

You are given a 1-indexed array of distinct integers `nums` of length `n`.

You need to distribute all the elements of `nums` between two arrays `arr1` and `arr2` using `n` operations. 
In the first operation, append `nums[1]` to `arr1`. 
In the second operation, append `nums[2]` to `arr2`. 
Afterwards, in the ith operation:

If the last element of arr1 is greater than the last element of `arr2`, append `nums[i]` to `arr1`. 
Otherwise, append `nums[i]` to `arr2`.
The array result is formed by concatenating the arrays `arr1` and `arr2`. 
For example, if `arr1 == [1,2,3]` and `arr2 == [4,5,6]`, then `result = [1,2,3,4,5,6]`.

Return the array result.

**Constraints:**

- `3 <= n <= 50`
- `1 <= nums[i] <= 100`
- All elements in `nums` are distinct.

## 基礎思路

本題描述一個模擬過程：依序將元素分配到兩個序列中，分配的依據僅取決於兩個序列「目前最後一個元素」的大小關係，最終將兩個序列前後串接作為答案。

在思考解法時，可掌握以下核心觀察：

- **決策只依賴兩個尾端值**：
  每一次分配時，判斷條件只看兩個序列各自的最後一個元素，與序列中其他元素完全無關。因此無須實際維護兩個完整的容器，只要持續追蹤兩個尾端值即可。

- **最終輸出是固定的串接順序**：
  答案為第一個序列全部元素接上第二個序列全部元素。由於兩個序列的長度總和恰為輸入長度，我們可以直接在同一塊輸出空間上作業：一個序列由前往後填寫，另一個序列由後往前填寫，兩者永遠不會互相覆蓋。

- **反向填寫需要一次修正**：
  由後往前填寫的那一段，其元素順序恰好與真實的加入順序相反，因此只需在最後將該區段就地反轉，即可還原正確的串接結果。

- **前兩次操作由題目直接指定**：
  第一個元素必定屬於第一個序列，第二個元素必定屬於第二個序列，可先行固定，之後的迴圈從第三個元素開始即可。

依據以上特性，可以採用以下策略：

- **以兩個純量變數取代兩個實際容器**，僅記錄各自的尾端值以供比較。
- **在單一輸出空間上以雙端寫入的方式模擬分配過程**，一端由前向後、一端由後向前推進。
- **最後就地反轉後半區段**，使其恢復正確順序，直接得到最終答案。

此策略只需一次線性掃描與一次區段反轉，且不需要任何額外的容器來暫存中間結果。

## 解題步驟

### Step 1：初始化輸出空間

先取得輸入長度，並配置一塊與輸入等長的輸出空間，後續所有分配結果都會直接寫入其中。

```typescript
const length = nums.length;
const result: number[] = new Array(length);
```

### Step 2：固定前兩次操作並設定雙端寫入位置

依題目規定，第一個元素屬於第一個序列、第二個元素屬於第二個序列。我們分別記錄兩者作為當前尾端值，並設定前端寫入位置與後端寫入位置，將這兩個元素分別放入輸出空間的最前與最後。

```typescript
// 前兩次操作由題目直接規定。
let lastOfFirst = nums[0];
let lastOfSecond = nums[1];
let firstEnd = 1;
let secondStart = length - 1;
result[0] = lastOfFirst;
result[secondStart] = lastOfSecond;
```

### Step 3：逐一分配剩餘元素至前端或後端

從第三個元素開始，依序取出當前值並比較兩個尾端值：若第一個序列的尾端較大，則寫入前端區域並向後推進；否則先讓後端位置前移一格再寫入，並同步更新對應的尾端值。

```typescript
for (let index = 2; index < length; index++) {
  const value = nums[index];

  // 只有兩個尾端值決定去向，因此不需要讀取任何陣列內容。
  if (lastOfFirst > lastOfSecond) {
    result[firstEnd] = value;
    firstEnd++;
    lastOfFirst = value;
  } else {
    secondStart--;
    result[secondStart] = value;
    lastOfSecond = value;
  }
}
```

### Step 4：就地反轉後端區段以還原正確順序

後端區域是由後往前填寫的，其元素順序與實際加入順序相反。以雙指標從該區段的兩端向中間收斂，逐對交換即可就地反轉。

```typescript
// arr2 區段是由後往前寫入的，因此需要就地反轉該區段。
let left = secondStart;
let right = length - 1;
while (left < right) {
  const temporary = result[left];
  result[left] = result[right];
  result[right] = temporary;
  left++;
  right--;
}
```

### Step 5：回傳最終串接結果

此時輸出空間中已依序存放第一個序列與第二個序列的所有元素，直接回傳即為答案。

```typescript
return result;
```

## 時間複雜度

- 分配階段對每個元素各處理一次，每次僅做常數次比較與寫入，為 $O(n)$；
- 反轉階段最多交換半個區段的長度，同樣為 $O(n)$；
- 總時間複雜度為 $O(n)$。

> $O(n)$

## 空間複雜度

- 除輸出空間外，僅使用固定數量的純量變數；
- 不需要任何額外的容器來暫存兩個序列；
- 總空間複雜度為 $O(1)$。

> $O(1)$
