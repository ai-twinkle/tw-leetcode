# 3381. Maximum Subarray Sum With Length Divisible by K

You are given an array of integers `nums` and an integer `k`.

Return the maximum sum of a subarray of `nums`, such that the size of the subarray is divisible by `k`.

**Constraints:**

- `1 <= k <= nums.length <= 2 * 10^5`
- `-10^9 <= nums[i] <= 10^9`

## 基礎思路

本題要求從整數陣列 `nums` 中找出一段子陣列，使其長度可以被 `k` 整除，且總和最大。

要達成此目標，必須掌握以下觀察：

- **前綴和將子陣列求和轉成 prefix[r] − prefix[l − 1]**
  若子陣列長度 `(r - l + 1)` 可被 `k` 整除，等價於：
  **r % k === (l - 1) % k**

- **因此只需將前綴和依照「索引 % k」分類**
  若兩個前綴和 `prefix[i]`、`prefix[j]` 屬於相同餘數類別，則它們能形成合法子陣列。

- **最大子陣列和 ⇔ prefix[i] − min(prefix[j])（同餘數類別）**
  對於每個餘數 `r`，只需要維護「最小前綴和」，就能在掃描到下一個同餘數時求出最佳差值。

- **避免在迴圈中使用 expensive 的 `i % k`**
  因此使用 `residueIndex` 逐步遞增並在抵達 `k` 時手動歸零，效能更佳。

整體方法為：
維護 `k` 個餘數類別的最小 prefixSum，並在一次線性掃描中完成所有比較，達成最佳 $O(n)$ 時間複雜度。

## 解題步驟

### Step 1：初始化每個餘數類別的最小前綴和

建立 `residueMinimumPrefixSumArray`，長度為 `k`，初始值設為正無限大，
用於記錄每個餘數類別目前觀察到的最小前綴和。

```typescript
const numsLength = nums.length;

// 為每個餘數類別配置最小前綴和空間
const residueMinimumPrefixSumArray = new Float64Array(k);

// 初始化為 +Infinity，使後續前綴和值可以成為最小值
for (let index = 0; index < k; index += 1) {
  residueMinimumPrefixSumArray[index] = Number.POSITIVE_INFINITY;
}
```

### Step 2：處理「從 index = 0 開始」的合法子陣列

若子陣列從 0 開始，其長度要能被 k 整除，則前綴和「前一個位置」視為 0。
該值的餘數類別為 `k - 1`。

```typescript
// 處理從索引 0 開始、長度可被 k 整除的子陣列
residueMinimumPrefixSumArray[k - 1] = 0;
```

### Step 3：準備前綴和、答案與 residueIndex

設定 `prefixSum`、`maximumSum` 與 `residueIndex`，
並避免在迴圈中使用 costly 的 `% k` 運算。

```typescript
// 初始最大值以強負值表示
const negativeMaxSafeInteger = -Number.MAX_SAFE_INTEGER;

let prefixSum = 0;
let maximumSum = negativeMaxSafeInteger;

// 手動遞增 residueIndex 取代 index % k
let residueIndex = 0;
```

### Step 4：一次掃描陣列，維護最小前綴和並更新最大子陣列答案

使用一次 `for` 迴圈，同時完成：

- 更新前綴和
- 用同餘數類別的最小前綴和形成候選值
- 更新全域最大值
- 更新該餘數類別最小前綴和
- `residueIndex` 遞增並包回

```typescript
// 單次掃描陣列以求最大總和
for (let index = 0; index < numsLength; index += 1) {
  // 更新前綴和
  prefixSum += nums[index];

  // 使用相同餘數類別的最小前綴和形成候選值
  const candidateSum = prefixSum - residueMinimumPrefixSumArray[residueIndex];

  // 更新最大子陣列總和（若更大）
  if (candidateSum > maximumSum) {
    maximumSum = candidateSum;
  }

  // 維護該餘數類別最小前綴和
  if (prefixSum < residueMinimumPrefixSumArray[residueIndex]) {
    residueMinimumPrefixSumArray[residueIndex] = prefixSum;
  }

  // 更新 residueIndex（避免使用 modulo）
  residueIndex += 1;
  if (residueIndex === k) {
    residueIndex = 0;
  }
}
```

### Step 5：回傳最大子陣列總和

```typescript
return maximumSum;
```

## 時間複雜度

- 使用單次線性掃描，每一步均為 $O(1)$；
- 總時間複雜度為 $O(n)$。

> $O(n)$

## 空間複雜度

- 使用一個長度為 `k` 的陣列儲存最小前綴和；
- 其餘皆為常數空間；
- 總空間複雜度為 $O(k)$。

> $O(k)$
