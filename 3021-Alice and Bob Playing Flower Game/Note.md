# 3021. Alice and Bob Playing Flower Game

Alice and Bob are playing a turn-based game on a field, with two lanes of flowers between them. 
There are `x` flowers in the first lane between Alice and Bob, and `y` flowers in the second lane between them.

The game proceeds as follows:

1. Alice takes the first turn.
2. In each turn, a player must choose either one of the lane and pick one flower from that side.
3. At the end of the turn, if there are no flowers left at all, the current player captures their opponent and wins the game.

Given two integers, `n` and `m`, the task is to compute the number of possible pairs `(x, y)` that satisfy the conditions:

- Alice must win the game according to the described rules.
- The number of flowers `x` in the first lane must be in the range `[1,n]`.
- The number of flowers `y` in the second lane must be in the range `[1,m]`.

Return the number of possible pairs `(x, y)` that satisfy the conditions mentioned in the statement.

**Constraints:**

- `1 <= n, m <= 10^5`

## 基礎思路

此遊戲每回合只能從其中一條花道摘 **一朵** 花，因此整局的總步數恰為 $x+y$。

- 若 $x+y$ 為 **奇數**，先手 Alice 將走最後一步並獲勝；
- 若 $x+y$ 為 **偶數**，則換後手 Bob 走最後一步。

因此，我們要計算在 $1 \le x \le n,; 1 \le y \le m$ 下，滿足 **$x+y$ 為奇數** 的配對數目。

令

- $o_n=\lceil n/2\rceil$ 為 $[1,n]$ 中奇數的個數，
- $e_n=\lfloor n/2\rfloor$ 為 $[1,n]$ 中偶數的個數；
- $o_m=\lceil m/2\rceil,; e_m=\lfloor m/2\rfloor$ 同理。

使得 $x+y$ 為奇數的配對來自兩種情況：

1. $x$ 奇、$y$ 偶：共有 $o_n \cdot e_m$ 種；
2. $x$ 偶、$y$ 奇：共有 $e_n \cdot o_m$ 種。

總數為

$$
o_n e_m + e_n o_m \;=\; \left\lceil \frac{n}{2}\right\rceil \left\lfloor \frac{m}{2}\right\rfloor \;+\; \left\lfloor \frac{n}{2}\right\rfloor \left\lceil \frac{m}{2}\right\rceil
\;=\; \left\lfloor \frac{nm}{2}\right\rfloor.
$$

因此答案等於 $\left\lfloor \dfrac{n m}{2} \right\rfloor$，可用一行計算完成。

## 解題步驟

### Step 1：使用推導出的公式計算結果

我們已經知道，Alice 會獲勝當且僅當 $x + y$ 為奇數，而這樣的配對數量等於 $\left\lfloor \dfrac{n \cdot m}{2} \right\rfloor$。
因此直接套用此公式計算並回傳答案：

```typescript
function flowerGame(n: number, m: number): number {
  return Math.floor(n * m / 2);
}
```

## 時間複雜度

- 僅常數次算術與一次向下取整，皆為 $O(1)$。
- 總時間複雜度為 $O(1)$。

> $O(1)$

## 空間複雜度

- 不使用額外資料結構，僅常數暫存。
- 總空間複雜度為 $O(1)$。

> $O(1)$
