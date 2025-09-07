# 1304. Find N Unique Integers Sum up to Zero

Given an integer `n`, return any array containing `n` unique integers such that they add up to `0`.

**Constraints:**

- `1 <= n <= 1000`

## 基礎思路

本題希望產生一組總和為 0 的整數陣列，且所有元素互不相同、長度為指定的正整數 `n`。

觀察後可以發現：

- 若將一個數與其相反數成對加入陣列（例如 3 與 -3），其總和為 0。
- 所以只要建立 $\left\lfloor \frac{n}{2} \right\rfloor$ 對這樣的元素，即可保證部分和為 0。
- 如果 `n` 是奇數，剩下 1 個位置就補上 `0` 即可（`0` 不影響總和，同時是唯一的值，不與其他元素重複）。

因此我們可以用如下策略：

- 產生從 `1` 到 `n//2` 的正整數及其相反數。
- 若 `n` 為奇數，再額外補上 `0`。

這樣能確保陣列長度為 `n` 且總和為 `0`，且所有元素皆互不相同。

## 解題步驟

### Step 1: 初始化結果陣列

建立一個空的結果陣列，用來儲存最終答案。

- 宣告空陣列 `result`。

```typescript
let result: number[] = [];
```

### Step 2: 加入互為相反數的成對元素

利用 for 迴圈，從 `1` 一直推進到 `Math.floor(n / 2)`，將 `i` 與 `-i` 同時加入陣列中。

- 每次加入一對：正數與對應的負數
- 加入總共 $\left\lfloor \frac{n}{2} \right\rfloor$ 對

```typescript
for (let i = 1; i <= Math.floor(n / 2); i++) {
  result.push(i, -i);
}
```

### Step 3: 若 `n` 為奇數，額外補上 0

檢查 `n` 是否為奇數，若是，則將 `0` 加入陣列中（不影響總和，且保證唯一性）。

- 只在 `n % 2 !== 0` 時加入 `0`

```typescript
if (n % 2 !== 0) {
  result.push(0);
}
```

### Step 4: 回傳最終陣列

回傳我們組合出來的陣列。

```typescript
return result;
```

## 時間複雜度

- 產生 $\left\lfloor \frac{n}{2} \right\rfloor$ 對數值為 $O(n)$。
- 額外補上 `0` 亦為 $O(1)$。
- 總時間複雜度為 $O(n)$。

> $O(n)$

## 空間複雜度

- 使用了額外長度為 $n$ 的結果陣列。
- 總空間複雜度為 $O(n)$。

> $O(n)$
