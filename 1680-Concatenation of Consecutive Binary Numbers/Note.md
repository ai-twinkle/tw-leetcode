# 1680. Concatenation of Consecutive Binary Numbers

Given an integer `n`, 
return the decimal value of the binary string formed by concatenating the binary representations of `1` to `n` in order, modulo `10^9 + 7`.

**Constraints:**

- `1 <= n <= 10^5`

## 基礎思路

本題要求將 `1` 到 `n` 的二進位表示依序串接成一個很長的二進位字串，並回傳其對應的十進位值，最後對 `10^9 + 7` 取模。由於串接後的長度會隨 `n` 快速成長，無法直接建立字串或以大整數保存，因此必須以「逐步累積」的方式在取模下完成數值更新。

在思考解法時，可掌握以下核心觀察：

* **二進位串接等價於左移再加上新數**：
  將某個二進位片段接到尾端，本質上是把目前結果左移「新片段的位元長度」，再加上新片段的數值。

* **每次需要的左移位數取決於當前數的位元長度**：
  從 `1` 到 `n` 的位元長度只會在遇到 `2` 的冪時增加，因此位元長度變化具有明確的分段性。

* **避免每步重新計算位元長度**：
  若每次都用位元操作判斷是否為 2 的冪，雖然仍是線性時間，但會引入額外常數成本；改以維護「下一個 2 的冪門檻」即可在需要時更新位元長度與左移倍率。

* **全程在模數下運算以防止溢位與控制數值大小**：
  每輪更新後立即取模，可確保中間結果不會無限制成長，同時符合題目輸出要求。

依據以上特性，可以採用以下策略：

* 逐一處理 `1..n`，每次把當前數以二進位形式「接到」結果尾端。
* 透過維護下一個 2 的冪門檻，僅在位元長度提升時更新左移倍率。
* 每次更新以「乘上左移倍率再加上當前值」完成串接，並立刻取模。

## 解題步驟

### Step 1：初始化模數與累積答案

先設定模數，並用一個累積值保存目前串接完成後的十進位結果，初始為 0。

```typescript
const modulo = 1000000007;

let answer = 0;
```

### Step 2：建立位元長度與左移倍率的追蹤狀態

為了在串接時快速完成「左移指定位數」，需要維護目前的位元長度，以及對應的左移倍率（也就是 `2^{位元長度}`）。同時維護下一個位元長度會增加的門檻值（下一個 2 的冪）。

```typescript
// 追蹤位元長度何時增加，使用下一個 2 的冪門檻來判斷。
// 這可以避免每輪用 (value & (value - 1)) 來檢查是否為 2 的冪。
let currentBitLength = 1;
let shiftMultiplier = 2; // 2^{currentBitLength}
let nextPowerOfTwo = 2;
```

### Step 3：逐一遍歷 1 到 n 以完成逐段串接

依序處理每個數，透過固定的迭代流程把每個二進位片段接到結果尾端。

```typescript
for (let value = 1; value <= n; value++) {
  if (value === nextPowerOfTwo) {
    currentBitLength++;
    shiftMultiplier = shiftMultiplier << 1;
    nextPowerOfTwo = nextPowerOfTwo << 1;
  }

  // ...
}
```

### Step 4：在遇到 2 的冪時更新位元長度與左移倍率

當前數等於下一個 2 的冪時，代表位元長度將增加 1；此時同步把左移倍率與下一個門檻更新到下一段區間的值。

```typescript
for (let value = 1; value <= n; value++) {
  if (value === nextPowerOfTwo) {
    currentBitLength++;
    shiftMultiplier = shiftMultiplier << 1;
    nextPowerOfTwo = nextPowerOfTwo << 1;
  }

  // ...
}
```

### Step 5：以左移再加值完成二進位串接並取模

把當前結果視為一段二進位前綴，要在尾端接上 `value` 的二進位表示，就等價於先左移 `currentBitLength` 位，再加上 `value`。以左移倍率取代實際位移，並在每輪後取模以控制數值大小。

```typescript
for (let value = 1; value <= n; value++) {
  // Step 4：在遇到 2 的冪時更新位元長度與左移倍率

  // 透過先左移當前答案，再加上 value，將 value 的二進位附加到尾端。
  answer = (answer * shiftMultiplier + value) % modulo;
}
```

### Step 6：回傳最終累積結果

迭代完成後，累積值即為串接後的十進位結果（已取模），直接回傳即可。

```typescript
return answer;
```

## 時間複雜度

- 需要遍歷 `1` 到 `n`，每個數只進行常數次更新與取模運算。
- 位元長度更新只在遇到 2 的冪時發生，總次數為 $O(\log n)$，不影響整體線性主項。
- 總時間複雜度為 $O(n)$。

> $O(n)$

## 空間複雜度

- 僅使用固定數量的整數變數維護答案、倍率與門檻。
- 不建立字串、不使用額外陣列或動態結構。
- 總空間複雜度為 $O(1)$。

> $O(1)$
