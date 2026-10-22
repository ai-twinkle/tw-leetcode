# 3942. Minimum Operations to Sort a Permutation

You are given an integer array `nums` of length `n`, 
where `nums` is a permutation of the integers from `0` to `n - 1`.

You may perform only the following operations:

- Reverse the entire array.
- Rotate Left by One: Move the first element to the end of the array, and rest elements to left by one position.

Return an integer denoting the minimum number of operations required to sort the array in increasing order. 
If it is not possible to sort the array using only the given operations, return -1.

**Constraints:**

- `1 <= n == nums.length <= 10^5`
- `0 <= nums[i] <= n - 1`
- `nums` is a permutation of integers from `0` to `n - 1`.

## 基礎思路

本題給定一個 `0` 到 `n - 1` 的排列，只能使用「整體反轉」與「向左旋轉一格」兩種操作，要求以最少操作次數將陣列排成遞增，若無法達成則回傳 `-1`。

在思考解法時，可掌握以下核心觀察：

- **操作不會改變元素的循環相對順序**：
  向左旋轉只是改變循環序列的起點，反轉只會讓循環方向顛倒。因此可達的排列只有兩類：遞增序列的某個旋轉，以及遞減序列的某個旋轉。

- **以循環下降與循環上升的次數判斷型態**：
  把陣列視為首尾相接的環，遞增序列的旋轉恰好只有一處「下降」，遞減序列的旋轉恰好只有一處「上升」。只要一次掃描統計相鄰的下降次數，再補上首尾交界的情形，就能判斷屬於哪一類。

- **遞增旋轉型態有兩種還原路徑**：
  可以直接向左旋轉到最小值回到開頭；也可以先反轉、往另一個方向旋轉，再反轉回來。後者多出兩次反轉，但旋轉次數可能少很多，取兩者較小值即可。

- **遞減旋轉型態必須且只需一次反轉**：
  旋轉可以安排在反轉之前或之後。兩種順序所需的旋轉次數相加為 `n`（剛好不需旋轉時兩者皆為 0），取較小者再加上一次反轉即可。

依據以上特性，可以採用以下策略：

- **一次線性掃描統計下降次數**，並補上首尾交界，得到循環下降與循環上升的數量。
- **若屬遞增序列的旋轉**，比較「直接旋轉」與「反轉、旋轉、再反轉」兩條路徑的成本，取最小值。
- **若屬遞減序列的旋轉**，比較反轉前旋轉與反轉後旋轉的成本，取較小者再加上一次反轉。
- **若兩者皆非**，則無法透過給定操作排序，回傳 `-1`。

此策略只需一次掃描與常數次計算，即可直接求出最少操作次數。

## 解題步驟

### Step 1：處理長度為 1 的特例

只有一個元素時，陣列本身已經有序，不需任何操作，直接回傳 0。

```typescript
const length = nums.length;

// 單一元素依定義即為已排序。
if (length === 1) {
  return 0;
}
```

### Step 2：一次掃描統計相鄰元素的下降次數

從第二個元素開始，逐一比較目前值與前一個值，遇到下降就累加計數。因為每組相鄰元素不是下降就是上升，這個計數同時也決定了上升次數。掃描結束後，`previous` 會停在最後一個元素，供後續處理首尾交界使用。

```typescript
// 一次掃描統計下降次數；每組相鄰元素不是下降就是上升，
// 因此此單一計數即可同時刻畫兩種候選排列型態。
let descents = 0;
let previous = nums[0];

for (let index = 1; index < length; index++) {
  const current = nums[index];

  if (current < previous) {
    descents++;
  }

  previous = current;
}
```

### Step 3：補上首尾交界，計算循環下降次數

把陣列視為環狀，若首元素小於尾元素，代表首尾交界處也是一次下降，需一併計入。

```typescript
const first = nums[0];

// 排列恰為 0..n-1 的某個旋轉，若且唯若其循環下降次數恰為 1。
const cyclicDescents = descents + (first < previous ? 1 : 0);
```

### Step 4：處理遞增序列旋轉的情況

循環下降次數恰為 1 時，陣列是遞增序列的某個旋轉，此時首元素的值就決定了偏移量：

- 若首元素為 0，代表已經有序，直接回傳 0。
- 直接向左旋轉需要 `length - first` 次。
- 先反轉、旋轉 `first` 次、再反轉回來，共需 `first + 2` 次。

取兩者較小值即為答案。

```typescript
if (cyclicDescents === 1) {
  if (first === 0) {
    return 0;
  }

  // 直接向左旋轉，或是先反轉、以較短方向旋轉、再反轉回來。
  const forward = length - first;
  const backward = first + 2;

  return forward < backward ? forward : backward;
}
```

### Step 5：處理遞減序列旋轉的情況

線性上升次數等於相鄰組數減去下降次數，再補上首尾交界的上升，即得循環上升次數。若恰為 1，陣列是遞減序列的某個旋轉，必須進行一次反轉：

- 在反轉之後旋轉，需要 `length - 1 - first` 次。
- 在反轉之前旋轉，需要其互補次數 `length - rotations`；若前者為 0，後者也為 0。

取較小者再加上一次反轉即為答案。

```typescript
// 循環上升次數恰為 1，代表其為遞減排序序列的某個旋轉。
const cyclicAscents = length - 1 - descents + (first > previous ? 1 : 0);

if (cyclicAscents === 1) {
  // 必須進行一次反轉；在反轉之前或之後擇較短的一側進行旋轉。
  const rotations = length - 1 - first;
  const mirrored = rotations === 0 ? 0 : length - rotations;

  return 1 + (rotations < mirrored ? rotations : mirrored);
}
```

### Step 6：兩種型態皆不符合時回傳 -1

若陣列既不是遞增序列的旋轉，也不是遞減序列的旋轉，給定的操作無法將其排序，回傳 -1。

```typescript
return -1;
```

## 時間複雜度

- 統計下降次數只需一次線性掃描，為 $O(n)$；
- 其餘判斷與計算皆為常數時間。
- 總時間複雜度為 $O(n)$。

> $O(n)$

## 空間複雜度

- 僅使用固定數量的變數；
- 無任何額外陣列或動態空間。
- 總空間複雜度為 $O(1)$。

> $O(1)$
