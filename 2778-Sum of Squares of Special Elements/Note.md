# 2778. Sum of Squares of Special Elements

You are given a 1-indexed integer array `nums` of length `n`.

An element `nums[i]` of nums is called special if `i` divides `n`, i.e. `n % i == 0`.

Return the sum of the squares of all special elements of `nums`.

**Constraints:**

- `1 <= nums.length == n <= 50`
- `1 <= nums[i] <= 50`

## 基礎思路

本題要求將所有「索引能整除陣列長度」的元素平方後加總。陣列為 1-indexed，因此特殊元素的位置正是陣列長度的所有因數。

在思考解法時，可掌握以下核心觀察：

- **特殊位置只由陣列長度決定**：
  哪些位置是特殊元素，與陣列內容完全無關，只取決於長度。因此可將「找出特殊位置」與「讀取數值並累加」兩件事分開處理。

- **長度範圍極小且固定**：
  約束保證長度不超過 50，所有可能長度的因數集合都能事先算好。查詢時直接取用即可，不必重複做取餘數判斷。

- **因數數量遠小於長度**：
  在 1 到 50 之間，因數最多的數只有 10 個因數。若只造訪因數位置，每次查詢最多讀取約 10 個元素，比逐一檢查所有索引更省。

- **因數成對出現**：
  若超出預先計算的範圍，可利用因數兩兩對稱於平方根的性質，只列舉到平方根即可找出全部因數。

依據以上特性，可以採用以下策略：

- **在模組載入時預先建立每種長度的特殊位置表**，並以扁平陣列搭配起始偏移量儲存，查詢時能直接定位對應區塊。
- **查詢時只走訪該長度對應的特殊位置**，平方後累加。
- **對超出約束的長度保留防禦性路徑**，以平方根列舉成對因數完成計算。

此策略把重複的判斷工作移到一次性的預處理中，每次查詢只做必要的讀取與累加。

## 解題步驟

### Step 1：定義最大支援長度與各長度區塊的起始偏移表

先定義約束允許的最大陣列長度，並配置一個偏移表，記錄每種長度的因數位置在扁平表中的起始處。下一個長度的起始處即為本區塊的結束處，因此表長需多留一格作為結尾哨兵。

```typescript
const MAXIMUM_SUPPORTED_LENGTH = 50;

// 每個長度的因數區塊在 DIVISOR_INDICES 中的起始偏移量（結束位置 = 長度 + 1 的偏移量）
const DIVISOR_START_OFFSETS = new Int32Array(MAXIMUM_SUPPORTED_LENGTH + 2);
```

### Step 2：配置因數位置表，並逐一記錄各長度區塊的起始位置

建表函數先配置足夠容納所有因數位置的扁平陣列。由於範圍內因數最多為 10 個，每個長度預留 10 格即可。接著從長度 1 列舉到上限，並在處理每個長度之前，記下其區塊在扁平表中的起始位置。

```typescript
/**
 * 為每一種可能的陣列長度，預先計算所有特殊元素的 0-based 位置。
 * 只在模組載入時執行一次，因此每次查詢只需存取實際需要的索引。
 *
 * @returns 長度 1..50 的特殊元素 0-based 位置所組成的扁平表
 */
function buildDivisorIndexTable(): Int8Array {
  // 48 是範圍內因數最多的數（10 個），因此每個長度預留 10 格是安全的上界
  const indices = new Int8Array(MAXIMUM_SUPPORTED_LENGTH * 10);
  let writeCursor = 0;

  for (let length = 1; length <= MAXIMUM_SUPPORTED_LENGTH; length++) {
    DIVISOR_START_OFFSETS[length] = writeCursor;

    // ...
  }

  // ...
}
```

### Step 3：列舉當前長度的所有因數並寫入 0-based 位置

對當前長度，逐一檢查 1 到長度本身的每個候選值，不能整除者直接略過。能整除者即為特殊位置，將其轉為 0-based 後寫入表中並推進寫入游標。這樣查詢時就不必再處理 1-indexed 的位移。

```typescript
/**
 * 為每一種可能的陣列長度，預先計算所有特殊元素的 0-based 位置。
 * 只在模組載入時執行一次，因此每次查詢只需存取實際需要的索引。
 *
 * @returns 長度 1..50 的特殊元素 0-based 位置所組成的扁平表
 */
function buildDivisorIndexTable(): Int8Array {
  // Step 2：配置因數位置表並初始化寫入游標

  for (let length = 1; length <= MAXIMUM_SUPPORTED_LENGTH; length++) {
    // Step 2：記錄此長度區塊的起始位置

    for (let divisor = 1; divisor <= length; divisor++) {
      if (length % divisor !== 0) {
        continue;
      }

      // 儲存 0-based 位置，將 1-indexed 的調整從熱路徑中移除
      indices[writeCursor] = divisor - 1;
      writeCursor++;
    }
  }

  // ...
}
```

