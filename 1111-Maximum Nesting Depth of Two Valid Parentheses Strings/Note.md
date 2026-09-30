# 1111. Maximum Nesting Depth of Two Valid Parentheses Strings

A string is a valid parentheses string (denoted VPS) 
if and only if it consists of `"("` and `")"` characters only, and:

- It is the empty string, or
- It can be written as `AB` (`A` concatenated with `B`), where `A` and `B` are VPS's, or
- It can be written as `(A)`, where `A` is a VPS.

We can similarly define the nesting depth `depth(S)` of any VPS `S` as follows:

- `depth("") = 0`
- `depth(A + B) = max(depth(A), depth(B))`, where `A` and `B` are VPS's
- `depth("(" + A + ")") = 1 + depth(A)`, where `A` is a VPS.

For example, `""`, `"()()"`, and `"()(()())"` are VPS's 
(with nesting depths 0, 1, and 2), and `")("` and `"(()"` are not VPS's.

Given a VPS seq, split it into two disjoint subsequences `A` and `B`, 
such that `A` and `B` are VPS's (and `A.length + B.length = seq.length`). 
The subsequences may not necessarily be contiguous.

For example, for the sequence `123456789`, one possible split is:

- `A = {1, 3, 5, 7, 9}`,
- `B = {2, 4, 6, 8}`.

This corresponds to the output `[0, 1, 0, 1, 0, 1, 0, 1, 0]`  
where 0 indicates membership in `A` and 1 indicates membership in `B`.

Now choose any such `A` and `B` such that `max(depth(A), depth(B))` is the minimum possible value.

Return an `answer` array (of length `seq.length`) 
that encodes such a choice of A and B:  `answer[i] = 0` if `seq[i]` is part of `A`, else `answer[i] = 1`.  
Note that even though multiple answers may exist, you may return any of them.

**Constraints:**

- `1 <= seq.size <= 10000`

## 基礎思路

本題給定一個合法括號字串，要求將其拆成兩個不相交的子序列，使兩者皆為合法括號字串，且兩者巢狀深度的最大值盡可能小。

在思考解法時，可掌握以下核心觀察：

- **答案的理論下界由原字串深度決定**：
  設原字串的最大巢狀深度為 $D$，任何拆分方式都無法讓兩邊的深度最大值低於 $D$ 的一半；因此若能構造出恰好達到此下界的分法，即為最佳解。

- **交錯分配深度即可達成下界**：
  若把「深度為奇數層」的括號歸入一組、「深度為偶數層」的括號歸入另一組，則每一組承接的層數恰好只有原本的一半，兩組的深度都被壓到約 $D$ 的一半，正好觸及理論下界。

- **分組後兩邊仍然合法**：
  同一層的左右括號必然被分到同一組，且組內各層的巢狀關係與原字串保持一致，因此拆出的兩個子序列各自仍是合法括號字串。

- **深度的奇偶性與位置的奇偶性同步**：
  合法括號字串中，每讀入一個字元，深度恰好變動一單位；因此掃描到第 $i$ 個字元之前的深度，其奇偶性必定與 $i$ 的奇偶性相同。這代表判斷某個括號位於奇數層或偶數層時，根本不需要真的維護一個深度計數器，只要看位置的奇偶性，再依該字元是左括號或右括號做一次修正即可。

- **左右括號的歸屬層數不同**：
  左括號屬於「它所開啟的那一層」，也就是進入它之後的深度；右括號則屬於「它所關閉的那一層」，也就是進入它之前的深度。兩者相差一個單位，需要在計算時分別處理。

依據以上特性，可以採用以下策略：

- **放棄顯式的深度堆疊或計數器**，改用位置的奇偶性直接推得當前所處層數的奇偶性。
- **依字元是左括號或右括號，對奇偶性補上對應的偏移量**，得到該括號真正所屬層的奇偶性。
- **以該奇偶性直接作為分組編號輸出**，一次線性掃描即可完成整個分配。

此策略能以單趟掃描、常數額外變數完成最佳拆分，無須任何輔助資料結構。

## 解題步驟

### Step 1：取得長度並配置結果容器

先取得輸入字串的長度，並依此長度預先配置存放分組結果的陣列，使後續掃描能以索引直接寫入。

```typescript
const sequenceLength = seq.length;
const groupAssignment: number[] = new Array(sequenceLength);
```

### Step 2：逐位以奇偶性推得所屬層並寫入分組

以單趟迴圈走訪每個字元：利用位置的奇偶性取得進入該字元前的深度奇偶性，再依該字元為左括號或右括號補上對應偏移，最後只保留最低位作為分組編號。左括號歸屬於它所開啟的那一層，右括號歸屬於它所關閉的那一層，兩者的偏移量恰好可由字元編碼的最低位一併表達。

```typescript
// 位置 i 之前的深度其奇偶性必定為 (i & 1)，因為合法括號字串每個字元恰好使深度變動一單位。
// '(' （編碼 40）計入 depth + 1 這一層，')' （編碼 41）計入 depth 這一層，而 charCode & 1 恰好編碼了此偏移量。
for (let position = 0; position < sequenceLength; position++) {
  groupAssignment[position] = (position ^ seq.charCodeAt(position) ^ 1) & 1;
}
```

### Step 3：回傳分組結果

掃描完成後，每個位置皆已標記其所屬組別，直接回傳即可。

```typescript
return groupAssignment;
```

## 時間複雜度

- 僅以單一迴圈走訪字串一次，共 $n$ 次迭代；
- 每次迭代只進行常數次位元運算與一次字元編碼查詢。
- 總時間複雜度為 $O(n)$。

> $O(n)$

## 空間複雜度

- 需要一個長度為 $n$ 的結果陣列作為輸出；
- 除此之外僅使用固定數量的變數，無任何堆疊或輔助結構。
- 總空間複雜度為 $O(n)$。

> $O(n)$
