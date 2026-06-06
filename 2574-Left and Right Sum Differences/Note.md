# 2574. Left and Right Sum Differences

You are given a 0-indexed integer array nums of size `n`.

Define two arrays `leftSum` and `rightSum` where:

- `leftSum[i]` is the sum of elements to the left of the index `i` in the array `nums`. 
  If there is no such element, `leftSum[i] = 0`.
- `rightSum[i]` is the sum of elements to the right of the index `i` in the array `nums`. 
  If there is no such element, `rightSum[i] = 0`.

Return an integer array answer of size `n` where `answer[i] = |leftSum[i] - rightSum[i]|`.

**Constraints:**

- `1 <= nums.length <= 1000`
- `1 <= nums[i] <= 10^5`

## 基礎思路

本題要求對每個位置 `i` 計算左側元素總和與右側元素總和的絕對差。直觀的作法是分別計算 `leftSum` 與 `rightSum` 兩個前綴和陣列，再逐位取絕對差，但這實際上重複表達了總和資訊，且需要額外維護一條輔助陣列。

在思考解法時，可掌握以下核心觀察：

- **總和恆等式可消去右側和**：
  對任意位置 `i` 皆成立 `leftSum + nums[i] + rightSum = totalSum`，因此 `rightSum` 完全能由總和扣除左側和與當前值得出，毋需另外維護。

- **可化為單一帶符號的線性式**：
  經代數簡化可得 `leftSum - rightSum = 2 * leftSum + nums[i] - totalSum`，只要先求出總和並動態維護左側累加和，即可在常數時間內取得帶符號差。

- **絕對值可用位元符號遮罩無分支實作**：
  在 32 位元有號整數運算下，將帶符號值算術右移 31 位即形成全 0 或全 1 的符號遮罩，再以 XOR 與減法即可取得絕對值，避免條件分支造成的分支預測成本。

基於以上特性，可採用以下策略：

- **第一次走訪累加總和**，作為後續推導右側和的依據。
- **第二次走訪維護動態 `leftSum`**，以代數恆等式直接得到帶符號差。
- **以位元符號遮罩無分支地取絕對值**，並寫入輸出陣列。

如此整體流程僅需兩次線性掃描即可完成，過程中除輸出緩衝區外不需任何輔助陣列。

## 解題步驟

### Step 1：取得長度並準備輸出緩衝區

先取得 `nums` 的長度，並建立一條固定大小的 `Int32Array` 作為結果儲存空間。由於 `n ≤ 1000` 且元素上限為 `10^5`，最大絕對差不會超過 `10^8`，仍在 32 位元有號整數範圍內，故可安全使用 `Int32Array`。

```typescript
const length = nums.length;
// Int32Array 已足夠：最大 |差值| <= 總和 <= 1000 * 1e5 = 1e8 < 2^31
const absoluteDifferences = new Int32Array(length);
```

### Step 2：第一次走訪累加總和

以一次線性掃描求出整個陣列的總和 `totalSum`，作為後續隱式推得右側和的關鍵依據。

```typescript
// 第一次走訪：累加總和，以隱式推得 rightSum
let totalSum = 0;
for (let index = 0; index < length; index++) {
  totalSum += nums[index];
}
```

### Step 3：初始化左側累積和

進入第二次走訪前，先建立動態維護的 `leftSum`，初始為 0，代表第 0 個位置的左側無任何元素。

```typescript
// 第二次走訪：維護動態 leftSum，並以 O(1) 計算 |leftSum - rightSum|
let leftSum = 0;
```

### Step 4：第二次走訪 — 取得當前值並以代數恆等式計算帶符號差

開始第二次走訪。每個位置先取出當前元素，再透過代數簡化得到 `leftSum - rightSum = 2 * leftSum + nums[i] - totalSum`，藉此一次性計算帶符號差，無須另外維護右側和。

```typescript
for (let index = 0; index < length; index++) {
  const currentValue = nums[index];
  // 代數簡化：leftSum - rightSum = 2*leftSum + nums[i] - totalSum
  const signedDifference = (leftSum << 1) + currentValue - totalSum;

  // ...
}
```

### Step 5：以位元符號遮罩取得無分支絕對值並寫入結果

將 `signedDifference` 算術右移 31 位得到符號遮罩：若原值為負則遮罩為 `-1`（全 1），否則為 `0`。接著利用 `(x ^ mask) - mask` 即可在無條件分支下取得絕對值，並寫入對應位置。

```typescript
for (let index = 0; index < length; index++) {
  // Step 4：取得當前值並以代數恆等式計算帶符號差

  // 利用 32 位元有號整數的符號位形成遮罩，無分支地取絕對值
  const signMask = signedDifference >> 31;
  absoluteDifferences[index] = (signedDifference ^ signMask) - signMask;

  // ...
}
```

### Step 6：更新左側累積和以供下一輪迭代

完成當前位置的計算後，將當前元素併入 `leftSum`，使其在下一輪迭代時正確代表新的左側區間總和。

```typescript
for (let index = 0; index < length; index++) {
  // Step 4：取得當前值並以代數恆等式計算帶符號差

  // Step 5：以位元符號遮罩取得無分支絕對值並寫入結果

  leftSum += currentValue;
}
```

### Step 7：回傳結果

走訪結束後，`absoluteDifferences` 已填入每個位置的答案，直接回傳即可。

```typescript
return absoluteDifferences as unknown as number[];
```

## 時間複雜度

- 第一次走訪累加總和需 $O(n)$；
- 第二次走訪每個位置均以代數簡化與位元運算在 $O(1)$ 完成；
- 總時間複雜度為 $O(n)$。

> $O(n)$

## 空間複雜度

- 輸出緩衝區 `absoluteDifferences` 需要 $O(n)$ 儲存結果；
- 其餘僅使用固定數量的純量變數，無任何額外輔助陣列；
- 總空間複雜度為 $O(n)$。

> $O(n)$
