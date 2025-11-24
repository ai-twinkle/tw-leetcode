# 1018. Binary Prefix Divisible By 5

You are given a binary array `nums` (0-indexed).

We define `x_i` as the number whose binary representation is the subarray `nums[0..i]` (from most-significant-bit to least-significant-bit).

- For example, if `nums = [1,0,1]`, then `x_0 = 1`, `x_1 = 2`, and `x_2 = 5`.

Return an array of booleans `answer` where `answer[i]` is `true` if `x_i` is divisible by `5`.

**Constraints:**

- `1 <= nums.length <= 10^5`
- `nums[i]` is either `0` or `1`.

## 基礎思路

本題給定一個二元陣列 `nums`，其前綴子陣列 `nums[0..i]` 代表一個從最高位到最低位的二進位整數 `x_i`。
我們需要判斷每個 `x_i` 是否能被 5 整除。

要注意的幾個重點：

- **輸入長度最大可達 10^5，無法將整個前綴轉成大整數再判斷**，因為數值會極度膨脹。
- **二進位左移相當於乘以 2**，因此可用逐步更新方式維護前綴值。
- **只需要前綴值 `mod 5`**：因為判斷是否可被 5 整除，只需知道餘數是否為 0。
- **模運算可維持在小範圍（0–4）**，避免 expensive 的 `%` 運算。
- 每次計算只需要：

    - 將前綴值左移（乘以 2）
    - 加上目前位元
    - 並維持在 `mod 5` 範圍

這樣可以線性時間完成所有前綴的可整除性判斷。

## 解題步驟

### Step 1：初始化結果陣列與前綴餘數狀態

建立用來存放結果的布林陣列，並準備 `prefixModulo` 來追蹤前綴值對 5 的餘數。

```typescript
const length = nums.length;
const result: boolean[] = new Array(length);

// 追蹤目前前綴值對 5 的餘數
let prefixModulo = 0;
```

### Step 2：主迴圈 — 依序處理每一個 bit

逐一讀取 `nums[index]` 作為目前位元，並依據二進位特性更新前綴餘數。

```typescript
for (let index = 0; index < length; index++) {
  const currentBit = nums[index];

  // ...
}
```

### Step 3：更新前綴值（透過位移與加法）

二進位前綴的更新方式為：
**前綴 × 2 + 當前 bit**
使用左位移以提升效率。

```typescript
for (let index = 0; index < length; index++) {
  // Step 2：主迴圈 — 依序處理每一個 bit

  // 更新前綴：左移一位（乘以 2）再加上目前位元
  prefixModulo = (prefixModulo << 1) + currentBit;

  // ...
}
```

### Step 4：維持前綴餘數於 0~4 範圍（避免 expensive 模運算）

若前綴餘數 ≥ 5，扣除 5 即等同於 `% 5`。

```typescript
for (let index = 0; index < length; index++) {
  // Step 2：主迴圈 — 依序處理每一個 bit

  // Step 3：更新前綴值（位移 + 加法）

  // 將 prefixModulo 維持在 [0, 4] 範圍，不使用 costly 的 % 運算
  if (prefixModulo >= 5) {
    prefixModulo -= 5;
  }

  // ...
}
```

### Step 5：紀錄當前前綴是否可被 5 整除

若當前餘數為 0，表示目前前綴值可被 5 整除。

```typescript
for (let index = 0; index < length; index++) {
  // Step 2：主迴圈 — 依序處理每一個 bit

  // Step 3：更新前綴值（位移 + 加法）

  // Step 4：維持前綴餘數於 0~4 範圍

  // 判斷前綴是否可被 5 整除
  result[index] = prefixModulo === 0;
}

return result;
```

## 時間複雜度

- 每個元素僅被處理一次，所有更新皆為常數時間。
- 總時間複雜度為 $O(n)$。

> $O(n)$

## 空間複雜度

- 需輸出長度為 n 的 `boolean[]`，其餘變數為常數額外空間。
- 總空間複雜度為 $O(n)$。

> $O(n)$
