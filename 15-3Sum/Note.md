# 15. 3Sum

Given an integer array `nums`, return all the triplets `[nums[i], nums[j], nums[k]]` 
such that `i != j`, `i != k`, and `j != k`, and `nums[i] + nums[j] + nums[k] == 0`.

Notice that the solution set must not contain duplicate triplets.

**Constraints:**

- `3 <= nums.length <= 3000`
- `-10^5 <= nums[i] <= 10^5`

## 基礎思路

本題要求在一個整數陣列中，找出所有和為 `0` 的三元組，且結果中不得包含重複的三元組。由於陣列長度最大可達 3000，若直接以三層迴圈暴力枚舉，將產生龐大的計算量，因此需要更有效率的策略。

在思考解法時，可掌握以下核心觀察：

- **排序能揭示數值間的順序關係**：
  一旦資料有序，即可利用單調性進行剪枝，並使用雙指標由兩端向中間收斂，避免無謂的枚舉。

- **重複值是去重的主要來源**：
  相同的數值會導致相同的三元組被重複產生，因此可先將資料壓縮為「相異值」與其「出現次數」，讓去重問題自然消解。

- **三元組可依組成型態分類**：
  和為零的三元組，其型態不外乎「兩個相同值加一個不同值」與「三個相異值」兩類，將兩者分開處理可讓邏輯更清晰，也能各自使用最適合的搜尋方式。

- **數值上下界可用於提早剪枝**：
  由於每個數值都受限於 `±10^5`，任何超出此範圍的配對值皆不可能存在，可直接排除；此外，若整組資料皆為正或皆為負，則永遠無法湊出零。

依據以上特性，可以採用以下策略：

- **先排序並壓縮成相異值與其重複次數表**，一舉解決去重問題。
- **第一輪處理「同一值出現兩次」的三元組**，透過重複次數表判斷是否有足夠副本，並以二分搜尋確認所需的配對值是否存在。
- **第二輪處理「三個相異值」的三元組**，利用排序後的單調性，以雙指標搭配可攤還的右界收縮進行搜尋。

此策略能在有序且去重的資料上高效地枚舉所有合法三元組，兼顧正確性與效能。

## 解題步驟

### Step 1：預先定義數值上界常數

先定義由約束條件推得的最大數值幅度，供後續提早排除不可能的配對值使用。

```typescript
/** 由約束條件允許的最大數值幅度，用於提早排除不可能的配對值。 */
const VALUE_LIMIT = 100000;
```

### Step 2：處理輔助的二分搜尋函數

我們需要一個能在遞增且無重複的陣列中快速判斷某值是否存在的工具函數。此函數以標準二分搜尋，在有效長度範圍內尋找目標值。

```typescript
/**
 * 在遞增且無重複的型別化陣列中尋找某個值。
 * @param values 遞增且相異的數值。
 * @param length 陣列前段有效元素的數量。
 * @param wanted 欲尋找的目標值。
 * @returns 若該值存在則回傳 true。
 */
function containsValue(values: Int32Array, length: number, wanted: number): boolean {
  let low = 0;
  let high = length - 1;

  while (low <= high) {
    const middle = (low + high) >> 1;
    const current = values[middle];

    if (current === wanted) {
      return true;
    }

    if (current < wanted) {
      low = middle + 1;
    }
    else {
      high = middle - 1;
    }
  }

  return false;
}
```

### Step 3：初始化並處理長度過短的邊界情況

在主函數中，先取得陣列長度並準備結果容器；若元素不足三個，則無法組成任何三元組，直接回傳空結果。

```typescript
const length = nums.length;
const result: number[][] = [];

if (length < 3) {
  return result;
}
```

### Step 4：排序輸入資料

將輸入複製為 `Int32Array` 並排序，藉由型別化陣列的原生數值排序省去每次比較所需的 JS 回呼開銷，取得遞增有序的資料。

```typescript
// Int32Array.sort 會使用原生數值排序，省去每次比較的 JS 回呼。
const sortedValues = new Int32Array(nums);
sortedValues.sort();
```

### Step 5：將有序資料壓縮為相異值與其出現次數

掃描排序後的資料，將連續相同的值合併為一筆「相異值」，並記錄其重複次數；先在迴圈中逐一比對目前值與前一個值，遇到相同則累加次數，遇到不同則將前一段結算並開始新的一段。

```typescript
// 將排序後的資料壓縮為相異值與其對應的出現次數。
const uniqueValues = new Int32Array(length);
const valueCounts = new Int32Array(length);
let uniqueCount = 0;
let previousValue = sortedValues[0];
let repeatCount = 1;

for (let index = 1; index < length; index += 1) {
  const currentValue = sortedValues[index];

  if (currentValue === previousValue) {
    repeatCount += 1;
    continue;
  }

  uniqueValues[uniqueCount] = previousValue;
  valueCounts[uniqueCount] = repeatCount;
  uniqueCount += 1;
  previousValue = currentValue;
  repeatCount = 1;
}
```

### Step 6：結算最後一段相異值

迴圈結束後，最後一段連續相同的值尚未寫入，需在此補上，才能完整記錄所有相異值與次數。

```typescript
uniqueValues[uniqueCount] = previousValue;
valueCounts[uniqueCount] = repeatCount;
uniqueCount += 1;
```

### Step 7：以整體正負性提早剪枝

若所有相異值皆為正，或皆為負，則任意三數之和都不可能為零，可直接回傳空結果。

