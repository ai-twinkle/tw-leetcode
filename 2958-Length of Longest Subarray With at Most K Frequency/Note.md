# 2958. Length of Longest Subarray With at Most K Frequency

You are given an integer array `nums` and an integer `k`.

The frequency of an element `x` is the number of times it occurs in an array.

An array is called good if the frequency of each element in this array is less than or equal to `k`.

Return the length of the longest good subarray of `nums`.

A subarray is a contiguous non-empty sequence of elements within an array.

**Constraints:**

- `1 <= nums.length <= 10^5`
- `1 <= nums[i] <= 10^9`
- `1 <= k <= nums.length`

## 基礎思路

本題要求找出最長的連續子陣列，使其中任一數值的出現次數皆不超過 `k`。
輸入規模可達 $10^5$，且數值範圍高達 $10^9$，因此不能以列舉所有子陣列的方式求解，也不能用數值直接當索引建表。

在思考解法時，可掌握以下核心觀察：

- **合法性具有單調性**：
  若某個區間已經合法，則其任意子區間必然也合法；反之，一旦區間不合法，繼續向右擴張也不會變回合法。此單調性正是滑動視窗成立的前提。

- **破壞合法性的來源唯一**：
  每次僅在右端新增一個元素，能使視窗違規的只有「剛剛加入的那個數值」，其餘數值的次數並未改變。因此收縮左界時，只需持續檢查該單一數值是否已回到限制內。

- **數值範圍遠大於資料量**：
  數值本身無法作為陣列索引，必須透過雜湊將其映射到有限的槽位，才能以常數時間維護每個數值在視窗中的出現次數。

- **左界收縮需要能反查次數位置**：
  移除左端元素時同樣要更新其計數，若每次都重新計算雜湊將造成重複成本；可在加入元素時記錄其對應槽位，供之後移除時直接取用。

依據以上特性，可以採用以下策略：

- **以雙指標維持一個恆為合法的視窗**，右界逐步推進，左界只會單向前移，整體移動量為線性。
- **以開放定址的雜湊表統計視窗內各數值的出現次數**，並將表格容量設為二的冪次以便用位元遮罩取代取餘運算。
- **在右端加入元素後，只針對該數值檢查是否超限**，若超限則持續收縮左界直到恢復合法，並在每輪更新最佳長度。

此策略讓每個元素至多被加入與移除各一次，能在線性時間內求得答案。

## 解題步驟

### Step 1：預先定義雜湊乘數常數

先定義用於雜湊擾動的乘數常數，此為黃金比例相關的常見取值，可讓輸入位元均勻散布至高位。

```typescript
const HASH_MULTIPLIER = 0x9e3779b1;
```

### Step 2：取得長度並處理限制過寬的情況

先取得陣列長度；若允許的頻率上限已不小於陣列長度，代表任何數值都不可能超限，整個陣列本身即為答案。

```typescript
const length = nums.length;

// 任何數值出現次數都不可能超過 `length`，因此整個陣列已符合條件
if (k >= length) {
  return length;
}
```

### Step 3：計算雜湊表的容量與相關遮罩

取能容納兩倍元素數量的最小二的冪次作為表格大小，使負載因子維持在 0.5 以下以降低探測衝突；同時預先算出位元遮罩與位移量，供後續以位元運算取代除法。

```typescript
// 取可容納 2 * length 的最小二的冪次表格，將負載因子壓在 0.5
const tableBits = 32 - Math.clz32(length * 2 - 1);
const tableSize = 1 << tableBits;
const tableMask = tableSize - 1;
const hashShift = 32 - tableBits;
```

### Step 4：配置雜湊表與槽位對照所需的陣列

分別配置儲存鍵值的表、儲存出現次數的表，以及記錄每個位置所對應槽位的陣列。由於配置時內容已全為零，而輸入數值最小為 1，故鍵值 0 天然代表空槽。

```typescript
// 配置時已自動歸零，因此鍵值 0 即代表該槽位為空
const hashSlotKeys = new Int32Array(tableSize);
const slotCounts = new Int32Array(tableSize);
const slotOfIndex = new Int32Array(length);
```

### Step 5：初始化視窗狀態並以線性探測定位當前數值

初始化最佳長度與左界後開始向右掃描。每輪先取出當前數值，計算其雜湊起始槽位，再以線性探測往後尋找，直到遇到空槽或相同鍵值為止，最後將鍵值寫入該槽。

```typescript
let bestLength = 0;
let left = 0;

for (let right = 0; right < length; right += 1) {
  const value = nums[right];

  // 線性探測；由於所有數值皆 >= 1，儲存鍵值為 0 即代表空槽
  let slot = Math.imul(value, HASH_MULTIPLIER) >>> hashShift;
  let storedKey = hashSlotKeys[slot];
  while (storedKey !== 0 && storedKey !== value) {
    slot = (slot + 1) & tableMask;
    storedKey = hashSlotKeys[slot];
  }
  hashSlotKeys[slot] = value;

  // ...
}
```

### Step 6：快取槽位並累加當前數值的出現次數

將解析出的槽位記錄下來，使左界收縮時可直接取用而毋須重新雜湊；接著將該槽位的計數加一，代表此數值已納入視窗。

```typescript
for (let right = 0; right < length; right += 1) {
  // Step 5：取出數值並以線性探測定位槽位

  // 快取解析出的槽位，讓左指標收縮時無須重新計算雜湊
  slotOfIndex[right] = slot;

  const updatedCount = slotCounts[slot] + 1;
  slotCounts[slot] = updatedCount;

  // ...
}
```

### Step 7：當出現次數超限時收縮左界

由於只有剛加入的數值可能違規，因此僅需在其計數超過上限時收縮左界：不斷移除最左端元素並將其對應槽位的計數減一，直到該數值回到允許範圍內。

```typescript
for (let right = 0; right < length; right += 1) {
  // Step 5：取出數值並以線性探測定位槽位

  // Step 6：快取槽位並累加出現次數

  // 只有剛加入的數值可能違反限制，因此持續收縮直到它重新符合條件
  if (updatedCount > k) {
    do {
      slotCounts[slotOfIndex[left]] -= 1;
      left += 1;
    } while (slotCounts[slot] > k);
  }

  // ...
}
```

### Step 8：更新目前為止的最長合法長度

視窗此時必定合法，計算其長度並與歷史最佳值比較，若更長則更新紀錄。

```typescript
for (let right = 0; right < length; right += 1) {
  // Step 5：取出數值並以線性探測定位槽位

  // Step 6：快取槽位並累加出現次數

  // Step 7：超限時收縮左界

  const windowLength = right - left + 1;
  if (windowLength > bestLength) {
    bestLength = windowLength;
  }
}
```

### Step 9：回傳最長合法子陣列長度

掃描結束後，`bestLength` 即為所求的最長合法子陣列長度，直接回傳。

```typescript
return bestLength;
```

## 時間複雜度

- 右界掃描整個陣列一次，為 $O(n)$；
- 左界僅單向前移，累計移動量至多 $n$ 次，故收縮總成本可攤還為 $O(n)$；
- 雜湊表負載因子維持在 0.5 以下，單次線性探測的期望成本為常數；
- 總時間複雜度為 $O(n)$。

> $O(n)$

## 空間複雜度

- 雜湊鍵值表與計數表大小為不超過 $4n$ 的二的冪次，皆為 $O(n)$；
- 槽位對照陣列與輸入等長，為 $O(n)$；
- 其餘僅使用固定數量的純量變數；
- 總空間複雜度為 $O(n)$。

> $O(n)$
