# 1569. Number of Ways to Reorder Array to Get Same BST

Given an array `nums` that represents a permutation of integers from `1` to `n`. 
We are going to construct a binary search tree (BST) by inserting the elements of nums in order into an initially empty BST. 
Find the number of different ways to reorder `nums` 
so that the constructed BST is identical to that formed from the original array `nums`.

- For example, given `nums = [2,1,3]`, 
  we will have 2 as the root, 
  1 as a left child, and 3 as a right child. 
  The array `[2,3,1]` also yields the same BST but `[3,2,1]` yields a different BST.

Return the number of ways to reorder `nums` 
such that the BST formed is identical to the original BST formed from `nums`.

Since the answer may be very large, return it modulo `10^9 + 7`.

**Constraints:**

- `1 <= nums.length <= 1000`
- `1 <= nums[i] <= nums.length`
- All integers in `nums` are distinct.

## 基礎思路

本題要求計算有多少種排列方式，能夠在依序插入二元搜尋樹後，建構出與原陣列完全相同的樹，並扣除原始排列本身。
由於陣列長度最多可達 1000，合法排列數量極為龐大，因此必須以組合計數的方式求解，並對結果取模。

在思考解法時，可掌握以下核心觀察：

- **樹的結構只取決於「祖先先於子孫」的相對順序**：
  任一節點必須早於其整棵子樹內的所有節點被插入，而左右兩棵子樹之間的插入順序彼此獨立、互不干擾。

- **左右子樹的插入序列可以任意交錯**：
  固定左右子樹各自的合法順序後，將兩個序列交錯合併而不改變各自內部順序的方法數，正是二項式係數；整棵樹的總方法數即為每個節點的交錯方法數之乘積。

- **二元搜尋樹等價於以「值」為鍵、以「插入時間」為優先權的 treap**：
  由於輸入為 `1` 到 `n` 的排列，依值由小到大掃描即為中序走訪，因此可用單調堆疊在線性時間內重建整棵樹，避免逐一插入可能退化成平方時間。

- **子節點的插入時間必定晚於父節點**：
  依插入順序反向處理節點，就能保證處理某節點時，其子樹皆已處理完畢，形成天然的由下而上順序。

- **模運算下的大數乘法需避免精度損失**：
  兩個接近模數的值相乘會超出浮點數可精確表示的範圍，必須拆分因數分段計算；而組合數則可透過預先計算階乘與其模反元素，在常數時間內求得。

依據以上特性，可以採用以下策略：

- **預先計算階乘與階乘反元素表**，其中反元素僅對最大階乘使用費馬小定理求一次，再向下遞推其餘部分。
- **以單調堆疊依中序重建二元搜尋樹**，取得每個節點的左右子節點。
- **依反向插入順序由下而上計算子樹大小**，並對每個節點累乘左右子樹的交錯方法數。
- **最後扣除原始排列本身**，即為所求答案。

此策略將整體計算壓縮至線性時間，並確保所有模運算皆精確無誤。

## 解題步驟

### Step 1：定義模數與預計算表的長度上限

先定義題目要求的模數，以及依約束條件所需的階乘表長度。

```typescript
const MODULUS = 1000000007;
const MAXIMUM_LENGTH = 1001;
```

### Step 2：實作不損失精度的模乘法輔助函數

兩個接近 `10^9` 的數相乘會超出雙精度浮點數可精確表示的範圍。因此將左因數拆為高、低兩個 16 位元部分，分別與右因數相乘並取模後再組合，確保每一段部分乘積都能精確計算。

```typescript
/**
 * 在不損失雙精度浮點數精度的前提下，計算兩個小於模數之剩餘值的乘積。
 * @param left - 第一個因數，已對 MODULUS 取模。
 * @param right - 第二個因數，已對 MODULUS 取模。
 * @returns 乘積對 MODULUS 取模的結果。
 */
function multiplyModulo(left: number, right: number): number {
  // 將左因數拆為兩個 16 位元的部分，確保每個部分乘積都能精確表示。
  const highPart = Math.floor(left / 65536);
  const lowPart = left - highPart * 65536;

  return ((highPart * right % MODULUS) * 65536 + lowPart * right) % MODULUS;
}
```

### Step 3：預先計算階乘表

建立階乘表與階乘反元素表，並以遞推方式逐一計算 `0!` 至最大長度的階乘值。

```typescript
const FACTORIAL = new Int32Array(MAXIMUM_LENGTH);
const INVERSE_FACTORIAL = new Int32Array(MAXIMUM_LENGTH);

FACTORIAL[0] = 1;
for (let index = 1; index < MAXIMUM_LENGTH; index++) {
  FACTORIAL[index] = multiplyModulo(FACTORIAL[index - 1], index);
}
```

### Step 4：以快速冪求出最大階乘的模反元素

依費馬小定理，某數的 `p - 2` 次方即為其模 `p` 的反元素。此處只對最大的階乘做一次快速冪，以二進位逐位處理指數，求得其反元素並寫入表尾。

```typescript
// 僅以費馬小定理求最大階乘的反元素，之後再向下遞推。
let remainingExponent = MODULUS - 2;
let powerBase = FACTORIAL[MAXIMUM_LENGTH - 1];
let inverseAccumulator = 1;
while (remainingExponent > 0) {
  if ((remainingExponent & 1) === 1) {
    inverseAccumulator = multiplyModulo(inverseAccumulator, powerBase);
  }
  powerBase = multiplyModulo(powerBase, powerBase);
  remainingExponent = Math.floor(remainingExponent / 2);
}
INVERSE_FACTORIAL[MAXIMUM_LENGTH - 1] = inverseAccumulator;
```

