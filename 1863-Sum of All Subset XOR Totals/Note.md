# 1863. Sum of All Subset XOR Totals

The XOR total of an array is defined as the bitwise `XOR` of all its elements, or `0` if the array is empty.

- For example, the XOR total of the array `[2,5,6]` is `2 XOR 5 XOR 6 = 1`.

Given an array `nums`, return the sum of all XOR totals for every subset of `nums`.

Note: Subsets with the same elements should be counted multiple times.

An array `a` is a subset of an array `b` if `a` can be obtained from `b` by deleting some (possibly zero) elements of `b`.

## 基礎思路

題目要求計算一個陣列所有子集的 XOR 總和。
若直接枚舉每個子集並計算 XOR，會因為子集數量呈指數成長而超時。
因此，我們需要藉由 XOR 的位元運算特性，透過數學觀察，來簡化計算過程。

我們考慮 XOR 運算的逐位元特性：
- 若陣列中有任一元素在某個位元（bit）上是 `1`，則該位元在所有子集 XOR 中的貢獻必然固定且一致。
- 更精確地，每個位元若至少出現一次 `1`，該位元將在所有子集中剛好出現一半的次數，即 $2^{n-1}$ 次（$n$ 是陣列元素數量）。

因此，整體 XOR 總和可藉由先將所有元素進行位元「或」運算（bitwise OR），再乘上每個位元固定出現次數 $2^{n-1}$ 即可得到答案。

### 數學證明

#### 定義

設給定陣列為 $nums = [a_1, a_2, \dots, a_n]$，總共有 $n$ 個元素。我們要求的是：

$$
\text{Total XOR Sum} = \sum_{subset \subseteq nums} XOR(subset)
$$

#### Step 1：拆解位元獨立性

由於 XOR 是逐位元獨立計算，我們可以先拆解總和為各個位元的貢獻總和：

設第 $k$ 位元在子集中的 XOR 結果為 $XOR_k(subset)$，則有：

$$
\text{Total XOR Sum} = \sum_{k=0}^{31}\left(\sum_{subset \subseteq nums} XOR_k(subset)\right) \times 2^k
$$

#### Step 2：計算單一位元貢獻

針對第 $k$ 位元：

- 若 $nums$ 中所有元素在第 $k$ 位元皆為 $0$，則該位元在所有子集的 XOR 結果為 $0$，無貢獻。
- 若第 $k$ 位元在 $nums$ 中至少出現一次 $1$，則考慮所有子集時：
    - 我們將陣列分為兩部分：第 $k$ 位元為 $1$ 的元素集合 $A$ 和第 $k$ 位元為 $0$ 的集合 $B$。
    - 若子集中選取 $A$ 中奇數個元素，第 $k$ 位元 XOR 為 $1$；若選取偶數個元素，第 $k$ 位元 XOR 為 $0$。
    - 對於集合 $A$ 的任意取法，奇偶數量的子集剛好各佔一半（由二項式展開係數可知），故 XOR 結果為 $1$ 的子集數量即為所有子集的一半，共有：

$$
\frac{2^n}{2} = 2^{n-1}
$$

#### Step 3：總和推導

綜合上述推論，第 $k$ 位元的總貢獻為：

- 若未出現過 $1$，則為 $0 \times 2^k = 0$；
- 若至少出現一次 $1$，則為 $2^{n-1} \times 2^k$。

因此，將所有位元貢獻合併起來後，即為：

$$
\text{Total XOR Sum} = (a_1 \mid a_2 \mid \dots \mid a_n) \times 2^{n-1}
$$

其中，$\mid$ 表示位元 OR 運算。

## 解題步驟

### Step 1：處理邊界條件

首先，我們需要取得輸入陣列的長度 `arrayLength`。若陣列為空（長度為 0），則根據題目定義，空集合的 XOR 總和為 0，直接返回 0。

```typescript
const arrayLength: number = arrayOfNumbers.length;

if (arrayLength === 0) {
    return 0;
}
```

### Step 2：計算所有數字的位元或運算結果

接著，我們初始化一個變數 `bitwiseOrAggregate` 為 0，用來儲存所有數字的位元「或」運算結果。遍歷 `arrayOfNumbers` 陣列，對每個元素進行 OR 運算，將所有出現過的 1 位元合併進來。

```typescript
let bitwiseOrAggregate: number = 0;
for (const currentNumber of arrayOfNumbers) {
    bitwiseOrAggregate |= currentNumber;
}
```

這裡，每當遇到一個數字時，利用 `|=` 運算符更新 `bitwiseOrAggregate`，使得最終結果包含了所有元素中出現的位元。

### Step 3：計算乘數並返回最終結果

根據前面的數學觀察，對於長度為 n 的陣列，每個位元會在 2^(n-1) 個子集中出現。因此，我們利用左移運算來計算乘數：

```typescript
// 2^(n - 1) can be computed by left shifting 1 by (arrayLength - 1)
const powerMultiplier: number = 1 << (arrayLength - 1);
```

最後，我們將所有數字的位元 OR 結果與乘數相乘，即可得到所有子集的 XOR 總和，並返回該結果。

```typescript
return bitwiseOrAggregate * powerMultiplier;
```

## 時間複雜度

- **遍歷陣列**：只需一次遍歷，複雜度為 $O(n)$。
- **位元運算與左移**：均為常數時間操作。
- 總時間複雜度為 $O(n)$。

> $O(n)$

## 空間複雜度

- 只使用了常數個變數（`bitwiseOrAggregate`、`powerMultiplier` 等），不依賴於輸入規模。
- 總空間複雜度為 $O(1)$。

> $O(1)$
