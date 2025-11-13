# 3228. Maximum Number of Operations to Move Ones to the End

You are given a binary string `s`.

You can perform the following operation on the string any number of times:

- Choose any index i from the string where `i + 1 < s.length` such that `s[i] == '1'` and `s[i + 1] == '0'`.
- Move the character `s[i]` to the right until it reaches the end of the string or another `'1'`.
  For example, for `s = "010010"`, if we choose `i = 1`, the resulting string will be `s = "000110"`.

Return the maximum number of operations that you can perform.

**Constraints:**

- `1 <= s.length <= 10^5`
- `s[i]` is either `'0'` or `'1'`.

## 基礎思路

本題給定一個二進位字串 `s`，我們能進行的操作是：

- 找到一個位置 `i` 使得 `s[i] == '1'` 且 `s[i+1] == '0'`
- 然後把該 `'1'` 往右「滑動」到遇到下一個 `'1'` 或字串末端

每次操作都只能將某個 `'1'` 穿過一段連續的 `'0'`。為了找出**最多能做幾次操作**，關鍵在於觀察整體行為的「不可逆性」──一個 `'1'` 能夠穿過多少個 `'0'` 是完全由它**左邊累積的 `'1'` 數量**決定的。

在思考解法時，有幾個核心觀念：

- 字串會被切成多個「零區塊」（連續 `'0'`）。
- 每個零區塊若左邊有 `k` 個 `'1'`，則這個區塊會被這 `k` 個 `'1'` 各穿越一次，因此總共貢獻 `k` 次操作。
- 若零區塊左邊沒有 `'1'`，則該區塊永遠不會被穿越，不會產生任何操作。
- 我們只需線性走過一次字串，維持左邊 `'1'` 的數量，並遇到零區塊時累加答案。

因此，本題本質上是：

- 計算所有「左方至少有一個 `'1'` 的零區塊」的：
- `零區塊貢獻 = 該區塊左側的 '1' 的總數`

並不需要真的模擬移動行為，而是做一趟掃描即可求得最終答案。

## 解題步驟

### Step 1：初始化狀態變數

紀錄左側已出現的 `'1'` 數量、答案累積，以及掃描位置。

```typescript
const length = s.length;

let onesToLeft = 0;
let maxOperationCount = 0;
let index = 0;
```

### Step 2：開始線性掃描字串

我們使用 `while` 迴圈掃描整個字串 `s`，並根據當前字元是 `'1'` 或 `'0'` 來更新狀態：

- 遇到 `'1'` 就累積；
- 遇到 `'0'` 則判斷其是否能被左側 `'1'` 穿越，並略過整段零區塊。

```typescript
while (index < length) {
  const characterCode = s.charCodeAt(index);

  if (characterCode === 49) {
    // 當前字元為 '1' → 更新左側累積的 '1' 數量
    onesToLeft += 1;
    index += 1;
  } else {
    if (onesToLeft === 0) {
      // 此零區塊左側沒有任何 '1'，不會被穿越
      // 略過整段零區塊
      while (index < length && s.charCodeAt(index) === 48) {
        index += 1;
      }
    } else {
      // 此零區塊左側至少有一個 '1'
      // 每個左側的 '1' 都會穿越這段零區塊一次
      maxOperationCount += onesToLeft;

      // 略過整段零區塊
      while (index < length && s.charCodeAt(index) === 48) {
        index += 1;
      }
    }
  }
}
```

### Step 3：回傳累積的最大操作數

```typescript
return maxOperationCount;
```

## 時間複雜度

- 每個字元至多被掃描一次，包括零區塊的跳過行為，時間複雜度為 $O(n)$。
- 總時間複雜度為 $O(n)$。

> $O(n)$

## 空間複雜度

- 使用常數變數 `onesToLeft`、`index`、`maxOperationCount`。
- 總空間複雜度為 $O(1)$。

> $O(1)$