### Step 4：寫入結尾哨兵並回傳實際使用的區段

所有長度處理完後，在偏移表的最後一格寫入目前游標位置，作為最後一個長度區塊的結束點。接著僅回傳實際寫入的部分作為最終的因數位置表。

```typescript
/**
 * 為每一種可能的陣列長度，預先計算所有特殊元素的 0-based 位置。
 * 只在模組載入時執行一次，因此每次查詢只需存取實際需要的索引。
 *
 * @returns 長度 1..50 的特殊元素 0-based 位置所組成的扁平表
 */
function buildDivisorIndexTable(): Int8Array {
  // Step 2：配置因數位置表並初始化寫入游標

  for (let length = 1; length <= MAXIMUM_SUPPORTED_LENGTH; length++) {
    // Step 2：記錄此長度區塊的起始位置

    // Step 3：列舉因數並寫入 0-based 位置
  }

  DIVISOR_START_OFFSETS[MAXIMUM_SUPPORTED_LENGTH + 1] = writeCursor;

  return indices.subarray(0, writeCursor);
}
```

### Step 5：於模組載入時建立因數位置表

呼叫建表函數一次並保存結果，之後的每次查詢都直接共用這份預先計算好的資料。

```typescript
const DIVISOR_INDICES = buildDivisorIndexTable();
```

### Step 6：初始化主函數所需的長度與累加結果

在主函數中，先取得陣列長度，並初始化平方和的累加變數。

```typescript
const length = nums.length;
let result = 0;
```

### Step 7：長度在支援範圍內時，直接查表累加特殊元素的平方

若長度在預先計算的範圍內，先由偏移表取得此長度區塊的起訖位置。接著只走訪該區塊中的特殊位置，讀取對應元素並將其平方累加，完成後直接回傳。

```typescript
if (length <= MAXIMUM_SUPPORTED_LENGTH) {
  const blockEnd = DIVISOR_START_OFFSETS[length + 1];

  // 只造訪因數位置：最多 10 次讀取，而非 n 次取餘數運算
  for (let cursor = DIVISOR_START_OFFSETS[length]; cursor < blockEnd; cursor++) {
    const value = nums[DIVISOR_INDICES[cursor]];
    result += value * value;
  }

  return result;
}
```

### Step 8：防禦性路徑——列舉到平方根並累加較小的因數

若長度超出約束範圍，改以平方根為界列舉候選因數。不能整除者略過；能整除者即為較小的那個因數，將其對應元素的平方加入結果。

```typescript
// 超出約束長度時的防禦性路徑：以平方根為中心成對找出因數
for (let divisor = 1; divisor * divisor <= length; divisor++) {
  if (length % divisor !== 0) {
    continue;
  }

  const lowValue = nums[divisor - 1];
  result += lowValue * lowValue;

  // ...
}
```

### Step 9：累加成對的較大因數，並避免平方根重複計算

每個較小因數都對應一個較大的配對因數，也就是長度除以該因數。若兩者不同，再將配對因數對應元素的平方加入結果。若兩者相同（即長度為完全平方數時的平方根），則不重複累加。

```typescript
for (let divisor = 1; divisor * divisor <= length; divisor++) {
  // Step 8：檢查整除並累加較小因數對應的平方

  const pairedDivisor = length / divisor;

  if (pairedDivisor !== divisor) {
    const highValue = nums[pairedDivisor - 1];
    result += highValue * highValue;
  }
}
```

### Step 10：回傳防禦性路徑的計算結果

成對因數全部處理完畢後，`result` 即為所有特殊元素的平方和，直接回傳。

```typescript
return result;
```

## 時間複雜度

- 預處理只在模組載入時執行一次，列舉長度 1 到 50 的所有候選因數，運算量固定，不隨單次輸入變化；
- 支援範圍內的查詢只走訪該長度的因數位置，次數為因數個數 $d(n)$，且 $d(n) \le 2\sqrt{n}$；
- 防禦性路徑列舉到平方根，為 $O(\sqrt{n})$；
- 總時間複雜度為 $O(\sqrt{n})$。

> $O(\sqrt{n})$

## 空間複雜度

- 偏移表與因數位置表的大小由固定上限 50 決定，為常數空間；
- 每次查詢僅使用固定數量的變數；
- 總空間複雜度為 $O(1)$。

> $O(1)$
