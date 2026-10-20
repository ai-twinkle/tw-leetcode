# 3886. Sum of Sortable Integers

You are given an integer array nums of length `n`.

An integer `k` is called sortable if `k` divides `n` and 
you can sort `nums` in non-decreasing order by sequentially performing the following operations:

- Partition `nums` into consecutive subarrays of length `k`.
- Cyclically rotate each subarray independently any number of times to the left or to the right.

Return an integer denoting the sum of all possible sortable integers `k`.

**Constraints:**

- `1 <= n == nums.length <= 10^5`
- `1 <= nums[i] <= 10^5`

## 基礎思路

本題要求找出所有能整除陣列長度 `n` 的區塊長度 `k`。陣列被切成若干長度為 `k` 的連續區塊後，各區塊獨立循環旋轉，必須能使整體變為非遞減。
最後回傳所有合法 `k` 的總和。

在思考解法時，可掌握以下核心觀察：

- **旋轉不會讓元素跨越區塊**：
  每個區塊在旋轉前後所持有的元素集合不變。因此排序後，每個區塊的元素必須恰好落在該區塊最終應有的位置範圍內。這等價於在每個區塊邊界處，左側所有元素的最大值不得超過右側所有元素的最小值。

- **邊界合法性可一次預先計算**：
  對每個可能的切點，比較「前綴最大值」與「後綴最小值」，即可預先標記出無法作為區塊邊界的位置。之後檢查任一 `k` 時只需查表。

- **單一區塊能否旋轉成有序，取決於循環下降次數**：
  將區塊視為首尾相接的環，若環上的嚴格下降處不超過一處，便存在某個旋轉使其成為非遞減序列；超過一處則無論如何旋轉都無法排序。

- **區間內的下降次數可用前綴和快速取得**：
  預先累計相鄰元素的下降次數，就能以常數時間求出任一區塊內部的下降數，再補上首尾相接處的判斷即可。

- **合法的 `k` 只能是 `n` 的因數**：
  因數可成對枚舉至平方根，數量很少；若整個陣列原本就已排序，則所有因數皆合法。

依據以上特性，可以採用以下策略：

- **以一次反向掃描建立後綴最小值，一次正向掃描建立下降次數前綴和與邊界阻擋標記**。
- **成對枚舉 `n` 的所有因數**，對每個候選長度檢查所有邊界是否可切分、所有區塊是否最多只有一處循環下降。
- **將通過檢查的候選長度累加為答案**。

此策略將每次檢查的成本降至與區塊數量成正比，能在大規模輸入下高效完成。

## 解題步驟

### Step 1：輔助函數——檢查所有區塊邊界是否可切分

輔助函數負責判斷給定區塊長度是否可行。首先逐一檢視每個區塊邊界，若某邊界已被標記為「前綴最大值大於後綴最小值」，代表元素必須跨越該邊界才能就位，此長度不可行。

```typescript
/**
 * 檢查以指定長度切分區塊時，是否能藉由各區塊獨立的循環旋轉完成排序。
 * @param values 輸入陣列的型別化視圖。
 * @param descentPrefix 相鄰元素間嚴格下降次數的前綴計數。
 * @param cutBlocked 標記「前綴最大值超過後續後綴最小值」之邊界的旗標。
 * @param blockLength 陣列長度的候選因數。
 * @returns 若每個區塊皆能旋轉至最終排序位置則回傳 true。
 */
function canSortWithBlockLength(
  values: Int32Array,
  descentPrefix: Int32Array,
  cutBlocked: Uint8Array,
  blockLength: number,
): boolean {
  const length = values.length;

  // 每個區塊邊界都必須將陣列切成「前綴最大值不超過後綴最小值」的兩部分。
  for (let boundary = blockLength; boundary < length; boundary += blockLength) {
    if (cutBlocked[boundary] === 1) {
      return false;
    }
  }

  // ...
}
```

### Step 2：輔助函數——檢查每個區塊的循環下降次數

對每個區塊，先以前綴和求出區塊內部相鄰元素的下降次數。再將首尾相接處視為環的一部分，若尾元素大於首元素則額外計為一次下降。只要任一區塊的循環下降超過一處，便無法旋轉成有序；全部通過則此長度可行。

```typescript
/**
 * 檢查以指定長度切分區塊時，是否能藉由各區塊獨立的循環旋轉完成排序。
 * @param values 輸入陣列的型別化視圖。
 * @param descentPrefix 相鄰元素間嚴格下降次數的前綴計數。
 * @param cutBlocked 標記「前綴最大值超過後續後綴最小值」之邊界的旗標。
 * @param blockLength 陣列長度的候選因數。
 * @returns 若每個區塊皆能旋轉至最終排序位置則回傳 true。
 */
function canSortWithBlockLength(
  values: Int32Array,
  descentPrefix: Int32Array,
  cutBlocked: Uint8Array,
  blockLength: number,
): boolean {
  // Step 1：檢查所有區塊邊界是否可切分

  // 一個區塊能被旋轉成有序，若且唯若其最多只有一處循環下降。
  for (let start = 0; start < length; start += blockLength) {
    const end = start + blockLength - 1;
    let cyclicDescents = descentPrefix[end] - descentPrefix[start];

    // 首尾相接的配對補上環的最後一段，對應將被選用的旋轉方式。
    if (values[end] > values[start]) {
      cyclicDescents++;
    }

    if (cyclicDescents > 1) {
      return false;
    }
  }

  return true;
}
```