```typescript
// 全為正或全為負的資料永遠無法湊到零。
if (uniqueValues[0] > 0 || uniqueValues[uniqueCount - 1] < 0) {
  return result;
}
```

### Step 8：第一輪——處理「同一值出現兩次」的三元組

逐一檢視每個相異值，若其副本數不足兩份則略過。針對副本足夠者，先處理 `0` 的特例：三個以上的 `0` 即可組成 `[0, 0, 0]`。

```typescript
// 第一輪：處理重複使用同一值兩次的三元組，依據出現次數表驅動。
for (let index = 0; index < uniqueCount; index += 1) {
  const availableCopies = valueCounts[index];

  if (availableCopies < 2) {
    continue;
  }

  const value = uniqueValues[index];

  if (value === 0) {
    if (availableCopies >= 3) {
      result.push([0, 0, 0]);
    }
    continue;
  }

  // ...
}
```

### Step 9：計算配對值並確認其存在後加入結果

對於非零的值，兩份相同的 `value` 需要恰好 `-2 * value` 才能湊成零。先以數值上下界排除不可能的配對值，再以二分搜尋確認其存在；確認後依 `value` 的正負決定三元組的排列順序後加入結果。

```typescript
for (let index = 0; index < uniqueCount; index += 1) {
  // Step 8：檢查副本數並處理 0 的特例

  // 兩份 value 需要恰好 -2 * value 才能湊成零。
  const partnerValue = -2 * value;

  if (partnerValue < -VALUE_LIMIT || partnerValue > VALUE_LIMIT) {
    continue;
  }

  if (!containsValue(uniqueValues, uniqueCount, partnerValue)) {
    continue;
  }

  if (value < 0) {
    result.push([value, value, partnerValue]);
  }
  else {
    result.push([partnerValue, value, value]);
  }
}
```

### Step 10：第二輪——設定錨點迴圈並進行單調性剪枝

第二輪處理三個相異值的三元組。以 `index` 作為最小值錨點，逐一往後推進；若當前錨點加上最小的兩個後續值仍大於零，代表之後只會更大，可直接結束；若加上最大的兩個後續值仍小於零，則此錨點無解，跳過。

```typescript
// 第二輪：處理三個相異值的三元組，因此不需要跳過重複值的迴圈。
const lastIndex = uniqueCount - 1;
let rightStart = lastIndex;

for (let index = 0; index + 2 < uniqueCount; index += 1) {
  const firstValue = uniqueValues[index];

  // 最小可達之和已經超過零，之後只會更大。
  if (firstValue + uniqueValues[index + 1] + uniqueValues[index + 2] > 0) {
    break;
  }

  // 此錨點下的最大可達之和仍為負。
  if (firstValue + uniqueValues[lastIndex - 1] + uniqueValues[lastIndex] < 0) {
    continue;
  }

  // ...
}
```

### Step 11：攤還地收縮右界

在固定錨點下，剩餘兩數需湊出 `pairTarget = -firstValue`。由於有用的右界只會隨錨點增大而向左移動，故將其跨迭代攤還收縮；若收縮後右界不再有效空間，則跳過此錨點。

```typescript
for (let index = 0; index + 2 < uniqueCount; index += 1) {
  // Step 10：設定錨點並進行單調性剪枝

  const pairTarget = -firstValue;
  const smallestPartner = uniqueValues[index + 1];

  // 有用的右界只會隨錨點增大而向左移動，故跨迭代攤還處理。
  while (rightStart > index + 1 && smallestPartner + uniqueValues[rightStart] > pairTarget) {
    rightStart -= 1;
  }

  if (rightStart <= index + 1) {
    continue;
  }

  // ...
}
```

### Step 12：以雙指標搜尋成對的相異值

在 `[index + 1, rightStart]` 區間內以雙指標由兩端向中收斂：配對和過小則左指標右移，過大則右指標左移，恰好等於目標時記錄該三元組，並同時移動兩個指標。

```typescript
for (let index = 0; index + 2 < uniqueCount; index += 1) {
  // Step 10：設定錨點並進行單調性剪枝

  // Step 11：攤還地收縮右界

  let left = index + 1;
  let right = rightStart;

  while (left < right) {
    const pairSum = uniqueValues[left] + uniqueValues[right];

    if (pairSum < pairTarget) {
      left += 1;
    }
    else if (pairSum > pairTarget) {
      right -= 1;
    }
    else {
      result.push([firstValue, uniqueValues[left], uniqueValues[right]]);
      left += 1;
      right -= 1;
    }
  }
}
```

### Step 13：回傳最終結果

所有輪次處理完畢後，`result` 已收集到全部相異的三元組，直接回傳。

```typescript
return result;
```

## 時間複雜度

- 排序需 $O(n \log n)$；
- 壓縮相異值需一次線性掃描 $O(n)$；
- 第一輪對每個相異值進行一次二分搜尋，為 $O(u \log u)$，其中 $u$ 為相異值數量；
- 第二輪以錨點搭配雙指標，右界收縮可攤還為線性，整體為 $O(u^2)$；
- 由於 $u \le n$，故可以將時間複雜度簡化為 $O(n^2)$；
- 總時間複雜度為 $O(n^2)$。

> $O(n^2)$

## 空間複雜度

- 需要額外的排序陣列、相異值陣列與次數陣列，皆為 $O(n)$；
- 不計輸出結果所佔用的空間；
- 總空間複雜度為 $O(n)$。

> $O(n)$
