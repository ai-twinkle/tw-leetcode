# 790. Domino and Tromino Tiling

You have two types of tiles: a `2 x 1` domino shape and a tromino shape. 
You may rotate these shapes.

Given an integer n, return the number of ways to tile an `2 x n` board. 
Since the answer may be very large, return it modulo `10^9 + 7`.

In a tiling, every square must be covered by a tile. 
Two tilings are different if and only if there are two 4-directionally adjacent cells on the board such 
that exactly one of the tilings has both squares occupied by a tile.

**Constraints:**

- `1 <= n <= 1000`

## 基礎思路

要解決本題，我們觀察到每次放置新磚塊時，只會影響棋盤最右側的少數幾列：

* **Domino 骨牌**：

    * 若直立放置，僅占用最右側的 $1$ 列。
    * 若橫向放置，會佔用最右側的 $2$ 列。

* **Tromino 骨牌（L 型）**：

    * 無論如何旋轉，都會跨越並占據最右側的 $2$ 到 $3$ 列。

因此，若要計算填滿至第 $i$ 列的方法數，僅需根據前面數列的狀態，即可推導出遞推式，進而以動態規劃（Dynamic Programming）高效求解。

### 數學推導

* **Domino**：直放佔 1 列，橫放佔 2 列
* **Tromino**：L 型佔 2～3 列

定義

$$
\text{dp}[i]=\text{覆蓋完整 }2\times i\text{ 棋盤的方案數}.
$$

1. **引入前綴和**
   設

   $$
   S_k \;=\;\sum_{j=0}^{k}\text{dp}[j].
   $$
2. **分類式（含 Tromino 累積效應）**
   詳細分類可得：

   $$
   \text{dp}[i]
   =\underbrace{\text{dp}[i-1]}_{\substack{\text{豎放}\\\text{domino}}}
   +\underbrace{\text{dp}[i-2]}_{\substack{\text{兩塊}\\\text{橫放 domino}}}
   +\underbrace{2\,S_{\,i-3}}_{\substack{\text{Tromino 填補}\\\text{累積不完整}}}.
   $$
3. **相鄰狀態類比**
   類似地，

   $$
   \text{dp}[i-1]
   =\text{dp}[i-2]+\text{dp}[i-3]+2\,S_{\,i-4}.
   $$
4. **相減消去累積和**

   $$
   \begin{aligned}
   \text{dp}[i]-\text{dp}[i-1]
   &=\bigl[\text{dp}[i-1]+\text{dp}[i-2]+2\,S_{i-3}\bigr]
   -\bigl[\text{dp}[i-2]+\text{dp}[i-3]+2\,S_{i-4}\bigr]\\
   &=\text{dp}[i-1]+\underbrace{2\bigl(S_{i-3}-S_{i-4}\bigr)}_{2\,\text{dp}[i-3]}
   \;-\;\text{dp}[i-3]\\
   &=\text{dp}[i-1]+\text{dp}[i-3].
   \end{aligned}
   $$
5. **重排得最終式**

   $$
   \text{dp}[i]
   =\text{dp}[i-1]+\bigl[\text{dp}[i-1]+\text{dp}[i-3]\bigr]
   =2\,\text{dp}[i-1]+\text{dp}[i-3].
   $$

由於數值可能會非常大，因此我們需要對每次計算的結果取模 $10^9 + 7$。

$$
dp[i]=\bigl(2\,dp[i-1]+\!dp[i-3]\bigr)\bmod(10^9+7)
$$

## 解題步驟

### Step 1：初始化資料結構

首先，定義模數常數與 DP 陣列：

```typescript
const MODULO_CONSTANT = 1_000_000_007;
const dp = new Int32Array(n + 1);
```

- `MODULO_CONSTANT`：題目要求結果取模的數值 $10^9 + 7$
- `dp` 陣列：儲存每個子問題的結果

### Step 2：設定初始條件

接著設定初始狀態：

```typescript
dp[0] = 1;  // 空棋盤，視為一種方案
dp[1] = 1;  // 一個豎放 domino
dp[2] = 2;  // 兩個豎放 domino 或兩個橫放 domino
```

* $dp[0]$：定義空棋盤有一種方式
* $dp[1]$：僅能豎放一個 domino，有一種方式
* $dp[2]$：可豎放兩個 domino 或橫放兩個 domino，兩種方式

### Step 3：動態規劃遞推計算

由遞推公式進行 DP 計算：

```typescript
for (let i = 3; i <= n; i++) {
  dp[i] = (2 * dp[i - 1] + dp[i - 3]) % MODULO_CONSTANT;
}
```

* `2 * dp[i - 1]`：整合了「一個豎放 domino」與「兩個橫放 domino」的情況。
* `dp[i - 3]`：補充了使用 L 形 tromino 導致的特殊狀態轉移。

### Step 4：返回答案

計算結束後，答案即為 $dp[n]$：

```typescript
return dp[n];
```

## 時間複雜度

- 主要運算為一個長度約為 $n$ 的迴圈，每次迭代皆為常數時間操作。
- 總時間複雜度為 $O(n)$。

> $O(n)$

## 空間複雜度

- 使用額外的動態規劃陣列 `dp`，大小為 $n + 1$。
- 總空間複雜度為 $O(n)$。

> $O(n)$
