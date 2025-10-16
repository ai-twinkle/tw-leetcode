# 2598. Smallest Missing Non-negative Integer After Operations

You are given a 0-indexed integer array `nums` and an integer `value`.

In one operation, you can add or subtract `value` from any element of `nums`.

- For example, if `nums = [1,2,3]` and `value = 2`, you can choose to subtract `value` from `nums[0]` to make `nums = [-1,2,3]`.

The MEX (minimum excluded) of an array is the smallest missing non-negative integer in it.

- For example, the MEX of `[-1,2,3]` is `0` while the MEX of `[1,0,3]` is `2`.

Return the maximum MEX of `nums` after applying the mentioned operation any number of times.

**Constraints:**

- `1 <= nums.length, value <= 10^5`
- `-10^9 <= nums[i] <= 10^9`

## 基礎思路

本題要求在對陣列 `nums` 的任意元素進行任意次「加上或減去 `value`」的操作後，求出可達到的**最大 MEX（最小缺失非負整數）**。

我們先回顧定義：
MEX（Minimum EXcluded）是陣列中**最小的未出現非負整數**。
例如：

- MEX(`[-1, 2, 3]`) = 0
- MEX(`[1, 0, 3]`) = 2

在操作上，題目允許我們任意多次地對元素 `nums[i]` 加上或減去 `value`。
例如若 `value = 3`，則一個數 4 可以變為：

- `4 + 3 = 7`
- `4 - 3 = 1`
- `4 - 6 = -2`
- …以此類推。
  因此，所有可達數字的模 `value` 結果相同，形成等價類。

換句話說，**每個數字的「可到達集合」只由它對 `value` 的餘數決定**。
這表示如果我們想要構造連續的 0, 1, 2, 3, …，
則每個整數 `k` 所需的數字，其餘數必須能對應到某個 `nums[i] % value` 的類別中，且該類別仍有可用數字可轉換。

基於此觀察，可以採用以下策略：

- **餘數分桶**：將所有 `nums[i]` 按照 `nums[i] % value` 分類，每一類表示能生成的所有數字型態。
- **貪婪構造 0, 1, 2, …**：從 0 開始嘗試構造，對於每個整數 `k`，觀察其餘數 `k % value` 所屬的桶：
    - 若該桶仍有可用數字，代表可以構造出 `k`，消耗該桶的一個數字；
    - 若該桶已空，代表無法構造 `k`，此時的 `k` 即為最大 MEX。
- **特別注意負數餘數**：在 JavaScript/TypeScript 中 `%` 對負數結果為負，因此需特別將餘數規範化至 `[0, value)` 範圍內。

## 解題步驟

### Step 1：輔助函數 `positiveRemainder` — 規範化餘數至 `[0, value)`

用來修正負數餘數，使所有餘數皆落於合法範圍內。

```typescript
/**
 * 將任意數字轉換為 [0, modulus) 範圍內的正餘數。
 *
 * @param numberValue 原始數值
 * @param modulus 正整數模數
 * @returns 正規化後的餘數
 */
function positiveRemainder(numberValue: number, modulus: number): number {
  let remainder = numberValue % modulus;
  if (remainder < 0) {
    remainder += modulus; // 修正負餘數
  }
  return remainder;
}
```

### Step 2：初始化餘數桶

建立一個長度為 `value` 的整數陣列，用來計數每個餘數類別中有多少元素。

```typescript
// 建立長度為 value 的餘數桶，用於記錄各餘數出現次數
const remainderFrequency = new Int32Array(value);
```

### Step 3：計算每個元素的餘數並分桶

對陣列中每個元素，計算其正餘數並增加該桶的計數。

```typescript
// 將每個數字歸入其餘數所屬的桶中
const arrayLength = nums.length;
for (let index = 0; index < arrayLength; index += 1) {
  const remainder = positiveRemainder(nums[index], value);
  remainderFrequency[remainder] += 1;
}
```

### Step 4：貪婪構造連續整數並尋找 MEX

從 0 開始遞增地構造可達整數，若某個所需餘數類別已無可用數字，該數即為最大 MEX。

```typescript
// 初始化 MEX 候選值
let mexCandidate = 0;

// 不斷嘗試構造 0,1,2,... 直到某一餘數桶耗盡
while (true) {
  const requiredRemainder = mexCandidate % value;

  if (remainderFrequency[requiredRemainder] > 0) {
    // 該餘數類別仍可用，消耗一個並構造下一個整數
    remainderFrequency[requiredRemainder] -= 1;
    mexCandidate += 1;
  } else {
    // 若該餘數桶為空，表示無法構造此數，即為最大 MEX
    break;
  }
}
```

### Step 5：回傳結果

回傳最終的 MEX 值。

```typescript
// 回傳最大可達 MEX
return mexCandidate;
```

## 時間複雜度

- 建立餘數桶需掃描整個陣列，為 $O(n)$。
- 之後的貪婪構造過程，每個元素最多被使用一次，亦為 $O(n)$。
- 總時間複雜度為 $O(n)$。

> $O(n)$

## 空間複雜度

- 本題主要的額外空間來自於餘數桶，用來記錄每個餘數類別的出現次數，其大小與 `value` 成正比。
- 其他輔助變數皆為常數級。
- 總空間複雜度為 $O(m)$，其中 `m` 為 `value` 的大小。

> $O(m)$
