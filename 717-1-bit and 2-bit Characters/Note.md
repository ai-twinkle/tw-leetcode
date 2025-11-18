# 717. 1-bit and 2-bit Characters

We have two special characters:

- The first character can be represented by one bit `0`.
- The second character can be represented by two bits (`10` or `11`).

Given a binary array `bits` that ends with `0`, return `true` if the last character must be a one-bit character.

**Constraints:**

- `1 <= bits.length <= 1000`
- `bits[i]` is either `0` or `1`.

## 基礎思路

本題給定一串二進位編碼字串，其中：

- `0` 代表一個 **1-bit 字元**
- `10` 與 `11` 代表一個 **2-bit 字元**
- 題目保證 `bits` 的最後一位一定是 `0`

我們要判斷：「最後這個 `0` 是否**必然**是單獨構成一個 **1-bit 字元**？」

在理解整個編碼後可發現：

- 若一個 `0` 出現在中間，它可能是
    - 自己獨立成為 **1-bit 字元**
    - 或作為某個「2-bit 字元」的一部分（後面如果是 10 或 11 的開頭）
- 但題目最後一位一定是 `0`，因此要檢查它是否可能被前一個「2-bit 字元」吃掉。

關鍵觀察在於：

- 任何「2-bit 字元」的開頭必為 `1`
- 若最後一個 `0` 是 2-bit 字元的一部分，則它前面必須有一個 `1`
- 更一般化來說，需要數一數：**最後的這個 `0` 往前連續有多少個 `1`**

因為：

- 假設最後 `0` 前面連續有 `k` 個 `1`
- 若 `k` 為 **偶數**：這些 `1` 可以配對組成完整的 2-bit 字元，最後的 `0` 不會被吃掉 → 最後 `0` 必然為 1-bit 字元
- 若 `k` 為 **奇數**：前面的 `1` 會使「最後的 `0`」被迫成為 `10` 或 `11` 的第二個 bit → 最後 `0` 是 2-bit 字元的一部分

因此本題只需：

- **從倒數第二個位置開始，往左數連續的 1 的數量是否為偶數。**

## 解題步驟

### Step 1：初始化變數

先取得陣列長度，並從最後一個 `0` 的前一位開始往前掃描，同時準備計數器。

```typescript
const length = bits.length;

// 從最後一個 0 的前一位開始檢查
let index = length - 2;
let consecutiveOneCount = 0;
```

### Step 2：往左計數連續的 1

因為只有「緊鄰最後 `0` 左邊」的連續 `1` 會影響判斷，所以從倒數第二位開始往左數：

```typescript
// 計算緊鄰最後 0 前方的連續 1 的數量
while (index >= 0 && bits[index] === 1) {
  consecutiveOneCount += 1;
  index -= 1;
}
```

### Step 3：根據連續 1 的數量判斷最後字元類型

若連續 1 的數量為偶數，最後的 0 會單獨成為一個 1-bit 字元；
若為奇數，最後的 0 會被前面的 1「吃掉」，成為 2-bit 字元的一部分。

```typescript
// 若最後 0 前的連續 1 數量為偶數，
// 則最後的 0 不可能被視為兩位元字元的一部分，
// 因此必定是一個獨立的一位元字元。
return (consecutiveOneCount & 1) === 0;
```

## 時間複雜度

- 只需要從倒數第二位往左掃描至遇到第一個不是 `1` 的 bit。
- 在最壞情況下，需要掃描整個陣列一次。
- 總時間複雜度為 $O(n)$。

> $O(n)$

## 空間複雜度

- 僅使用常數個變數。
- 總空間複雜度為 $O(1)$。

> $O(1)$
