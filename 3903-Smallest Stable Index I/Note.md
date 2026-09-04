# 3903. Smallest Stable Index I

You are given an integer array `nums` of length `n` and an integer `k`.

For each index `i`, define its instability score as `max(nums[0..i]) - min(nums[i..n - 1])`.

In other words:

- `max(nums[0..i])` is the largest value among the elements from index 0 to index `i`.
- `min(nums[i..n - 1])` is the smallest value among the elements from index `i` to index `n - 1`.

An index `i` is called stable if its instability score is less than or equal to `k`.

Return the smallest stable index. If no such index exists, return -1.

**Constraints:**

- `1 <= nums.length <= 100`
- `0 <= nums[i] <= 10^9`
- `0 <= k <= 10^9`

## 基礎思路

本題要求找出第一個「穩定索引」：該索引之前綴最大值與後綴最小值之差不超過給定門檻。最直觀的做法是對每個索引分別求出其前綴最大值與後綴最小值再逐一驗證，但若能掌握此問題的單調結構，實際上只需一次掃描即可完成。

在思考解法時，可掌握以下核心觀察：

- **不穩定性由一組「違規配對」所導致**：
  若存在一個較前位置的元素與一個較後位置的元素，兩者差距已超過門檻，則此配對本身即足以破壞穩定性，無須考慮其他元素。

- **一次違規會使整段區間同時失效**：
  當某個違規配對出現時，凡是夾在這兩個位置之間的所有索引，其前綴必然涵蓋較大的那一端、後綴必然涵蓋較小的那一端，因此這一整段索引全部不可能穩定，可以整批排除。

- **候選位置只會向前推進、不會回退**：
  由於被排除的索引永遠不會重新變得可行，維護一個「目前最小可能答案」的候選位置即可；每當偵測到違規，就直接把候選推到違規位置之後。

- **前綴最大值可隨掃描累積**：
  前綴最大值只會隨索引增加而不減，因此在掃描過程中持續累積即可；而候選一旦被推進到新的位置，該位置的前綴最大值恰好就是當下累積到的最大值。

依據以上特性，可以採用以下策略：

- **以單一指標維護目前的候選答案**，並在掃描時同步累積整體的前綴最大值。
- **當掃描抵達候選位置時，凍結該候選的前綴最大值，並開始累積其後綴最小值**。
- **每讀入一個元素後即檢查候選的差距是否超標**，一旦超標便將候選整批跳過至當前位置之後。
- **掃描結束後，若候選仍落在合法範圍內即為答案，否則代表不存在穩定索引**。

此策略只需一次線性掃描與常數額外空間，即可得到最小的穩定索引。

## 解題步驟

### Step 1：初始化候選索引與掃描所需的統計量

先取得陣列長度，並將候選索引設為最前端；由於題目保證元素皆為非負，使用 `-1` 作為前綴最大值與後綴最小值的初始哨兵值，可確保首次更新必定生效。

```typescript
const length = nums.length;
let candidateIndex = 0;
let prefixMaxOfCandidate = -1;
let suffixMinFromCandidate = -1;
let runningPrefixMax = -1;
```

### Step 2：線性掃描並持續累積整體前綴最大值

由左至右逐一讀取元素，並在每一輪更新累積至目前位置的最大值；此累積值將在候選被推進時，作為新候選前綴最大值的來源。

```typescript
for (let scanIndex = 0; scanIndex < length; scanIndex++) {
  const value = nums[scanIndex];

  // nums[0..scanIndex] 的累積最大值；用於初始化新晉升的候選。
  if (value > runningPrefixMax) {
    runningPrefixMax = value;
  }

  // ...
}
```

### Step 3：凍結候選的前綴最大值並累積其後綴最小值

當掃描位置恰好等於候選位置時，代表候選的前綴已完整，可直接凍結其前綴最大值，並以該元素作為後綴最小值的起點；若掃描位置已超過候選，則持續收緊候選之後所觀察到的最小值。

```typescript
for (let scanIndex = 0; scanIndex < length; scanIndex++) {
  // Step 2：讀取元素並更新累積前綴最大值

  if (scanIndex === candidateIndex) {
    // 抵達候選本身：凍結其前綴最大值，並開啟其後綴最小值。
    prefixMaxOfCandidate = runningPrefixMax;
    suffixMinFromCandidate = value;
  } else if (value < suffixMinFromCandidate) {
    // 收緊 nums[candidateIndex..scanIndex] 範圍內所觀察到的最小值。
    suffixMinFromCandidate = value;
  }

  // ...
}
```

### Step 4：偵測違規配對並整批跳過失效區間

每讀入一個元素後，檢查候選的前綴最大值與後綴最小值之差是否已超過門檻；若超過，代表存在一組違規配對，使得候選到當前位置之間的所有索引皆不可能穩定，故直接把候選推進到當前位置之後。

```typescript
for (let scanIndex = 0; scanIndex < length; scanIndex++) {
  // Step 2：讀取元素並更新累積前綴最大值

  // Step 3：凍結候選前綴最大值並累積後綴最小值

  if (prefixMaxOfCandidate - suffixMinFromCandidate > k) {
    // 一組違規配對（a <= candidateIndex、b = scanIndex）會使
    // [candidateIndex, scanIndex] 中的每個索引都不穩定，故整段跳過。
    candidateIndex = scanIndex + 1;
  }
}
```

### Step 5：回傳候選索引或判定無解

掃描結束後，若候選索引仍在陣列範圍內，即為最小的穩定索引；若已被推出範圍，代表不存在任何穩定索引，回傳 `-1`。

```typescript
return candidateIndex < length ? candidateIndex : -1;
```

## 時間複雜度

- 僅對陣列進行一次由左至右的掃描；
- 每個元素只被讀取一次，且每輪內部皆為常數次比較與賦值；
- 候選索引只會單向前進，不會回退重掃。
- 總時間複雜度為 $O(n)$。

> $O(n)$

## 空間複雜度

- 僅使用固定數量的純量變數維護候選位置與極值；
- 未配置任何額外陣列或動態結構。
- 總空間複雜度為 $O(1)$。

> $O(1)$
