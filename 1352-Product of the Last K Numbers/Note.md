# 1352. Product of the Last K Numbers

Design an algorithm that accepts a stream of integers and retrieves the product of the last `k` integers of the stream.

Implement the `ProductOfNumbers` class:

- `ProductOfNumbers()` Initializes the object with an empty stream.
- `void add(int num)` Appends the integer `num` to the stream.
- `int getProduct(int k)` Returns the product of the last `k` numbers in the current list. 
   You can assume that the current list always has at least `k` numbers.

The test cases are generated so that, 
at any time, the product of any contiguous sequence of numbers will fit into a single 32-bit integer without overflowing.

**Constraints:**

- `0 <= num <= 100`
- `1 <= k <= 4 * 10^4`
- At most `4 * 10^4` calls will be made to `add` and `getProduct`.
- The product of the stream at any point in time will fit in a 32-bit integer.

## 基礎思路

本題的核心目標是設計一個能夠高效維護數字流，並且在每次查詢時，**迅速取得最後 $k$ 個數字的乘積**。
若單純每次查詢都直接暴力相乘，遇到 $k$ 很大（甚至上萬）時，效率將無法接受。因此需要考慮適合的資料結構，讓每次查詢都能 $O(1)$ 時間完成。

為達成這目標，可以借用「前綴和」的想法，但換成乘積——也就是**累積乘積陣列**。
這個陣列每一格紀錄「從頭到目前為止的所有數字乘積」。這樣，每次要查詢最後 $k$ 個數字乘積時，只需用目前累積乘積去除掉「前面 $n-k$ 個數的累積乘積」，即可得到答案。

然而，實際上數字流中會出現 0。因為任何乘積中只要包含 0，整體就變成 0。因此，一旦遇到 0，**累積乘積就要重置**，過去的紀錄也失效。這時之後的查詢若跨度包含 0，也必須直接回傳 0。

因此，我們的設計需要考慮以下幾點：

1. **前綴乘積陣列**：讓每次區間乘積查詢化為一次除法，極速完成。
2. **0 的特殊處理**：遇到 0，累積紀錄需重置，避免錯誤答案，也能節省記憶體。
3. **查詢時判斷**：如果 $k$ 跨過 0，說明結果必為 0，可直接快速回應。

如此設計，不僅讓資料維護和查詢皆達到 $O(1)$ 時間，還能正確處理數字流中斷的情境。

### 圖示

**數字流：** `[2, 3, 0, 4, 5]`

```
初始狀態：           [1]
加入 2：            [1, 2]
加入 3：            [1, 2, 6]
加入 0：  --> 重置為 [1]  (因為遇到 0)
加入 4：            [1, 4]
加入 5：            [1, 4, 20]
```

**查詢最後 2 個數字的乘積（4 和 5）：**

- 最後一筆累積值： 20
- 在這次追加的兩個數字之前，清單上一步的累積值為 1（第一個哨兵值）：1
- 結果： 20 / 1 = 20

**查詢最後 3 個數字的乘積（0, 4 和 5）：**


- 由於我們的累積乘積清單目前只有長度 3（含開頭的 1），表示距離最後一次重置後，只加入了 2 個非零數字。
- 要取最後 3 個數字就必然「跨過」那個 0，因此結果直接是 0。
- 結果： 0


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
  
  // ...
}
```

### Step 2: 新增數字

每次新增數字時，將該數字與前一個累積結果相乘，並加入陣列中。

```typescript
class ProductOfNumbers {
  // Step 1: 初始化累積乘積陣列

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
  // Step 1: 初始化累積乘積陣列
  
  // Step 2: 新增數字

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

- 每次加入數字 (add) 為 $O(1)$。
- 查詢最後 k 個數字的乘積 (getProduct) 為 $O(1)$。
- 總時間複雜度為 $O(1)$。

> $O(1)$

## 空間複雜度

- 在最壞情況下（連續數字皆非 0），累積乘積陣列的長度會隨著加入數字的數量線性增長。
- 總空間複雜度為 $O(n)$。

> $O(n)$
