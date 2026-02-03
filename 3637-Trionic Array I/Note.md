# 3637. Trionic Array I

You are given an integer array nums of length `n`.

An array is trionic if there exist indices `0 < p < q < n − 1` such that:

- `nums[0...p]` is strictly increasing,
- `nums[p...q]` is strictly decreasing,
- `nums[q...n − 1]` is strictly increasing.

Return `true` if `nums` is trionic, otherwise return `false`.

**Constraints:**

- `3 <= n <= 100`
- `-1000 <= nums[i] <= 1000`

## 基礎思路

本題要判斷陣列是否存在三段「非空」的趨勢，且能用兩個分割點 `p`、`q`（滿足 `0 < p < q < n - 1`）切成：

1. **第一段嚴格遞增**：從起點一路上升到某個峰值位置。
2. **第二段嚴格遞減**：從峰值一路下降到某個谷值位置。
3. **第三段嚴格遞增**：從谷值之後一路上升到結尾。

關鍵在於：

* 三段都必須**至少有一步**（非空趨勢），因此峰值不能在最左端、谷值不能在最右端。
* 我們可以用**單一指標線性掃描**：先吃掉第一段遞增，再吃掉第二段遞減，最後吃掉第三段遞增。
* 每段結束後，要立即檢查分割點是否合法（確保三段都存在且還有空間繼續），最後也要確認第三段確實延伸到陣列末端。

這樣能用一次掃描就完成判斷，時間成本隨陣列長度線性成長。

## 解題步驟

### Step 1：初始化長度與基本不可能情況

需要能切出三段趨勢且各段非空，因此長度至少要能容納內部分割點。

```typescript
const length = nums.length;

// 需要能容納三段非空趨勢與內部分割點
if (length < 4) {
  return false;
}

let index = 1;
```

### Step 2：吃掉第一段嚴格遞增並檢查峰值位置合法性

從左往右掃描，先形成第一段嚴格遞增；停止時的前一個位置就是峰值。必須確保峰值不在最左端，且後面仍有空間形成後兩段。

```typescript
// 從索引 0 開始吃掉第一段嚴格遞增
while (index < length && nums[index] > nums[index - 1]) {
  index++;
}

const peakIndex = index - 1;
if (peakIndex <= 0) {
  return false;
}
if (index >= length - 1) {
  return false;
}
```

### Step 3：吃掉第二段嚴格遞減並檢查谷值位置合法性

接著從峰值之後繼續掃描第二段嚴格遞減；停止時的前一個位置就是谷值。必須確保谷值在峰值右側，且谷值不能在最右端，並且仍有元素可形成第三段。

```typescript
// 從 peakIndex 開始吃掉第二段嚴格遞減
while (index < length && nums[index] < nums[index - 1]) {
  index++;
}

const valleyIndex = index - 1;
if (valleyIndex <= peakIndex) {
  return false;
}
if (index >= length) {
  return false;
}
if (valleyIndex >= length - 1) {
  return false;
}
```

### Step 4：吃掉第三段嚴格遞增，並要求第三段至少有一步且必須到達結尾

第三段必須真的上升至少一次，且最終必須剛好走到 `length`，代表整個尾段都符合嚴格遞增。

```typescript
// 吃掉最後一段嚴格遞增直到結尾
const startFinalIndex = index;
while (index < length && nums[index] > nums[index - 1]) {
  index++;
}

// 重要：最後一段必須至少有一步遞增，且必須走完整個陣列
if (startFinalIndex === index) {
  return false;
}

return index === length;
```

## 時間複雜度

- 指標 `index` 只會從左到右單調遞增，三段掃描總共最多前進 `n - 1` 次；
- 每次前進只做常數次比較與更新。
- 總時間複雜度為 $O(n)$。

> $O(n)$

## 空間複雜度

- 僅使用常數個變數（`length`, `index`, `peakIndex`, `valleyIndex`, `startFinalIndex`）；
- 不使用額外與 `n` 成比例的資料結構。
- 總空間複雜度為 $O(1)$。

> $O(1)$
