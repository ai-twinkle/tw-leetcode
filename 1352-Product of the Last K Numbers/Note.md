# 1352. Product of the Last K Numbers

Design an algorithm that accepts a stream of integers and retrieves the product of the last `k` integers of the stream.

Implement the `ProductOfNumbers` class:

- `ProductOfNumbers()` Initializes the object with an empty stream.
- `void add(int num)` Appends the integer `num` to the stream.
- `int getProduct(int k)` Returns the product of the last `k` numbers in the current list. 
   You can assume that the current list always has at least `k` numbers.

The test cases are generated so that, 
at any time, the product of any contiguous sequence of numbers will fit into a single 32-bit integer without overflowing.

---

## 基礎思路

我們可以利用一個陣列記錄從流開始到當前位置的連乘結果。
每次新增數字時，都將該數字與前一個累積結果相乘，並加入陣列中。
我們可以利用累積乘積陣列來快速計算最後 k 個數字的乘積。
假設累積乘積陣列最後一項為 $P[n]$，倒數第 k 項為 $P[n-k]$，則最後 k 個數字的乘積即為：  
  $$
  \text{結果} = \frac{P[n]}{P[n-k]}
  $$

> Tips:
> - 由於任何數乘以 0 都會變成 0，遇到 0 時，之前的累積結果就不再有用，因此可以直接重置累積陣列來減少記憶體使用。
> - 同時，若請求的 k 超過從上次 0 以後的數字個數，則結果必然包含 0，可直接返回 0。

---

### 圖示

**數字流：** `[2, 3, 0, 4, 5]`

```
初始狀態：       [1]
加入 2：        [1, 2]
加入 3：        [1, 2, 6]
加入 0：  --> 重置為 [1]  (因為遇到 0)
加入 4：        [1, 4]
加入 5：        [1, 4, 20]
```

**查詢最後 2 個數字的乘積（4 和 5）：**

```
最後一項： 20
倒數第2項： 4
結果： 20 / 4 = 5
```

**查詢最後 3 個數字的乘積（0, 4 和 5）：**

```
因查尋需求 k = 3，k >= 累積乘積陣列長度，直接返回 0
```


## 解題步驟

### Step 1: 初始化累積乘積陣列

我們始終保持第一項為 1。防止訪問到前一個位置時出錯。

> Tips: 
> 這是累積陣列需要注意的地方，因為我們會訪問前一個位置，如果沒有第一位初始化會出錯。
> 另種方法是用是否為空來判斷，但這樣會增加判斷次數，用一格空間換取減少這個判斷。
> 如果是連加陣列初始化第一項為 0，連乘陣列初始化第一項為 1。

```typescript
class ProductOfNumbers {
  private products: number[] = [1];
    
  constructor() {}
}
```

### Step 2: 新增數字

每次新增數字時，將該數字與前一個累積結果相乘，並加入陣列中。

```typescript
class ProductOfNumbers {
  // ...

  add(num: number): void {
    if (num === 0) {
      // 當遇到 0 時，重置累積乘積陣列，因為任何包含 0 的乘積都是 0。
      this.products = [1];
    } else {
      // 新增數字時，將該數字與前一個累積結果相乘，並加入陣列中。
      const lastProduct = this.products[this.products.length - 1];
      this.products.push(lastProduct * num);
    }
  }
}
```

### Step 3: 查詢最後 k 個數字的乘積

若請求的 k 超過從上次 0 以後的數字個數，則結果必然包含 0，可直接返回 0。

```typescript
class ProductOfNumbers {
  // ...

  getProduct(k: number): number {
    // 若請求的 k 超過從上次 0 以後的數字個數，則結果必然包含 0，可直接返回 0。
    // 註: 由於陣列始終都會保有第一項為 1，因此當陣列長度等於 k 時，也是超過的情況 
    //     因為實際有效訪問是 this.products.length - 1。
    if (k >= this.products.length) {
      return 0;
    }
    const n = this.products.length;
    // 最後 k 個數字的乘積即為： P[n] / P[n-k]
    return this.products[n - 1] / this.products[n - 1 - k];
  }
}
```


## 時間複雜度
- 每次加入數字 (add) 為 O(1)
- 查詢最後 k 個數字的乘積 (getProduct) 為 O(1)
- 總體時間複雜度為 O(1)

> $O(1)$

## 空間複雜度
- 在最壞情況下（連續數字皆非 0），累積乘積陣列的長度會隨著加入數字的數量線性增長
- 空間複雜度為 $O(n)$

> $O(n)$
