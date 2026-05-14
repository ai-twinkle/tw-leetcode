# 2784. Check if Array is Good

You are given an integer array `nums`. 
We consider an array good if it is a permutation of an array `base[n]`.

`base[n] = [1, 2, ..., n - 1, n, n]` 
(in other words, it is an array of length `n + 1` which contains `1` to `n - 1` exactly once, plus two occurrences of `n`). 
For example, `base[1] = [1, 1]` and `base[3] = [1, 2, 3, 3]`.

Return `true` if the given array is good, otherwise return `false`.

Note: A permutation of integers represents an arrangement of these numbers.

**Constraints:**

- `1 <= nums.length <= 100`
- `1 <= num[i] <= 200`

## 基礎思路

本題要求判斷給定的整數陣列是否為合法的「好陣列」，即其元素是否構成 `base[n]` 的某種排列。`base[n]` 的定義為長度 `n + 1` 的陣列，包含 `1` 到 `n - 1` 各恰好一次，以及 `n` 恰好兩次。

在思考解法時，可掌握以下核心觀察：

- **長度決定目標結構**：
  給定陣列的長度 `L` 唯一決定了目標 `base[n]`，其中 `n = L - 1`。因此，合法元素值的範圍為 `1` 到 `n`，且 `n` 出現兩次、其餘各出現一次。

- **值的合法範圍可直接由長度推導**：
  任何大於或等於陣列長度的值，必然超出 `base[n]` 所允許的最大值 `n`，可立即判定為非法。

- **出現次數是關鍵判斷依據**：
  `1` 到 `n - 1` 各只能出現恰好一次，而 `n` 可以出現至多兩次；任何超過各自上限的情形，皆可直接否決。

- **計數檢查可於掃描過程中同步進行**：
  無需等到掃描結束再統計，每遇到一個值便可立即驗證其合法性，一旦違規即可提前終止。

依據以上特性，可以採用以下策略：

- **以陣列長度推導合法的最大值與出現次數上限**，並建立一個計數緩衝區。
- **線性掃描陣列，對每個值即時進行範圍與頻率的雙重檢查**，一旦違規立刻回傳 `false`。
- **掃描完畢若無任何違規，即可確認為好陣列，回傳 `true`**。

此策略僅需一次線性掃描，並在掃描過程中同步完成所有驗證，兼顧效率與簡潔。

## 解題步驟

### Step 1：初始化計數緩衝區

首先記錄陣列長度，並建立一個與其等長的計數緩衝區，用來追蹤每個值在掃描過程中出現的次數。

```typescript
const arrayLength = nums.length;
const countBuffer = new Uint8Array(arrayLength);
```

### Step 2：掃描每個元素並檢查值是否超出合法範圍

對陣列中的每個元素，先取出其值，再立即判斷是否超出合法範圍 `1..n`（其中 `n = arrayLength - 1`）。由於合法最大值為 `arrayLength - 1`，任何大於或等於 `arrayLength` 的值皆不合法，可直接回傳 `false`。

```typescript
for (let scanIndex = 0; scanIndex < arrayLength; scanIndex++) {
  const currentValue = nums[scanIndex];

  // 值必須落在 1..arrayLength-1 的範圍內
  if (currentValue >= arrayLength) {
    return false;
  }

  // ...
}
```

### Step 3：對非最大值檢查是否重複出現

在值合法的前提下，若當前值小於最大值（即不是 `n`），則它只允許出現一次；若計數緩衝區中已有紀錄，代表重複，直接回傳 `false`。

```typescript
for (let scanIndex = 0; scanIndex < arrayLength; scanIndex++) {
  const currentValue = nums[scanIndex];

  // Step 2：檢查值是否超出合法範圍

  // 最大值（arrayLength - 1）最多可出現兩次；其他值至多只能出現一次
  if (currentValue < arrayLength - 1 && countBuffer[currentValue] > 0) {
    return false;
  }

  // ...
}
```

### Step 4：對最大值檢查是否超過兩次出現

若當前值恰好等於最大值 `n`，則允許出現至多兩次；若計數緩衝區中已有兩次紀錄，代表超出上限，直接回傳 `false`。完成檢查後，將該值的計數遞增。

```typescript
for (let scanIndex = 0; scanIndex < arrayLength; scanIndex++) {
  const currentValue = nums[scanIndex];

  // Step 2：檢查值是否超出合法範圍

  // Step 3：對非最大值檢查是否重複出現

  if (currentValue === arrayLength - 1 && countBuffer[currentValue] > 1) {
    return false;
  }

  countBuffer[currentValue]++;
}
```

### Step 5：掃描完畢後回傳結果

若整個掃描過程未觸發任何提前回傳，代表陣列的所有元素皆符合 `base[n]` 的排列條件，回傳 `true`。

```typescript
return true;
```

## 時間複雜度

- 對長度為 $n$ 的輸入陣列進行一次線性掃描，每個元素僅需常數時間的檢查與更新；
- 總時間複雜度為 $O(n)$。

> $O(n)$

## 空間複雜度

- 建立一個與輸入陣列等長的計數緩衝區，空間用量與輸入長度線性相關；
- 總空間複雜度為 $O(n)$。

> $O(n)$
