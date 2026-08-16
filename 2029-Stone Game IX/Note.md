# 2029. Stone Game IX

Alice and Bob continue their games with stones. 
There is a row of `n` stones, and each stone has an associated value. 
You are given an integer array `stones`, where `stones[i]` is the value of the ith stone.

Alice and Bob take turns, with Alice starting first. 
On each turn, the player may remove any stone from `stones`. 
The player who removes a stone loses if the sum of the values of all removed stones is divisible by `3`. 
Bob will win automatically if there are no remaining stones (even if it is Alice's turn).

Assuming both players play optimally, return `true` if Alice wins and `false` if Bob wins.

**Constraints:**

- `1 <= stones.length <= 10^5`
- `1 <= stones[i] <= 10^4`

## 基礎思路

本題是一個雙人最佳策略的博弈問題：兩人輪流取走石頭，一旦取走後「已移除石頭的總值」被 3 整除，則該次取石的人立即落敗；
此外，若石頭被取光而仍未出現落敗情況，則判定由後手獲勝。
先手希望逼使對手踩中倍數，後手則反之。

在思考解法時，可掌握以下核心觀察：

- **只有除以 3 的餘數具有意義**：
  是否被 3 整除僅取決於累計和的餘數，因此每顆石頭的實際數值可完全捨棄，只保留其餘數類別（0、1、2）。

- **餘數為 0 的石頭只會「交換出手權」**：
  取走這類石頭不會改變累計和的餘數，等同於把回合讓給對方；
  因此重要的不是它們有幾顆，而是其數量的奇偶性，因為偶數顆會互相抵消、奇數顆則額外多換一次先後手。

- **餘數 1 與餘數 2 的取用順序被嚴格限制**：
  為了避免累計和落到 3 的倍數，合法的取用序列只能呈現固定的交替型態：以某一類別連續取兩次開場，之後就必須與另一類別交替出現。
  這代表整場遊戲的走向，實際上由兩種餘數的「數量對比」決定，而非取法的自由選擇。

- **勝負因此可化為純粹的計數判斷**：
  當交換出手權的次數為偶數時，先手必須同時擁有兩種餘數類別，才能開啟並維持合法序列；
  當交換次數為奇數時，先手等於多獲得一次緩衝，但這份緩衝只有在兩種餘數數量差距足夠懸殊時才有實際價值。

依據以上特性，可以採用以下策略：

- **一次掃描全部石頭，將其歸類為三種餘數並統計**，其中不影響餘數者只記錄奇偶性。
- **依照「交換出手權次數」的奇偶性分成兩種情境**，各自套用對應的勝負條件。
- **以純計數比較直接輸出結果**，完全不需模擬任何實際的取石過程。

此策略可在單次線性掃描內完成判斷，兼具簡潔與效率。

## 解題步驟

### Step 1：初始化統計所需的計數狀態

先取得石頭總數，並準備三項統計：不改變餘數者僅需記錄奇偶性，另外兩類餘數則各自累計實際數量。

```typescript
const stoneCount = stones.length;

// 餘數為零的石頭只會交換出手權，因此只需追蹤奇偶性。
let remainderZeroParity = 0;
let remainderOneCount = 0;
let remainderTwoCount = 0;
```

### Step 2：掃描所有石頭並依餘數分類統計

逐一走訪每顆石頭，計算其對 3 的餘數：餘 1 與餘 2 者分別累加對應計數，餘 0 者則以互斥或翻轉奇偶標記，完成整體的餘數分佈統計。

```typescript
for (let index = 0; index < stoneCount; index += 1) {
  const remainder = stones[index] % 3;

  if (remainder === 1) {
    remainderOneCount += 1;
  } else if (remainder === 2) {
    remainderTwoCount += 1;
  } else {
    remainderZeroParity ^= 1;
  }
}
```

### Step 3：處理交換次數為偶數的情境

當不改變餘數的石頭數量為偶數時，出手順序不會被額外翻轉，先手必須同時具備兩種餘數類別才能建立並延續合法序列，否則必敗。

```typescript
// 餘數為零的石頭數量為偶數：Alice 需要同時擁有兩種餘數類別。
if (remainderZeroParity === 0) {
  return remainderOneCount > 0 && remainderTwoCount > 0;
}
```

### Step 4：處理交換次數為奇數的情境並回傳結果

當數量為奇數時，先手多獲得一次額外的節奏調度，但唯有在兩種餘數的數量差距超過 2 時，這份優勢才足以轉化為勝利，故以兩者差值的絕對大小作為最終判斷。

```typescript
// 數量為奇數時 Alice 多獲得一次節奏，只有在數量差距懸殊時才有用。
const residueDifference = remainderOneCount - remainderTwoCount;

return residueDifference > 2 || residueDifference < -2;
```

## 時間複雜度

- 掃描所有石頭並分類統計需一次線性走訪，為 $O(n)$；
- 後續勝負判斷僅為常數次比較與運算，為 $O(1)$；
- 總時間複雜度為 $O(n)$。

> $O(n)$

## 空間複雜度

- 僅使用固定數量的計數與旗標變數；
- 未配置任何額外陣列或動態結構；
- 總空間複雜度為 $O(1)$。

> $O(1)$
