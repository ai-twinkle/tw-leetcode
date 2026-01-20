# 3314. Construct the Minimum Bitwise Array I

You are given an array `nums` consisting of `n` prime integers.

You need to construct an array `ans` of length `n`, 
such that, for each index `i`, the bitwise OR of `ans[i]` and `ans[i] + 1` is equal to `nums[i]`, 
i.e. `ans[i] OR (ans[i] + 1) == nums[i]`.

Additionally, you must minimize each value of `ans[i]` in the resulting array.

If it is not possible to find such a value for `ans[i]` that satisfies the condition, then set `ans[i] = -1`.

**Constraints:**

- `1 <= nums.length <= 100`
- `2 <= nums[i] <= 1000`
- `nums[i] is a prime number.`

## 基礎思路

本題要為每個 `nums[i]`（質數）找到最小的 `ans[i]`，使得：

* `ans[i] OR (ans[i] + 1) == nums[i]`
* 若不存在則回傳 `-1`

在思考解法時，有幾個關鍵性質：

* **相鄰整數的位元關係**：`a` 與 `a + 1` 在二進位上，會把 `a` 的「最右側連續的 1」翻成 0，並把下一個 0 翻成 1，因此兩者的 OR 會呈現一種固定結構。
* **OR 結果一定是奇數**：因為 `a` 與 `a+1` 一奇一偶，最低位元（bit0）在 OR 後必為 1，所以 `a OR (a+1)` 必為奇數。
  這代表任何 **偶數** 的 `nums[i]` 都不可能被表示出來。
* **本題 `nums[i]` 是質數**：唯一的偶質數是 2，因此「不可行」只會在 `nums[i] = 2`（或更一般地說：任何偶數）發生。
* **最小化 ans 的策略**：當 `nums[i]` 為奇數時，我們要在所有可行的 `a` 中找最小值。核心想法是：
  OR 結果要剛好等於 `nums[i]`，代表某些位元必須被 `a` 與 `a+1` 的組合「補成 1」，而最能讓 `a` 變小的方式，是利用 `nums[i]` 中**最靠右的 0 位元**來形成 `a` 與 `a+1` 的切換點，藉此在保持 OR 不變的情況下降低 `a`。

透過這些位元性質，我們可以對每個 `nums[i]` 直接用常數時間求出最小 `ans[i]`，或判定不可能。

## 解題步驟

### Step 1：初始化長度並準備逐一處理

取得陣列長度，之後會原地更新 `nums` 作為答案回傳。

```typescript
const length = nums.length;
```

### Step 2：以單一最外層迴圈逐項處理每個 nums[i]

每個位置獨立求解：若不可行就設 `-1`，可行則計算最小答案。

```typescript
for (let index = 0; index < length; index++) {
  const value = nums[index];

  // ...
}
```

### Step 3：判斷偶數不可行（直接填 -1）

因為 `a OR (a + 1)` 必為奇數，所以若 `value` 為偶數，必定無解。

```typescript
for (let index = 0; index < length; index++) {
  // Step 2：以單一最外層迴圈逐項處理每個 nums[i]

  const value = nums[index];

  if ((value & 1) === 0) {
    // 偶數 x 無法由 a OR (a + 1) 形成
    nums[index] = -1;
  } else {
    // ...
  }
}
```

### Step 4：對奇數 value 計算最小 ans[i]

對於奇數 `value`，利用其「最低位的 0」來構造最小解：
先找出 `value` 的最低位 0 所對應的 bit（以遮罩表示），再用題目給定的公式得到最小 `ans[i]`。

```typescript
for (let index = 0; index < length; index++) {
  // Step 2：以單一最外層迴圈逐項處理每個 nums[i]

  const value = nums[index];

  if ((value & 1) === 0) {
    // Step 3：判斷偶數不可行（直接填 -1）
    nums[index] = -1;
  } else {
    // 找到 value 的最低位 0；答案為 value - (該位元 / 2)
    const lowestZeroBit = ((~value) & (value + 1)) >>> 0;
    nums[index] = value - (lowestZeroBit >>> 1);
  }
}
```

### Step 5：回傳結果陣列

完成原地更新後，直接回傳 `nums` 作為答案。

```typescript
return nums;
```

## 時間複雜度

- 單一 `for` 迴圈掃描 `n = nums.length` 個元素；
- 每個元素只做常數次位元運算與賦值。
- 總時間複雜度為 $O(n)$。

> $O(n)$

## 空間複雜度

- 僅使用固定數量的變數（`length`, `index`, `value`, `lowestZeroBit`）；
- 直接在輸入陣列 `nums` 上原地改寫，不配置與 `n` 成比例的額外結構。
- 總空間複雜度為 $O(1)$。

> $O(1)$
