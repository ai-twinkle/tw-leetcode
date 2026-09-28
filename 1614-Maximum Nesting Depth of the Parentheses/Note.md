# 1614. Maximum Nesting Depth of the Parentheses

Given a valid parentheses string `s`, return the nesting depth of `s`. 
The nesting depth is the maximum number of nested parentheses.

**Constraints:**

- `1 <= s.length <= 100`
- `s` consists of digits 0-9 and characters `'+'`, `'-'`, `'*'`, `'/'`, `'('`, and `')'`.
- It is guaranteed that parentheses expression s is a VPS.

## 基礎思路

本題要求計算一個合法括號字串的最大巢狀深度。由於題目保證輸入必為合法的括號運算式，我們不需要額外驗證括號是否配對，只需專注於追蹤深度的變化。

在思考解法時，可掌握以下核心觀察：

- **深度是可累加的狀態量**：
  每遇到一個左括號，巢狀層級加一；每遇到一個右括號，巢狀層級減一。深度的變化只與括號有關，其餘的數字與運算符號完全不影響結果。

- **答案為過程中的極值而非終值**：
  合法括號字串在掃描結束時深度必定回到零，因此真正的答案是掃描過程中曾經達到的最大值，必須在每次層級上升時即時記錄。

- **掃描方向不影響結果**：
  由於括號成對出現且完全配對，從尾端往前掃描時，角色恰好對調——右括號代表進入一層、左括號代表離開一層，所得的最大深度與正向掃描完全相同。反向掃描可省去每輪與邊界值的比較，讓迴圈條件更精簡。

- **字元比對可用編碼取代**：
  直接比較字元的數值編碼，可避免建立中介的字串物件，使單次判斷維持在極低成本。

依據以上特性，可以採用以下策略：

- **以單一變數維護目前層級，另一變數保存歷史最大值**。
- **自尾端向前單次掃描整個字串**，將右括號視為層級上升、左括號視為層級下降，其餘字元一律略過。
- **僅在層級上升時更新最大值**，掃描結束後回傳該最大值。

此策略只需一次線性掃描與常數個變數，即可穩定求得答案。

## 解題步驟

### Step 1：初始化深度狀態與掃描起點

使用兩個變數分別保存目前所處的巢狀層級與歷史最大層級，並將掃描索引設為字串長度，作為反向走訪的起點。

```typescript
let currentDepth = 0;
let maximumDepth = 0;
let index = s.length;
```

### Step 2：自尾端反向走訪並取出當前字元編碼

利用索引遞減同時作為迴圈條件，當索引遞減至 0 時自然結束，藉此省去與長度上界的額外比較；每一輪先取出當前位置的字元編碼以供後續判斷。

```typescript
// 反向走訪可省去與迴圈上界的長度比較
while (index--) {
  const characterCode = s.charCodeAt(index);

  // ...
}
```

### Step 3：依括號種類調整層級並更新最大深度

反向掃描時角色對調：編碼 41 的右括號代表進入新的一層，需將層級加一並在超越紀錄時更新最大值；編碼 40 的左括號則代表離開該層，將層級減一。其餘字元皆不觸發任何分支，等同略過。

```typescript
while (index--) {
  // Step 2：取出當前字元編碼

  // ')' 的編碼為 41：反向掃描時，右括號代表開啟一層
  if (characterCode === 41) {
    currentDepth++;

    if (currentDepth > maximumDepth) {
      maximumDepth = currentDepth;
    }
  } else if (characterCode === 40) {
    // '(' 的編碼為 40：關閉由對應的 ')' 所開啟的那一層
    currentDepth--;
  }
}
```

### Step 4：回傳掃描過程中的最大深度

掃描結束後，`maximumDepth` 即為整個字串曾經到達的最深巢狀層級，直接回傳即可。

```typescript
return maximumDepth;
```

## 時間複雜度

- 對字串進行單次反向走訪，共處理 $n$ 個字元；
- 每個字元僅執行常數次的編碼比較與加減運算。
- 總時間複雜度為 $O(n)$。

> $O(n)$

## 空間複雜度

- 僅使用固定數量的整數變數維護層級與索引；
- 未建立任何額外陣列、堆疊或中介字串。
- 總空間複雜度為 $O(1)$。

> $O(1)$
