# 2996. Smallest Missing Integer Greater Than Sequential Prefix Sum

You are given a 0-indexed array of integers `nums`.

A prefix `nums[0..i]` is sequential if, for all `1 <= j <= i`, `nums[j] = nums[j - 1] + 1`. 
In particular, the prefix consisting only of `nums[0]` is sequential.

Return the smallest integer `x` missing from `nums` 
such that `x` is greater than or equal to the sum of the longest sequential prefix.

**Constraints:**

- `1 <= nums.length <= 50`
- `1 <= nums[i] <= 50`

## 基礎思路

本題要求找出一個最小的整數 `x`，此 `x` 必須不存在於 `nums` 中，且需大於或等於「最長連續前綴」的總和。所謂連續前綴，是指從陣列開頭起，每個元素恰好等於前一個元素加一的最長區段。

在思考解法時，可掌握以下核心觀察：

- **最長連續前綴具有唯一性**：
  由於連續性從開頭起算，一旦出現第一次「不連續」即中斷，因此只需線性掃描一次即可確定該前綴，並累加其總和。

- **數值範圍受限**：
  題目保證所有元素皆介於 `1` 到 `50` 之間，因此任何超過 `50` 的數值都必然不存在於陣列中。若前綴總和已超過 `50`，可立即斷定其本身即為答案。

- **存在性查詢可用位元遮罩加速**：
  由於數值僅落在有限的小範圍內，可將「某數值是否存在」的資訊壓縮進固定的位元遮罩中，以避免額外配置集合空間。

- **答案為由前綴總和向上尋找的第一個缺失值**：
  從前綴總和開始逐一往上檢查，第一個不存在於陣列中的數值即為所求。

依據以上特性，可以採用以下策略：

- **先線性累加最長連續前綴之總和**。
- **若總和已超出數值上界，直接回傳該總和**。
- **否則以位元遮罩記錄存在性，並自前綴總和向上尋找第一個缺失值回傳**。

此策略能在單次掃描與常數空間內完成，安全且高效。

## 解題步驟

### Step 1：初始化並累加最長連續前綴之總和

先以第一個元素作為連續前綴的起點，記錄其值與當前總和；接著自第二個元素起逐一檢查，若當前值不等於前一值加一，即代表連續性中斷，立即停止累加。

```typescript
const length = nums.length;
let sequentialSum = nums[0];
let previousValue = nums[0];

// 累加最長連續前綴，並在遇到第一個中斷點時停止
for (let index = 1; index < length; index++) {
  const currentValue = nums[index];

  if (currentValue !== previousValue + 1) {
    break;
  }

  sequentialSum += currentValue;
  previousValue = currentValue;
}
```

### Step 2：若總和超出數值上界則直接回傳

由於每個元素皆不超過 `50`，任何大於 `50` 的總和必然不存在於陣列中，因此可直接將其視為答案回傳。

```typescript
// 每個元素皆受限於 50，因此任何超過此上界的總和必然缺失
if (sequentialSum > 50) {
  return sequentialSum;
}
```

### Step 3：以位元遮罩記錄各數值的存在性

為避免配置額外的集合空間，將 `1` 到 `50` 的存在資訊壓縮進兩個 32 位元遮罩中；小於 `32` 的數值記入低位遮罩，其餘記入高位遮罩。

```typescript
// 將數值 1..50 的存在性壓縮進兩個 32 位元遮罩，取代配置 Set
let lowPresenceMask = 0;
let highPresenceMask = 0;

for (let index = 0; index < length; index++) {
  const value = nums[index];

  if (value < 32) {
    lowPresenceMask |= 1 << value;
  } else {
    highPresenceMask |= 1 << (value - 32);
  }
}
```

### Step 4：自前綴總和向上尋找第一個缺失值

從前綴總和開始逐一往上檢查，透過對應的遮罩取出該數值的存在位元；若某數值不存在（存在位元為 0），即為所求答案並立即回傳。

```typescript
// 從前綴總和開始向上尋找，直到某數值不存在於遮罩中
let candidate = sequentialSum;

while (candidate <= 50) {
  const presenceBit = candidate < 32
    ? (lowPresenceMask >>> candidate) & 1
    : (highPresenceMask >>> (candidate - 32)) & 1;

  if (presenceBit === 0) {
    return candidate;
  }

  candidate++;
}
```

### Step 5：超出上界時回傳當前候選值

若迴圈結束仍未找到缺失值，代表候選值已超過 `50`，而任何超過 `50` 的數值皆不可能出現在陣列中，故直接回傳。

```typescript
// 任何超過 50 的數值皆不可能出現於 nums 中，因此即為答案
return candidate;
```

## 時間複雜度

- 累加前綴、建立遮罩、向上搜尋皆為線性或常數次數的掃描；
- 由於數值上界固定為 `50`，搜尋範圍為常數；
- 令 `n` 為陣列長度，總時間複雜度為 $O(n)$。

> $O(n)$

## 空間複雜度

- 僅使用固定數量的變數與兩個位元遮罩；
- 無任何額外陣列或動態空間。
- 總空間複雜度為 $O(1)$。

> $O(1)$
