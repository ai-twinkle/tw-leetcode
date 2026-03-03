# 1545. Find Kth Bit in Nth Binary String

Given two positive integers `n` and `k`, the binary string $S_n$ is formed as follows:

- `S_1 = "0"`
- `S_i = S_{i - 1} + "1" + reverse(invert(S_{i - 1})) for i > 1`

Where `+` denotes the concatenation operation, `reverse(x)` returns the reversed string `x`, 
and `invert(x)` inverts all the bits in `x` (`0` changes to `1` and `1` changes to `0`).

For example, the first four strings in the above sequence are:

- `S_1 = "0"`
- `S_2 = "011"`
- `S_3 = "0111001"`
- `S_4 = "011100110110001"`

Return the $k^{th}$ bit in `S_n`. 
It is guaranteed that `k` is valid for the given `n`.

**Constraints:**

- `1 <= n <= 20`
- `1 <= k <= 2n - 1`

## 基礎思路

本題的字串遞迴結構可視為：每一層由「左半（上一層）」＋「中心固定值」＋「右半（左半反轉後取反）」組成。題目只要求第 `k` 位，因此不必實際建構整個字串。

可利用以下關鍵觀察直接定位答案：

* **中心位元可直接決定**：在任一層的中心位置，原始位元固定為 `"1"`；若過程中累積了翻轉，則中心位元會變成 `"0"`。
* **右半可鏡射回左半**：若目標落在右半，一定能鏡射到左半對應位置；且因右半來自「取反」，每次鏡射都會讓最終答案翻轉一次。
* **逐層縮小直到基底**：每次將位置（必要時鏡射）轉回左半後，層級下降一層，直到到達最底層再由翻轉狀態決定答案。
* **只需記錄翻轉奇偶**：用布林值累積「鏡射到右半」的次數奇偶，即可在回傳時套用翻轉。

## 解題步驟

### Step 1：初始化層級、位置與翻轉狀態

以三個狀態量追蹤目前層級、目標位置，以及是否需要翻轉最終答案。

```typescript
let currentLevel = n;
let currentPosition = k;
let shouldInvert = false;
```

### Step 2：逐層計算中心位置並處理「命中中心」的直接回傳

在尚未到最底層時，每一輪先取得該層中心位置；若目標位置正好在中心，則可依翻轉狀態立即回傳。

```typescript
// 反覆在落於右半時映射回左半，並在每次映射時切換翻轉狀態，直到抵達 S_1 或中心。
while (currentLevel > 1) {
  const middleIndex = 1 << (currentLevel - 1);

  if (currentPosition === middleIndex) {
    return shouldInvert ? "0" : "1";
  }

  // ...
}
```

### Step 3：若落在右半邊，鏡射回左半並切換翻轉狀態

若位置在右半，將其鏡射到左半對應位置；同時因右半來自取反，必須切換一次翻轉狀態。

```typescript
while (currentLevel > 1) {
  // Step 2：逐層計算中心位置並處理「命中中心」的直接回傳

  if (currentPosition > middleIndex) {
    currentPosition = (middleIndex << 1) - currentPosition;
    shouldInvert = !shouldInvert;
  }

  // ...
}
```

### Step 4：完成本層處理後下降一層

不論位置原本在左半，或已從右半鏡射回左半，都可將層級下降一層，繼續縮小問題規模。

```typescript
while (currentLevel > 1) {
  // Step 2：逐層計算中心位置並處理「命中中心」的直接回傳

  // Step 3：若落在右半邊，鏡射回左半並切換翻轉狀態

  currentLevel--;
}
```

### Step 5：抵達基底層後，依翻轉狀態回傳答案

當到達 `S_1` 時，唯一位元固定為 `"0"`；若累積翻轉為真則回傳 `"1"`，否則回傳 `"0"`。

```typescript
return shouldInvert ? "1" : "0";
```

## 時間複雜度

- 迭代過程每次將層級減 1，最多執行 `n - 1` 次；
- 每輪僅進行常數次比較與更新操作。
- 總時間複雜度為 $O(n)$。

> $O(n)$

## 空間複雜度

- 僅使用固定數量的變數追蹤層級、位置與翻轉狀態；
- 未建立任何額外字串或陣列結構。
- 總空間複雜度為 $O(1)$。

> $O(1)$