### Step 5：由大至小遞推其餘階乘反元素

利用 `1 / (i - 1)! = i / i!` 的關係，從表尾往前逐一推得所有階乘反元素，免去重複執行快速冪。

```typescript
for (let index = MAXIMUM_LENGTH - 1; index > 0; index--) {
  INVERSE_FACTORIAL[index - 1] = multiplyModulo(INVERSE_FACTORIAL[index], index);
}
```

### Step 6：處理元素過少的邊界情況

進入主函數後先取得陣列長度。若僅有一或兩個元素，不存在其他能產生相同樹的插入順序，直接回傳 0。

```typescript
const length = nums.length;

// 一或兩個元素不存在其他插入順序。
if (length <= 2) {
  return 0;
}
```

### Step 7：記錄每個值的插入位置

以值為索引，記錄其在原陣列中的插入位置。此位置即為該值在 treap 視角下的優先權，數值越小代表越早插入、越接近根。

```typescript
// 插入位置即為每個值在 treap 中的優先權。
const insertionIndex = new Int32Array(length + 1);
for (let index = 0; index < length; index++) {
  insertionIndex[nums[index]] = index;
}
```

### Step 8：以單調堆疊依中序掃描，彈出較晚插入的節點

準備左右子節點陣列與代表「目前右脊」的單調堆疊，其中索引 `0` 作為空節點。由於 `1` 到 `n` 即為中序順序，依值遞增掃描。每遇到一個新值，就把堆疊頂端所有插入時間比它晚的節點彈出，最後一個被彈出的節點連同其子樹即成為新值的左子樹。

```typescript
const leftChild = new Int32Array(length + 1);
const rightChild = new Int32Array(length + 1);
const rightSpine = new Int32Array(length + 1);
let spineSize = 0;

// 數值 1..n 即為中序走訪順序，因此可用單調堆疊在 O(n) 內重建 BST。
for (let value = 1; value <= length; value++) {
  const priority = insertionIndex[value];
  let detachedSubtree = 0;

  // 彈出所有比此值更晚插入的節點；最後彈出者成為其左子節點。
  while (spineSize > 0 && insertionIndex[rightSpine[spineSize - 1]] > priority) {
    spineSize--;
    detachedSubtree = rightSpine[spineSize];
  }

  // ...
}
```

### Step 9：連接父子關係並將新值推入右脊

將剛才分離出的子樹接為新值的左子節點。若堆疊中仍有節點，則新值成為堆疊頂端節點的右子節點。最後將新值推入右脊堆疊。

```typescript
for (let value = 1; value <= length; value++) {
  // Step 8：彈出較晚插入的節點並取得分離的子樹

  leftChild[value] = detachedSubtree;
  if (spineSize > 0) {
    rightChild[rightSpine[spineSize - 1]] = value;
  }

  rightSpine[spineSize++] = value;
}
```

### Step 10：依反向插入順序由下而上計算子樹大小

建立子樹大小陣列與累乘結果。由於子節點的插入時間必定晚於父節點，從原陣列尾端往前處理時，每個節點的左右子樹大小皆已求得。空節點的大小為 0，因此可直接取用。

```typescript
const subtreeSize = new Int32Array(length + 1);
let ways = 1;

// 子節點的插入索引必定較大，因此依反向插入順序即為合法的由下而上掃描。
for (let index = length - 1; index >= 0; index--) {
  const value = nums[index];
  const leftSize = subtreeSize[leftChild[value]];
  const rightSize = subtreeSize[rightChild[value]];
  const childTotal = leftSize + rightSize;
  subtreeSize[value] = childTotal + 1;

  // ...
}
```

### Step 11：累乘左右子樹插入序列的交錯方法數

左右子樹的插入序列可任意交錯，方法數為組合數 `C(leftSize + rightSize, leftSize)`，可由階乘與階乘反元素表在常數時間內求得。當子樹節點總數不超過 1 時，交錯方法數必為 1，可略過計算。

```typescript
for (let index = length - 1; index >= 0; index--) {
  // Step 10：計算左右子樹大小並更新當前子樹大小

  // 交錯合併兩棵子樹的插入順序：共有 C(leftSize + rightSize, leftSize) 種選擇。
  if (childTotal > 1) {
    const interleavings = multiplyModulo(
      FACTORIAL[childTotal],
      multiplyModulo(INVERSE_FACTORIAL[leftSize], INVERSE_FACTORIAL[rightSize]),
    );
    ways = multiplyModulo(ways, interleavings);
  }
}
```

### Step 12：扣除原始排列後回傳結果

累乘結果包含原始排列本身，題目要求的是「其他」排列方式，因此扣除 1。先加上模數再取模，可避免結果為負。

```typescript
// 排除原始順序本身。
return (ways + MODULUS - 1) % MODULUS;
```

## 時間複雜度

- 預先計算階乘表需 $O(N)$，快速冪需 $O(\log p)$，其中 $N$ 為固定的表長、$p$ 為模數，兩者皆只執行一次，可視為常數。
- 記錄插入位置需一次線性掃描，為 $O(n)$。
- 單調堆疊中每個節點最多被推入與彈出各一次，重建樹為 $O(n)$。
- 由下而上的掃描對每個節點進行常數次模乘法，為 $O(n)$。
- 總時間複雜度為 $O(n)$。

> $O(n)$

## 空間複雜度

- 階乘與階乘反元素表大小固定，為常數空間。
- 插入位置、左右子節點、右脊堆疊與子樹大小陣列皆為 $O(n)$。
- 總空間複雜度為 $O(n)$。

> $O(n)$
