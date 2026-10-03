# 32. Longest Valid Parentheses

Given a string containing just the characters `'('` and `')'`, 
return the length of the longest valid (well-formed) parentheses substring.

**Constraints:**

- `0 <= s.length <= 3 * 10^4`
- `s[i]` is `'('`, or `')'`.

## 基礎思路

本題要求在僅由左右括號組成的字串中，找出最長的合法（完全配對）括號子字串長度。
字串長度最大可達 $3 \times 10^4$，若枚舉所有子字串再逐一驗證，成本過高，因此需要單次掃描即可得出答案的策略。

在思考解法時，可掌握以下核心觀察：

- **配對具有「後進先出」的特性**：
  每個右括號只能與距離它最近、且尚未被配對的左括號相配，這正是堆疊結構所刻劃的關係。

- **答案本質是「區間長度」而非「配對數量」**：
  一段合法子字串必定是連續的，因此只要知道這段合法區間的左邊界前一格位置，就能用一次相減直接得到整段長度，不需逐段累加。

- **無法配對的右括號是天然的分界點**：
  一旦出現找不到左括號可配的右括號，它之前與之後的內容永遠無法連成同一段合法區間，故它可視為後續所有候選區間的起點屏障。

- **屏障可與未配對左括號共用同一結構**：
  配對完成後，剩餘在結構中最上層的元素，恰好代表目前這段合法區間所能延伸到的左界，無論該元素是未配對的左括號位置，或是最近一次的屏障位置。

依據以上特性，可以採用以下策略：

- **以一次由左至右的掃描處理整個字串**，遇左括號則記錄其位置待配，遇右括號則嘗試完成一次配對。
- **在結構底部預先放入一個屏障位置**，使得每次成功配對後都能以相減的方式一次量出整段合法區間長度。
- **遇到無法配對的右括號時更新屏障**，讓後續區間從它之後重新起算。

此策略僅需線性時間與一次配置，且全程不進行字串切割，效率穩定。

## 解題步驟

### Step 1：預先定義左括號的字元碼常數

先將左括號的字元碼定義為常數，後續比對時直接以數值比較，避免逐字元產生字串配置的開銷。

```typescript
// '(' 的字元碼 —— 以數值比較可避免逐字元的字串配置
const OPEN_PARENTHESIS_CODE = 40;
```

### Step 2：取得字串長度並處理過短的邊界情況

取得字串長度；若不足兩個字元，則不可能形成任何一組配對，直接回傳 0。

```typescript
const length = s.length;

// 少於兩個字元時永遠無法構成一組配對
if (length < 2) {
  return 0;
}
```

### Step 3：建立堆疊結構並設定初始屏障

使用型別化陣列作為堆疊：索引 0 保留給屏障位置，其上的槽位則存放尚未配對的左括號位置。同時初始化堆疊頂端指標與目前最佳答案，並將屏障初始設為 `-1`，代表候選區間可從字串最開頭起算。

```typescript
// Int32Array 堆疊：索引 0 存放屏障位置，其上的槽位存放 '(' 的位置
const unmatchedOpenIndices = new Int32Array(length + 1);
let stackTop = 0;
let longest = 0;

unmatchedOpenIndices[0] = -1;
```

### Step 4：逐字元掃描並記錄未配對的左括號

由左至右走訪每個字元；若當前字元為左括號，則將其位置推入堆疊，等待後續的右括號與之配對。

```typescript
for (let index = 0; index < length; index += 1) {
  if (s.charCodeAt(index) === OPEN_PARENTHESIS_CODE) {
    // 記住此 '(' 的位置，使後續的 ')' 能與之配對
    stackTop += 1;
    unmatchedOpenIndices[stackTop] = index;

    continue;
  }

  // ...
}
```

### Step 5：處理可成功配對的右括號並量測區間長度

若當前為右括號且堆疊中仍有可配對的元素，則彈出最近的一個左括號完成配對；此時堆疊頂端剩下的元素即為這段合法區間的左界前一格，以相減即可量出整段長度，並更新最佳答案。

```typescript
for (let index = 0; index < length; index += 1) {
  // Step 4：記錄未配對的 '(' 位置

  if (stackTop !== 0) {
    // 此 ')' 與最近的 '(' 完成配對，合法區段可延伸至其下方的屏障
    stackTop -= 1;

    const currentLength = index - unmatchedOpenIndices[stackTop];

    if (currentLength > longest) {
      longest = currentLength;
    }

    continue;
  }

  // ...
}
```

### Step 6：處理無法配對的右括號並更新屏障

若當前右括號找不到任何可配對的左括號，代表它切斷了合法區間的連續性，須將其位置設為新的屏障，讓之後的區間從它之後重新起算。

```typescript
for (let index = 0; index < length; index += 1) {
  // Step 4：記錄未配對的 '(' 位置

  // Step 5：處理成功配對並量測區間長度

  // 無法配對的 ')'：成為後續所有候選區間的新屏障
  unmatchedOpenIndices[0] = index;
}
```

### Step 7：回傳最長合法區間長度

掃描結束後，`longest` 已記錄過程中出現過的最大合法區間長度，直接回傳。

```typescript
return longest;
```

## 時間複雜度

- 僅以單一迴圈由左至右掃描字串一次，共 $n$ 次迭代；
- 每次迭代中的推入、彈出、比較與更新皆為常數時間操作；
- 總時間複雜度為 $O(n)$。

> $O(n)$

## 空間複雜度

- 配置一個長度為 $n + 1$ 的型別化陣列作為堆疊，最壞情況下（全為左括號）會被填滿；
- 其餘僅使用固定數量的純量變數；
- 總空間複雜度為 $O(n)$。

> $O(n)$
