# 921. Minimum Add to Make Parentheses Valid

A parentheses string is valid if and only if:

- It is the empty string,
- It can be written as `AB` (`A` concatenated with `B`), where `A` and `B` are valid strings, or
- It can be written as `(A)`, where `A` is a valid string.

You are given a parentheses string `s`. 
In one move, you can insert a parenthesis at any position of the string.

- For example, if `s = "()))"`, 
  you can insert an opening parenthesis to be `"(()))"` or a closing parenthesis to be `"())))"`.

Return the minimum number of moves required to make s valid.

**Constraints:**

- `1 <= s.length <= 1000`
- `s[i]` is either `'('` or `')'`.

## 基礎思路

本題要求計算最少需要插入多少個括號，才能讓給定的括號字串成為合法字串。合法性的定義具有遞迴結構，但在實作上無須真正建構結構，只需掌握「配對是否成立」這一本質。

在思考解法時，可掌握以下核心觀察：

- **合法性等價於前綴條件與總量條件**：
  一個括號字串合法，當且僅當任何前綴中右括號的數量都不超過左括號，且整串左右括號總數相等。

- **不匹配的右括號必須就地補救**：
  當掃描到某個位置時，若右括號已超出目前可配對的左括號數量，代表此右括號永遠找不到配對對象，必須在其前方插入一個左括號；補救之後，該缺口即被填平，不應影響後續判斷。

- **剩餘的左括號在結尾統一補救**：
  掃描結束後若仍有未配對的左括號，每一個都需在尾端補上一個右括號，數量即為剩餘的未配對量。

- **兩類缺口彼此獨立**：
  前綴過程中的右括號缺口與結尾的左括號剩餘，互不干擾，可分別累計後相加，即為最少插入次數。

依據以上特性，可以採用以下策略：

- **以單次線性掃描維護一個表示配對狀態的計數量**，遇左括號遞增、遇右括號遞減。
- **一旦計數量轉為負值，立即記錄一次插入並將其補回零**，代表就地補上一個左括號。
- **掃描結束後，將尚未配對的左括號數量加入總插入次數**，即為最終答案。

此策略僅需一次遍歷即可同時處理兩類缺口，正確且高效。

## 解題步驟

### Step 1：初始化長度與兩個累積計數

先取得字串長度，並準備兩個計數器：一個追蹤目前的括號配對狀態，另一個累計已需要的插入次數。

```typescript
const length = s.length;
let balance = 0;
let insertions = 0;
```

### Step 2：逐字元掃描並更新配對狀態

以單層迴圈走訪整個字串，利用字元碼直接換算增減量：`'('` 的碼為 40，`')'` 的碼為 41，代入 `81 - 2 * code` 後恰好得到 `+1` 與 `-1`，可免去分支比較。

```typescript
for (let index = 0; index < length; index++) {
  // '('（碼 40）得到 +1，')'（碼 41）得到 -1，無需任何比較
  balance += 81 - 2 * s.charCodeAt(index);

  // ...
}
```

### Step 3：以符號遮罩取出負值缺口

更新後若配對狀態為負，代表出現了無法配對的右括號。此處利用算術右移取得符號遮罩：負值時為全 1（即 `-1`），非負時為 0；與配對狀態做位元 AND 後，即可在負值時取得該缺口量，非負時取得 0。

```typescript
for (let index = 0; index < length; index++) {
  // Step 2：依字元碼更新配對狀態

  // 當 balance 為負時符號遮罩為 -1，否則為 0
  const negativeMask = balance >> 31;
  const deficit = balance & negativeMask;

  // ...
}
```

### Step 4：記錄插入並將缺口補回零

取得缺口後，將其計入插入次數，並從配對狀態中扣除，使其回復為零。由於缺口本身為負值或零，兩處皆以減法完成；當無缺口時，兩項皆不受影響。

```typescript
for (let index = 0; index < length; index++) {
  // Step 2：依字元碼更新配對狀態

  // Step 3：以符號遮罩取出負值缺口

  // 補上未匹配的 ')' 並將配對狀態重置回零
  insertions -= deficit;
  balance -= deficit;
}
```

### Step 5：補上結尾剩餘的左括號並回傳答案

掃描結束後，配對狀態中剩餘的數量即為未配對的左括號數，每一個都需補上一個右括號；將其與過程中累計的插入次數相加即為答案。

```typescript
// 剩餘的 '(' 各自需要一個右括號
return insertions + balance;
```

## 時間複雜度

- 僅對字串進行一次線性掃描，長度為 $n$；
- 每個字元的處理皆為常數時間的算術與位元運算。
- 總時間複雜度為 $O(n)$。

> $O(n)$

## 空間複雜度

- 僅使用固定數量的純量變數；
- 未配置任何額外陣列或動態結構。
- 總空間複雜度為 $O(1)$。

> $O(1)$
