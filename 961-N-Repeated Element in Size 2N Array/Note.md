# 961. N-Repeated Element in Size 2N Array

You are given an integer array nums with the following properties:

- `nums.length == 2 * n`.
- `nums` contains `n + 1` unique elements.
- Exactly one element of `nums` is repeated `n` times.
- Return the element that is repeated `n` times.

**Constraints:**

- `2 <= n <= 5000`
- `nums.length == 2 * n`
- `0 <= nums[i] <= 10^4`
- `nums` contains `n + 1` unique elements and one of them is repeated exactly `n` times.

## 基礎思路

本題給定長度為 `2n` 的陣列 `nums`，其中一共有 `n + 1` 個不同元素，並且**恰好有一個元素重複出現 `n` 次**。我們要找出這個重複 `n` 次的元素。

在思考解法時，可以抓住以下核心性質：

* **只要能快速判斷「是否看過某值」**，當我們再次遇到同一個值時，它必然就是答案（因為題目保證只有一個元素會大量重複）。
* 題目限制 `nums[i] <= 10^4`，值域很小，適合用**固定大小的標記表**來做 O(1) 查詢與更新。
* 因此我們只需要線性掃描陣列：
  每次讀到一個值 `x`：

    * 若之前看過 `x` → 直接回傳 `x`
    * 否則標記 `x` 已出現

這樣能以一次掃描完成，且一旦發現重複就能提前結束。

## 解題步驟

### Step 1：建立出現標記表

利用值域上限 `10000`，建立固定長度的 `Uint8Array` 作為「是否出現過」的標記表。

```typescript
const seenFlags = new Uint8Array(10001);
```

### Step 2：遍歷陣列並讀取目前值

用索引 `index` 逐一讀取 `nums[index]`，準備判斷是否已經出現過。

```typescript
for (let index = 0; index < nums.length; index++) {
  const value = nums[index];

  // ...
}
```

### Step 3：若已出現過則直接回傳答案，否則標記為已看過

在同一個最外層 `for` 迴圈中，先檢查 `seenFlags[value]`：

* 不為 0 代表之前看過 → 回傳 `value`
* 否則將其標記為 1

```typescript
for (let index = 0; index < nums.length; index++) {
  // Step 2：遍歷陣列並讀取目前值

  const value = nums[index];

  // 若此值之前已看過，直接回傳作為重複 n 次的元素
  if (seenFlags[value] !== 0) {
    return value;
  }

  // 標記此值已出現過一次
  seenFlags[value] = 1;
}
```

### Step 4：理論上不會走到這裡，回傳 -1 作為保底

題目保證一定存在重複 `n` 次的元素，因此正常情況不會觸發；這裡僅作為安全回傳。

```typescript
return -1;
```

## 時間複雜度

- 迴圈最多掃描 `nums.length = 2n` 個元素；
- 每次迭代只做常數次操作（讀取、查表、更新、比較）；
- 總時間複雜度為 $O(n)$。

> $O(n)$

## 空間複雜度

- 使用固定長度 `10001` 的 `Uint8Array` 作為標記表，與 `n` 無關；
- 其餘變數為常數個；
- 總空間複雜度為 $O(1)$。

> $O(1)$