### Step 3：初始化主函數所需的基本資料結構

在主函數中，取得陣列長度，並配置型別化的數值副本與後綴最小值陣列，供後續掃描使用。

```typescript
const length = nums.length;
const values = new Int32Array(length);
const suffixMinimum = new Int32Array(length);
```

### Step 4：反向掃描建立數值副本與後綴最小值

由尾端往前掃描，將輸入值寫入型別化陣列，並同步維護目前看過的最小值，記錄為每個位置的後綴最小值。

```typescript
// 反向掃描同時建立輸入的型別化副本，以及每個後綴的最小值。
let runningMinimum = 2147483647;
for (let index = length - 1; index >= 0; index--) {
  const value = nums[index];
  values[index] = value;

  if (value < runningMinimum) {
    runningMinimum = value;
  }

  suffixMinimum[index] = runningMinimum;
}
```

### Step 5：配置下降次數前綴和與邊界阻擋標記

準備兩個陣列：一個記錄到每個位置為止的累計下降次數，另一個標記哪些位置無法作為區塊邊界。

```typescript
const descentPrefix = new Int32Array(length);
const cutBlocked = new Uint8Array(length);
```

### Step 6：正向掃描累計相鄰下降次數

由前往後掃描，以前綴最大值與下降計數作為狀態。每一輪比較前一個元素與目前元素，若出現嚴格下降便累加次數，並寫入該位置的前綴和。

```typescript
// 正向掃描累計下降次數，並標記永遠無法分隔已排序部分的邊界。
let runningMaximum = values[0];
let descentCount = 0;
for (let index = 1; index < length; index++) {
  const previous = values[index - 1];
  const current = values[index];

  if (previous > current) {
    descentCount++;
  }

  descentPrefix[index] = descentCount;

  // ...
}
```

### Step 7：標記不可切分的邊界並更新前綴最大值

在同一輪中，若目前位置之前的前綴最大值大於從此位置開始的後綴最小值，代表此處無法作為區塊邊界，予以標記。之後再將目前元素納入前綴最大值。

```typescript
for (let index = 1; index < length; index++) {
  // Step 6：累計相鄰下降次數並寫入前綴和

  if (runningMaximum > suffixMinimum[index]) {
    cutBlocked[index] = 1;
  }

  if (current > runningMaximum) {
    runningMaximum = current;
  }
}
```

### Step 8：判斷原陣列是否已排序並初始化總和

若整個陣列沒有任何下降，代表原本就已排序，任意因數皆合法，後續可跳過檢查。同時初始化答案累加器。

```typescript
// 若完全沒有下降，陣列已經有序，因此長度的每個因數皆可行。
const alreadySorted = descentCount === 0;
let total = 0;
```

### Step 9：成對枚舉因數並檢查較小的因數

從 1 枚舉到平方根，跳過不能整除長度的候選值。對於較小的因數，若陣列已排序或通過輔助函數檢查，便將其加入總和。

```typescript
// 成對枚舉因數，只需到長度的平方根為止。
for (let candidate = 1; candidate * candidate <= length; candidate++) {
  if (length % candidate !== 0) {
    continue;
  }

  if (alreadySorted || canSortWithBlockLength(values, descentPrefix, cutBlocked, candidate)) {
    total += candidate;
  }

  // ...
}
```

### Step 10：檢查配對的較大因數

計算與目前因數配對的另一個因數。若兩者相同（完全平方數的情況）則略過以避免重複計算；否則同樣檢查是否可行，可行則累加。

```typescript
for (let candidate = 1; candidate * candidate <= length; candidate++) {
  // Step 9：檢查是否為因數並驗證較小的因數

  const paired = length / candidate;
  if (paired === candidate) {
    continue;
  }

  if (alreadySorted || canSortWithBlockLength(values, descentPrefix, cutBlocked, paired)) {
    total += paired;
  }
}
```

### Step 11：回傳所有可排序整數的總和

所有因數檢查完畢後，`total` 即為所有合法區塊長度的總和，直接回傳。

```typescript
return total;
```

## 時間複雜度

- 反向掃描與正向掃描各為一次線性走訪，共 $O(n)$；
- 枚舉因數至平方根需 $O(\sqrt{n})$；
- 對區塊長度 $k$ 的檢查需走訪 $n / k$ 個邊界與區塊，為 $O(n / k)$；
- 對所有因數的檢查成本總和為 $\sum_{k \mid n} n / k = \sigma(n) = O(n \log \log n)$；
- 總時間複雜度為 $O(n \log \log n)$。

> $O(n \log \log n)$

## 空間複雜度

- 需要型別化數值副本、後綴最小值、下降次數前綴和與邊界標記四個長度為 $n$ 的陣列；
- 其餘僅使用固定數量的變數；
- 總空間複雜度為 $O(n)$。

> $O(n)$
