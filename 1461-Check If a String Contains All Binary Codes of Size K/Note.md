# 1461. Check If a String Contains All Binary Codes of Size K

Given a binary string `s` and an integer `k`, return `true` if every binary code of length `k` is a substring of `s`. 
Otherwise, return `false`.

**Constraints:**

- `1 <= s.length <= 5 * 10^5`
- `s[i]` is either `'0'` or `'1'`.
- `1 <= k <= 20`

## 基礎思路

本題要判斷：長度為 `k` 的所有二進位字串（共有 $2^k$ 種）是否都曾在字串中出現過。由於字串長度可達 $5 \times 10^5$，不能逐一比對所有候選碼與所有子字串，必須用線性掃描完成。

核心觀察與策略如下：

* **每個長度為 `k` 的子字串都可視為一個 `k` 位元整數狀態**：
  將視窗內的 `0/1` 依序轉成位元並累積，可把子字串映射到 `[0, 2^k - 1]` 的編號，方便用集合結構紀錄是否出現過。

* **用滾動視窗在 $O(1)$ 更新狀態**：
  視窗向右滑動一格時，只需左移一位、保留低 `k` 位、再加入新的 bit，即可得到新視窗的整數編號，避免重新掃描 `k` 個字元。

* **先做不可行剪枝**：
  若字串長度不足以產生任何長度 `k` 子字串，或可形成的視窗數量少於 $2^k$，必定不可能涵蓋所有代碼，可直接回傳 `false`。

* **以位元集合紀錄已出現代碼並倒數剩餘數量**：
  由於 `k <= 20`，最多 $2^{20}$ 個狀態，適合用位元集合壓縮記憶體；每次首次遇到新代碼就遞減剩餘數量，若剩餘為 0 可立刻回傳 `true`。

## 解題步驟

### Step 1：宣告快取表以儲存代碼總數與滾動遮罩

先建立兩個表，分別用於快速取得 $2^k$ 以及保留低 `k` 位的遮罩，避免在每次呼叫時重複計算。

```typescript
// 預先計算 k 在 [1..20] 的位元遮罩與代碼總數（依約束 k <= 20）。
const totalBinaryCodesByLength = new Int32Array(21);
const rollingMaskByLength = new Int32Array(21);
```

### Step 2：一次性預先填好 2^k 與遮罩表

用立即執行函數一次性把每個 `k` 的 `2^k` 與 `(2^k - 1)` 填入快取，讓後續主流程只需 O(1) 取用。

```typescript
/**
 * 一次性預先計算 2^k 與滾動視窗遮罩（2^k - 1），
 * 讓每次呼叫函數時避免重複位移計算。
 */
(function precomputeCache() {
  for (let codeLength = 1; codeLength <= 20; codeLength++) {
    const totalCodes = 1 << codeLength;
    totalBinaryCodesByLength[codeLength] = totalCodes;
    rollingMaskByLength[codeLength] = totalCodes - 1;
  }
})();
```

### Step 3：取得字串長度並處理 k 大於字串長度的情況

若 `k` 比字串長度還大，根本無法形成任何長度為 `k` 的子字串，直接回傳 `false`。

```typescript
const stringLength = s.length;

// 不可能存在長度為 k 的子字串。
if (k > stringLength) {
  return false;
}
```

### Step 4：計算視窗數量與代碼總數並做剪枝

所有長度為 `k` 的代碼共有 $2^k$ 種；字串可形成的長度為 `k` 視窗數量為 `stringLength - k + 1`。若視窗數量不足以覆蓋所有代碼，必定不可能達成。

```typescript
const totalCodes = totalBinaryCodesByLength[k];
const numberOfWindows = stringLength - k + 1;

// 視窗數量不足以涵蓋所有可能的 k 位元代碼。
if (totalCodes > numberOfWindows) {
  return false;
}
```

### Step 5：建立位元集合並初始化剩餘代碼數

用 bitset 以節省記憶體（最多 $2^{20}$ 個狀態），並以倒數方式追蹤還剩多少代碼尚未看見，方便提早結束。

```typescript
// Bitset 可在 k 很大時降低記憶體用量（最多 2^20 個狀態）。
const bitsetWordCount = (totalCodes + 31) >>> 5;
const seenCodesBitset = new Uint32Array(bitsetWordCount);
let remainingCodes = totalCodes;
```

### Step 6：建立第一個長度為 k 的滾動狀態

先用前 `k` 個字元建立初始視窗的整數狀態，作為後續滑動更新的起點。

```typescript
// 建立初始長度為 k 的滾動值。
let rollingValue = 0;
let index = 0;

// 使用 charCodeAt & 1 將 '0'/'1' 轉為 0/1，以降低額外開銷。
while (index < k) {
  rollingValue = (rollingValue << 1) | (s.charCodeAt(index) & 1);
  index++;
}
```

### Step 7：標記第一個視窗並處理可立即結束的情況

將第一個視窗對應的代碼標記為已見，並更新剩餘數量；若已涵蓋所有代碼，可直接回傳 `true`。

```typescript
// 標記第一個視窗。
let bitsetWordIndex = rollingValue >>> 5;
let bitsetBitMask = 1 << (rollingValue & 31);
seenCodesBitset[bitsetWordIndex] |= bitsetBitMask;
remainingCodes--;

if (remainingCodes === 0) {
  return true;
}
```

### Step 8：取得滾動遮罩並以 O(1) 方式滑動視窗

使用遮罩保留低 `k` 位，視窗每向右滑動一格就更新 `rollingValue`，並僅在首次遇到新代碼時才扣減剩餘數量；剩餘為 0 時立即回傳 `true`。

```typescript
const rollingMask = rollingMaskByLength[k];

// 以滾動雜湊在每步 O(1) 滑動視窗。
for (let rightIndex = k; rightIndex < stringLength; rightIndex++) {
  rollingValue = ((rollingValue << 1) & rollingMask) | (s.charCodeAt(rightIndex) & 1);

  bitsetWordIndex = rollingValue >>> 5;
  bitsetBitMask = 1 << (rollingValue & 31);

  if ((seenCodesBitset[bitsetWordIndex] & bitsetBitMask) === 0) {
    // 只在首次發現新代碼時才計數。
    seenCodesBitset[bitsetWordIndex] |= bitsetBitMask;
    remainingCodes--;

    if (remainingCodes === 0) {
      return true;
    }
  }
}
```

### Step 9：掃描結束仍未涵蓋所有代碼則回傳 false

若整段掃描完成後仍有代碼未出現，則不符合條件，回傳 `false`。

```typescript
return false;
```

## 時間複雜度

- 建立初始視窗需處理 `k` 個字元；
- 其後滑動視窗掃描剩餘 `n - k` 個字元，每步皆為常數時間更新與查詢；
- 總時間複雜度為 $O(n)$。

> $O(n)$

## 空間複雜度

- 使用 bitset 紀錄所有 `k` 位元代碼是否出現過，所需空間與 $2^k$ 成正比；
- 其餘變數皆為常數額外空間；
- 總空間複雜度為 $O(2^k)$。

> $O(2^k)$
