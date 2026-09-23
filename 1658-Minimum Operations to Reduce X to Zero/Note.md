# 1658. Minimum Operations to Reduce X to Zero

You are given an integer array `nums` and an integer `x`. 
In one operation, you can either remove the leftmost or the rightmost element from the array `nums` and subtract its value from `x`. 
Note that this modifies the array for future operations.

Return the minimum number of operations to reduce `x` to exactly `0` if it is possible, otherwise, return `-1`.

**Constraints:**

- `1 <= nums.length <= 10^5`
- `1 <= nums[i] <= 10^4`
- `1 <= x <= 10^9`

## 基礎思路

本題允許每次從陣列的最左端或最右端移除一個元素，並將其值從目標數扣除，要求以最少的操作次數讓目標數恰好歸零。
若直接模擬每一步的兩種選擇，將形成指數級的搜尋空間，因此必須轉換問題的視角。

在思考解法時，可掌握以下核心觀察：

- **被移除的元素必定是「前綴加後綴」**：
  由於每次只能從兩端取走，最終被移除的集合一定是一段前綴與一段後綴的組合，而未被移除的部分則必然是中間一段**連續的區間**。

- **問題可反轉為求最長中間區間**：
  既然移除的總和固定等於目標數，則保留下來的中間區間總和必為「全體總和減去目標數」。操作次數等於總長度減去保留區間的長度，因此**最小化操作次數等價於最大化保留區間的長度**。

- **元素皆為正值帶來單調性**：
  所有數值皆為正，代表區間和隨著右端擴張而嚴格遞增、隨著左端收縮而嚴格遞減，這正是滑動視窗可以成立的前提，使左界永遠不需回頭。

- **邊界情況需獨立判斷**：
  若全體總和小於目標數，則無論如何都無法湊足；若全體總和恰等於目標數，則保留區間為空，代表必須移除所有元素。

依據以上特性，可以採用以下策略：

- **先求出全體總和，並換算出保留區間所應具備的目標和**。
- **以滑動視窗掃描一次陣列**，右端不斷擴張，當區間和超過目標時即從左端收縮，並在區間和恰好命中目標時記錄最長長度。
- **最終以總長度減去最長保留長度作為答案**，若始終未命中目標則代表無解。

此策略只需線性時間即可完成，且不需要任何額外的輔助結構。

## 解題步驟

### Step 1：取得陣列長度

先記錄輸入陣列的長度，作為後續掃描與換算操作次數的依據。

```typescript
const length = nums.length;
```

### Step 2：累加全體總和

以單趟掃描求出所有元素的總和，此總和決定了保留區間所應具備的目標和。

```typescript
// 以單趟掃描累加總和；它決定了目標視窗和。
let totalSum = 0;
for (let index = 0; index < length; index++) {
  totalSum += nums[index];
}
```

### Step 3：換算目標和並排除不可能的情況

保留區間的目標和等於全體總和減去欲扣除的數值。由於所有元素皆為正，區間和不可能為負，因此若目標和小於零則直接判定無解。

```typescript
// 所有元素皆為正，因此小於零的目標永遠無法達成。
const targetSum = totalSum - x;
if (targetSum < 0) {
  return -1;
}
```

### Step 4：處理必須全部移除的特例

若目標和恰為零，代表保留區間為空，亦即整個陣列的總和正好等於欲扣除的數值，此時所有元素都必須被移除。

```typescript
// 整個陣列的總和恰好等於 x，因此所有元素都必須被移除。
if (targetSum === 0) {
  return length;
}
```

### Step 5：初始化滑動視窗狀態

準備記錄最長命中視窗的長度、目前視窗的累積和，以及視窗的左界。其中最長長度初始化為 `-1`，用以區分「尚未找到任何合法視窗」的狀態。

```typescript
// 和為零只可能來自空視窗，故以 -1 編碼為尚未找到。
let maxWindowLength = -1;
let windowSum = 0;
let left = 0;
```

### Step 6：向右擴張視窗並累加元素

以右端索引逐一向右推進，每前進一格即把新元素納入目前的視窗和中。

```typescript
for (let right = 0; right < length; right++) {
  windowSum += nums[right];

  // ...
}
```

### Step 7：當視窗和超標時從左端收縮

由於所有數值皆為正，視窗和隨左界右移而嚴格遞減，因此只要目前的和超過目標，就持續從左端移除元素直到不再超標，且左界永遠不需回頭。

```typescript
for (let right = 0; right < length; right++) {
  // Step 6：向右擴張視窗並累加元素

  // 所有值皆為正，因此從左端收縮具備單調性且安全。
  while (windowSum > targetSum) {
    windowSum -= nums[left];
    left++;
  }

  // ...
}
```

### Step 8：記錄恰好命中目標的最長視窗

收縮完畢後，若目前視窗和恰等於目標，便計算其長度並與既有紀錄比較，保留較長者。

```typescript
for (let right = 0; right < length; right++) {
  // Step 6：向右擴張視窗並累加元素

  // Step 7：當視窗和超標時從左端收縮

  // 記錄恰好命中目標的最寬視窗。
  if (windowSum === targetSum) {
    const currentLength = right - left + 1;
    if (currentLength > maxWindowLength) {
      maxWindowLength = currentLength;
    }
  }
}
```

### Step 9：判斷是否完全找不到合法視窗

掃描結束後，若最長長度仍維持初始值，代表不存在任何總和符合目標的區間，此時無解。

```typescript
if (maxWindowLength < 0) {
  return -1;
}
```

### Step 10：換算並回傳最少操作次數

保留區間以外的元素都必須被移除，每個元素對應一次操作，因此答案為總長度減去最長保留長度。

```typescript
// 保留視窗以外的元素全數移除，每個元素對應一次操作。
return length - maxWindowLength;
```

## 時間複雜度

- 累加全體總和需一趟線性掃描，為 $O(n)$；
- 滑動視窗中右界共前進 $n$ 次，左界至多前進 $n$ 次，整體攤還後仍為 $O(n)$；
- 其餘皆為常數時間的判斷與換算。
- 總時間複雜度為 $O(n)$。

> $O(n)$

## 空間複雜度

- 僅使用固定數量的純量變數記錄總和、視窗和與索引；
- 未配置任何額外陣列或動態結構。
- 總空間複雜度為 $O(1)$。

> $O(1)$
