# 3904. Smallest Stable Index II

You are given an integer array `nums` of length `n` and an integer `k`.

For each index `i`, define its instability score as `max(nums[0..i]) - min(nums[i..n - 1])`.

In other words:

- `max(nums[0..i])` is the largest value among the elements from index 0 to index i.
- `min(nums[i..n - 1])` is the smallest value among the elements from index i to index n - 1.

An index `i` is called stable if its instability score is less than or equal to k.

Return the smallest stable index. 
If no such index exists, return -1.

**Constraints:**

- `1 <= nums.length <= 10^5`
- `0 <= nums[i] <= 10^9`
- `0 <= k <= 10^9`

## 基礎思路

本題要求找出最小的「穩定索引」，其判定條件為：該索引之前綴最大值與其後綴最小值的差不超過給定門檻。由於陣列長度最大可達 $10^5$，若對每個索引都重新掃描前綴與後綴，將退化為平方級的計算量，因此需要以預處理與單向掃描的方式取代重複計算。

在思考解法時，可掌握以下核心觀察：

- **前綴最大值單調不減，後綴最小值單調不增**：
  隨著索引往右移動，前綴最大值只會變大或持平，後綴最小值只會變小或持平，因此兩者皆可用一次線性掃描增量維護。

- **兩側資訊的取得方向相反**：
  前綴資訊可在由左往右掃描時順勢累積，但後綴資訊必須由右往左取得，因此只有後綴這一側需要事先建表快取。

- **全域最小值決定了一段必然失敗的區間**：
  在全域最小值最後一次出現的位置之前（含該位置），所有索引的後綴最小值都等於全域最小值，而其前綴最大值又不小於首元素。因此只要首元素與全域最小值的差已經超過門檻，這整段索引就全部不可能成立，無須逐一檢驗。

- **左至右掃描的第一個成立者即為答案**：
  題目要求最小索引，只要由小到大依序檢查，首次成立時即可立刻回傳，無須繼續尋找。

依據以上特性，可以採用以下策略：

- **先由右往左建立後綴最小值表**，並在過程中順帶記錄全域最小值最後出現的位置。
- **先單獨檢驗索引 0**，因為它同時擁有最小的前綴最大值與全域最小值，是條件最寬鬆的候選；若它都不成立，即可據此推導出整段必然失敗的區間。
- **快速跳過必然失敗的區間，僅沿途維護前綴最大值而不做任何判斷**，之後再從真正有機會成立的位置開始逐一檢查，首次成立即回傳。

此策略只需常數次線性掃描即可完成，並藉由剪枝避開無謂的判斷。

## 解題步驟

### Step 1：處理僅有單一元素的邊界情況

當陣列只有一個元素時，其前綴最大值與後綴最小值皆為該元素本身，分數必為 0；而門檻保證為非負數，因此索引 0 必定成立，可直接回傳。

```typescript
const length = nums.length;

// 單一元素的分數為零，且 k 保證為非負數。
if (length === 1) {
  return 0;
}
```

### Step 2：由右往左建立後綴最小值表並記錄全域最小值的最後位置

後綴最小值是唯一無法在正向掃描中即時推導的一側，因此先行快取。從最右端起始，向左逐步更新目前的最小值並寫入表中；由於嚴格變小只可能發生在尚未抵達全域最小值之前，最後一次更新的位置正好就是全域最小值最後出現之處。

```typescript
// 後綴最小值是唯一無法即時推導的一側，因此先行快取。
const suffixMinimum = new Int32Array(length);
let runningMinimum = nums[length - 1];
let globalMinimumLastIndex = length - 1;
suffixMinimum[length - 1] = runningMinimum;

for (let index = length - 2; index >= 0; index--) {
  const value = nums[index];
  if (value < runningMinimum) {
    runningMinimum = value;
    // 嚴格遞減只可能發生在抵達全域最小值之前，
    // 因此最後一次更新會落在其最後出現的位置。
    globalMinimumLastIndex = index;
  }
  suffixMinimum[index] = runningMinimum;
}
```

### Step 3：優先檢驗索引 0

索引 0 的前綴最大值即為首元素，是所有索引中最小的；而其後綴最小值即為全域最小值。此組合是條件最寬鬆的候選，若成立則直接回傳最小索引 0。

```typescript
// 索引 0 將最小的前綴最大值與全域最小值配成一組。
if (nums[0] - runningMinimum <= k) {
  return 0;
}
```

### Step 4：若全域最小值落在尾端則判定無解

承上一步，既然索引 0 已失敗，代表首元素與全域最小值的差已超過門檻。若全域最小值最後出現於最末端，則每個索引的後綴最小值都是全域最小值，且前綴最大值皆不小於首元素，故所有索引都不可能成立，直接回傳 -1。

```typescript
// 直到最後一個全域最小值為止的索引，分數皆至少為 nums[0] - globalMinimum。
if (globalMinimumLastIndex === length - 1) {
  return -1;
}
```

### Step 5：初始化前綴最大值並跨越必然失敗的區段

同理，位於全域最小值最後出現位置之前（含該位置）的索引皆註定失敗。此處僅沿途累積前綴最大值以維持狀態的正確性，但完全不進行任何判斷。

```typescript
let runningMaximum = nums[0];

// 跨越註定失敗的區段，僅攜帶前綴最大值而不檢驗任何索引。
for (let index = 1; index <= globalMinimumLastIndex; index++) {
  const value = nums[index];
  if (value > runningMaximum) {
    runningMaximum = value;
  }
}
```

### Step 6：由左至右檢驗剩餘索引並回傳首個成立者

從真正具有可能性的位置開始，繼續增量維護前綴最大值，並在每一步以已建好的後綴最小值表計算分數。由於是由小到大掃描，首次成立的索引即為所求的最小索引。

```typescript
for (let index = globalMinimumLastIndex + 1; index < length; index++) {
  const value = nums[index];
  if (value > runningMaximum) {
    runningMaximum = value;
  }
  // 由左往右掃描，因此第一個符合者即為最小索引。
  if (runningMaximum - suffixMinimum[index] <= k) {
    return index;
  }
}
```

### Step 7：全部檢驗失敗時回傳 -1

若掃描結束仍未找到任何符合條件的索引，代表不存在穩定索引，回傳 -1。

```typescript
return -1;
```

## 時間複雜度

- 建立後綴最小值表需一次由右往左的線性掃描，為 $O(n)$；
- 跨越必然失敗區段與檢驗剩餘索引合計恰好再掃描一次，為 $O(n)$；
- 其餘皆為常數時間的判斷。
- 總時間複雜度為 $O(n)$。

> $O(n)$

## 空間複雜度

- 需要一個與輸入等長的後綴最小值表，為 $O(n)$；
- 其餘僅使用固定數量的純量變數；
- 總空間複雜度為 $O(n)$。

> $O(n)$
