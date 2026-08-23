# 1927. Sum Game

Alice and Bob take turns playing a game, with Alice starting first.

You are given a string `num` of even length consisting of digits and '?' characters. 
On each turn, a player will do the following if there is still at least one `'?'` in `num`:

1. Choose an index `i` where `num[i] == '?'`.
2. Replace `num[i]` with any digit between `'0'` and `'9'`.

The game ends when there are no more `'?'` characters in `num`.

For Bob to win, the sum of the digits in the first half of `num` must be equal to the sum of the digits in the second half. 
For Alice to win, the sums must not be equal.

- For example, if the game ended with `num = "243801"`, then Bob wins because `2+4+3 = 8+0+1`. 
  If the game ended with `num = "243803"`, then Alice wins because `2+4+3 != 8+0+3`.

Assuming Alice and Bob play optimally, return `true` if Alice will win and `false` if Bob will win.

**Constraints:**

- `2 <= num.length <= 10^5`
- `num.length` is even.
- `num` consists of only digits and `'?'`.

## 基礎思路

本題是一個雙人輪流填數的博弈問題：字串長度為偶數，兩人交替把問號替換成任意數字，最終若前半段數字和等於後半段數字和則後手獲勝，否則先手獲勝。由於字串長度可達十萬，不可能模擬所有填法，必須直接推導勝負的判定條件。

在思考解法時，可掌握以下核心觀察：

- **勝負只取決於兩半的「和差」**：
  真正影響結果的並非各位數字本身，而是前半段總和與後半段總和之間的差值，因此整個問題可壓縮成單一個數值。

- **問號的總數決定誰擁有最後一手**：
  若問號總數為奇數，先手必定填下最後一個問號；此時無論局面如何，先手都能在最後一步微調一個位數，使兩半的和無法相等，故先手必勝。

- **問號成對時後手可採取鏡像策略**：
  當問號總數為偶數，後手可以針對先手的每一次填數做出對應的回應。若兩個問號分處不同半邊，後手可補上使兩者抵銷的數字；若兩個問號位於同一半邊，後手可讓這一對的和固定為九的倍數關係，因此後手能把每一對問號的貢獻鎖定為固定值。

- **雙方各自的最佳策略導出唯一平衡式**：
  在後手能配平的前提下，只有當「已知數字造成的和差」恰好被「問號數量差所能提供的固定補償」抵銷時，後手才守得住平局；只要不相等，先手就能先破壞這個唯一的平衡點。

依據以上特性，可以採用以下策略：

- **以單次掃描同時累計兩項資訊**：兩半對應位置的差值，以及兩半問號數量的差值。
- **先以問號數量差的奇偶性判斷是否為先手必勝**。
- **再把已知數字的和差與問號數量差代入平衡式**，若無法達成平衡，即判定先手獲勝。

此策略只需一次線性掃描與常數次算術判斷，即可在最大規模下穩定求解。

## 解題步驟

### Step 1：計算字串的半長

字串長度保證為偶數，先取得其一半長度，作為前後兩半配對的位移量。

```typescript
const half = num.length >> 1;
```

### Step 2：初始化兩項累計量

一項用來累計兩半對應位置的字元碼差值，另一項用來累計兩半問號數量的差值。由於前後兩半各有相同數量的字元，字元碼中的共同偏移量會在相減時互相抵銷。

```typescript
// 兩半配對後的原始字元碼差值；'0' 的偏移量會互相抵銷。
let rawCodeDifference = 0;
// 前半段的 '?' 數量減去後半段的 '?' 數量。
let questionDifference = 0;
```

### Step 3：單次走訪並同時累計兩項差值

只需掃描字串的一半，把位置 `index` 與位置 `index + half` 配成一對；每一輪同時累加字元碼的差值，並依據是否為問號更新問號數量差。

```typescript
// 只走訪字串的一半，將索引 i 與索引 i + half 配成一對。
for (let index = 0; index < half; index++) {
  const leftCode = num.charCodeAt(index);
  const rightCode = num.charCodeAt(index + half);

  rawCodeDifference += leftCode - rightCode;
  questionDifference += (leftCode === 63 ? 1 : 0) - (rightCode === 63 ? 1 : 0); // ASCII 碼 63 即為 '?'
}
```

### Step 4：以問號數量差的奇偶性判定先手必勝

問號數量差與問號總數的奇偶性一致；若為奇數，代表先手擁有最後一手，必能打破平衡，可直接判定先手獲勝。

```typescript
// 若 '?' 的數量為奇數，先手將擁有最後一手，必能打破平衡。
if ((questionDifference & 1) !== 0) {
  return true;
}
```

### Step 5：修正問號被計入字元碼所造成的偏差

前一步的累計把每個問號都當成字元碼 63 納入計算，而其真實貢獻應視為零，兩者相差固定的偏移量；此處依問號數量差一次扣除這份偏差，還原成純粹由已知數字造成的和差。

```typescript
// 每個 '?' 都以字元碼 63 計入，比其真實貢獻多了 15，因此在此扣除該偏差。
const digitDifference = rawCodeDifference - 15 * questionDifference;
```

### Step 6：代入平衡式並回傳勝負結果

後手能把每一對問號的總貢獻鎖定為固定值，因此唯有在已知數字的和差恰好抵銷這份固定補償時，後手才能守成平局；只要等式不成立，先手即獲勝。

```typescript
// 後手會將每一對 '?' 鏡像成總和為 9，因此當 2*diff + 9*qDiff == 0 時他恰好能守成平局。
return 2 * digitDifference + 9 * questionDifference !== 0;
```

## 時間複雜度

- 僅對字串的一半進行單次掃描，共 $n / 2$ 次迭代；
- 每次迭代與掃描後的判斷皆為常數時間運算。
- 總時間複雜度為 $O(n)$。

> $O(n)$

## 空間複雜度

- 僅使用固定數量的數值變數儲存累計結果；
- 未配置任何與輸入長度相關的額外結構。
- 總空間複雜度為 $O(1)$。

> $O(1)$
