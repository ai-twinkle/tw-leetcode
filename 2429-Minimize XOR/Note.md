# 2429. Minimize XOR

Given two positive integers `num1` and `num2`, find the positive integer `x` such that:

- `x` has the same number of set bits as `num2`, and
- The value `x XOR num1` is minimal.

Note that `XOR` is the bitwise XOR operation.

Return the integer `x`. 
The test cases are generated such that `x` is uniquely determined.

The number of set bits of an integer is the number of `1`'s in its binary representation.

**Constraints:**

- `1 <= num1, num2 <= 10^9`

## 基礎思路

可以將 `num2` 的位元中 `1` 的數量視為「需要分配的 `1` 數量」。
任務目標是找到一個數字，使用這些 `1` 建構出一個數字，並使該數字與 `num1` 進行 XOR 後的值最小化。

可以根據三種情況進行處理：

1. `num1` 的位元中 `1` 的數量 ===「需要分配的 `1` 數量」 
   - 在這種情況下，直接返回 `num1` 即可，因為與 `num1` 自己進行 XOR 的最小值是 `0`。由於此時 `1` 的數量完全一致，因此可以構建出與 `num1` 位元相同的數字。

2. `num1` 的位元中 `1` 的數量 <「需要分配的 `1` 數量」
   此情況下，`num1` 的所有 `1` 都能被保留，但仍有剩餘的 `1` 需要分配。
   - 首先複製 `num1` 的位元值，保留與 `num1` 相同的 `1`。
   - 接下來，將剩餘的 `1` 從低位到高位依序填入空位（`0` 的位置），直到分配完畢。
   - 如果仍有剩餘的 `1` 未分配，則將這些 `1` 插入到結果的最高位，以保證構建的數字最小化。

3. `num1` 的位元中 `1` 的數量 >「需要分配的 `1` 數量」
   在此情況下，所有「需要分配的 `1`」都可以從 `num1` 中挑選出來，但 `num1` 中的部分 `1` 需要移除。
   - 首先複製 `num1` 的位元值。
   - 接著計算需要移除的 `1` 的數量，並從低位到高位依次將多餘的 `1` 變為 `0` (以滿足 XOR 最小值)，直到達到需求為止。

## 解題步驟

### Step 1: 計算 `num1` 和 `num2` 的 `1` 的數量

```typescript
const countOnes = (num: number): number =>
  num.toString(2).split('').filter((bit) => bit === '1').length;
const countOfOneInNum1 = countOnes(num1);
const countOfOneInNum2 = countOnes(num2);
```

### Step 2: 處理情境 1

```typescript
// 若 num1 的 1 的數量與 num2 的 1 的數量相同，則直接返回 num1
if (countOfOneInNum1 === countOfOneInNum2) {
  return num1;
}
```

### Step 3: 處理情境 2 與情境 3

#### Step 3.1: 處理情境 2 `num1` 的位元中 `1` 的數量 <「需要分配的 `1` 數量」

```typescript
// 若 num1 的 1 的數量小於 num2 的 1 的數量
let resultBits = num1.toString(2).split(''); // 複製 num1 的位元值
let remainingOne: number;                    // 紀錄剩餘的 1 的數量

if (countOfOneInNum1 < countOfOneInNum2) {
  // 計算剩餘的 1 的數量
  remainingOne = countOfOneInNum2 - countOfOneInNum1;
  
  // 將剩餘的 1 依序填入空位，由於 Bit Array 是從先寫入高位，因此從後往前填入
  // 12 -> 1100 -> ['1', '1', '0', '0']
  for (let i = resultBits.length - 1; i >= 0; i--) {
    // 若剩餘的 1 已經分配完畢，則跳出迴圈
    if (remainingOne === 0) {
      break;
    }

    // 僅在還沒填入 1 的位置時，才填入 1 (因為我們視同已經先把 num1 的 1 的地方先填了)
    if (resultBits[i] === '0') {
      resultBits[i] = '1';
      remainingOne--;
    }
  }

  // 若仍有剩餘的 1 未分配，則將這些 1 插入到結果的最高位 (也就是最前面)
  if (remainingOne > 0) {
    resultBits = Array(remainingOne).fill('1').concat(resultBits);
  }
} else {
  // ...
}
```

#### Step 3.2: 處理情境 3 `num1` 的位元中 `1` 的數量 >「需要分配的 `1` 數量」

```typescript
let resultBits = num1.toString(2).split(''); // 複製 num1 的位元值
let remainingOne: number;                    // 紀錄多分配的 1 的數量 <- 在這個 Case 時這個變數的代表的意義是不同的

if (countOfOneInNum1 < countOfOneInNum2) {
  // Step 3.1: 處理情境 2
} else {
  // 計算多分配的 1 的數量
  remainingOne = countOfOneInNum1 - countOfOneInNum2;
  
  // 將多分配的 1 依序移除，由於我們需要讓 XOR 的值最小，因此一樣從低位開始移除 1
  for (let i = resultBits.length - 1; i >= 0; i--) {
    // 已經移除完畢，則跳出迴圈
    if (remainingOne === 0) {
      break;
    }
    
    // 若該位置是 1，我們取消該位置分配的 1 (因為預設我們分配 "過多" 的 1)
    if (resultBits[i] === '1') {
      resultBits[i] = '0';
      remainingOne--;
    }
  }
}
```

### Step 4: 反轉結果

```typescript
// 把 Bit Array 轉換回數字
return parseInt(resultBits.join(''), 2);
```

## 時間複雜度

- 在計算數字1的數量時，需要將數字轉換為二進制字串，分別是 Num1 和 Num2，時間複雜度為 $O(logNum1 + logNum2)$。
- 初始化 ResultBits 時，需要將 Num1 轉換為二進制字串，時間複雜度為 $O(logNum1)$。
- 在處理情境 2 和情境 3 時，需要遍歷 ResultBits，時間複雜度為 $O(max(logNum1, logNum2))$。
- 總時間複雜度為 $O(logNum1 + logNum2)$。

> $O(logNum1 + logNum2)$

## 空間複雜度

- 需要存儲 Num1 和 Num2 的二進制字串，空間複雜度為 $O(logNum1 + logNum2)$。
- 保存 ResultBits 的空間複雜度為 $O(max(logNum1, logNum2))$。
- 總空間複雜度為 $O(logNum1 + logNum2)$。

> $O(logNum1 + logNum2)$
