# 1611. Minimum One Bit Operations to Make Integers Zero

Given an integer `n`, you must transform it into `0` using the following operations any number of times:

- Change the rightmost ($0^{th}$) bit in the binary representation of `n`.
- Change the $i^{th}$ bit in the binary representation of `n` if the $(i-1)^{th}$ bit is set to `1` and the $(i-2)^{th}$ through $0^{th}$ bits are set to `0`.

Return the minimum number of operations to transform `n` into `0`.

**Constraints:**

- `0 <= n <= 10^9`

## 基礎思路

本題要把整數 `n` 透過特定「翻轉位元」的規則，最少次數地變為 `0`。規則包含：可隨時翻轉最右邊（第 0 位）的位元；以及當低位（第 0 到第 i−2 位）全為 0 且第 i−1 位為 1 時，才允許翻轉第 i 位。這套限制恰好刻畫出一條**反射式格雷碼（Reflected Gray Code）**的路徑：

- 沿著這條路徑，相鄰狀態只相差 1 個位元；
- 從高位到低位的「能否翻轉」條件，保證了你只會在合法的格雷碼鄰居之間移動。

因此，**從 `n` 走到 `0` 的最少步數，就是 `n` 在這條格雷碼順序上的「距離 0 的步數」**。把「格雷碼索引 ↔ 二進位」的對應打開來看，最少步數等同於**把格雷碼值轉回普通二進位值**的結果。格雷碼轉二進位的高階策略是：

- 由高位往低位做**前綴 XOR**（每一位等於「前一位二進位」與「當前格雷碼位」的 XOR），最後得到的二進位數，即為答案；
- 用數學語言寫就是：`ans = n ⊕ (n >> 1) ⊕ (n >> 2) ⊕ …`，直到位元耗盡。

這樣即可在位數數量級的時間內求出最少操作次數，且不需額外空間。

## 解題步驟

### Step 1：主函數 `minimumOneBitOperations` — 逐位前綴 XOR 還原「距離」

以下以「前綴 XOR 消去法」將格雷碼值（由題目操作所對應）還原為二進位值，此值即為最短步數。

```typescript
function minimumOneBitOperations(n: number): number {
  // 累積前綴 XOR（等價於將格雷碼逐步還原為二進位）
  let operationCount = 0;

  // 逐步消耗位元：每次把當前 n 累加到答案，並右移一位繼續處理更高位的前綴
  while (n !== 0) {
    operationCount ^= n; // 將目前的前綴奇偶（XOR）合併到答案中
    n = n >>> 1;         // 無號右移以避免符號延展（確保高位補 0）
  }

  // 回傳最少操作次數（即格雷碼還原後的二進位值）
  return operationCount;
}
```

## 時間複雜度

- 令 **n** 為輸入數字的**位元長度**（binary length），每次迴圈右移 1 位，總共執行 **n** 次。
- 總時間複雜度為 $O(n)$。

> $O(n)$

## 空間複雜度

- 僅使用固定數量變數保存累積結果與位移後的值，額外空間為常數。
- 總空間複雜度為 $O(1)$。

> $O(1)$
