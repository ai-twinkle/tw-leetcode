# 3612. Process String with Special Operations I

You are given a string `s` consisting of lowercase English letters and the special characters: `*`, `#,` and `%`.

Build a new string `result` by processing `s` according to the following rules from left to right:

- If the letter is a lowercase English letter append it to `result`.
- A `'*'` removes the last character from `result`, if it exists.
- A `'#'` duplicates the current `result` and appends it to itself.
- A `'%'` reverses the current `result`.

Return the final string `result` after processing all characters in `s`.

**Constraints:**

- `1 <= s.length <= 20`
- `s` consists of only lowercase English letters and special characters `*`, `#`, and `%`.

## 基礎思路

本題要求依序處理一個由小寫字母與特殊符號 `*`、`#`、`%` 組成的指令字串 `s`，並維護一個結果字串 `result`。每個指令會以不同方式更新 `result`：字母附加、`*` 刪除尾端字元、`#` 複製整串並串接、`%` 反轉整串。

在思考解法時，可掌握以下核心觀察：

- **反轉操作具有可疊加性**：
  兩個連續的 `%` 等同於沒有反轉，因此可以用一個布林旗標表示「目前的方向」，連續反轉可以自動互相抵消，不必每次都實際翻轉字串。

- **延後反轉能避免在已被放大的字串上反轉**：
  反轉理應作用在尚未被 `#` 倍增的較短字串上；因此在 `#` 之前必須先把延後的反轉實際落實，這樣反轉永遠作用在較短的字串上，將反轉成本維持在可控範圍內。

- **方向旗標會影響附加與刪除的物理位置**：
  若目前處於反轉狀態，邏輯上的「尾端」其實是字串的物理「前端」，因此 `*` 與字母附加都必須依旗標決定要從哪一端動作。

- **遍歷結束時需統一收尾**：
  若旗標仍處於反轉狀態，需在最後實際反轉一次，使最終回傳的字串方向正確。

依據以上特性，可採用以下策略：

- 維護一個方向旗標表示當前是否處於延後反轉狀態。
- `*` 與字母附加皆依旗標方向，分別作用於物理前端或物理尾端。
- 遇到 `#` 時先落實反轉，再進行字串倍增。
- 遇到 `%` 時僅切換旗標。
- 整個遍歷結束後，若旗標仍為反轉狀態，再做一次反轉並回傳結果。

此策略確保每次反轉都作用在尚未被 `#` 倍增的字串上，避免重複反轉與放大字串所帶來的高昂成本。

## 解題步驟

### Step 1：建立反轉字串的輔助函式

設計一個獨立的輔助函式，從末端往前逐字累積以得到反轉結果。將其定義於主函式之外，可避免每次呼叫都重新配置閉包。

```typescript
/**
 * 透過從末端往前累積字元的方式反轉字串。
 * 定義於 processStr 之外，避免每次呼叫都重新配置閉包。
 *
 * @param value - 要反轉的字串。
 * @returns 反轉後的字串。
 */
function reverseString(value: string): string {
  let reversed = "";
  for (let index = value.length - 1; index >= 0; --index) {
    reversed += value[index];
  }
  return reversed;
}
```

### Step 2：初始化結果字串與反轉旗標

以空字串開始累積結果，並用 `isReversed` 旗標表示目前是否處於延後反轉狀態。

```typescript
let result = "";
let isReversed = false;
```

### Step 3：開始遍歷指令字串並處理 `*` 刪除指令

逐字元讀取指令字串。當前字元為 `*` 時，需依目前方向旗標決定從哪一端切除：反轉狀態下邏輯上的尾端是物理前端，反之則為物理尾端；若結果為空則無須動作。

```typescript
for (let index = 0; index < s.length; ++index) {
  const character = s[index];
  if (character === "*") {
    // 從正確的物理端移除邏輯上的最後一個字元
    if (result.length > 0) {
      if (isReversed) {
        result = result.slice(1);
      } else {
        result = result.slice(0, -1);
      }
    }
  }

  // ...
}
```

### Step 4：處理 `#` 複製指令

當前字元為 `#` 時，必須先把延後的反轉實際套用一次，使倍增的對象是已對應正確方向的字串；接著再透過拼接達成倍增。如此可確保反轉永遠作用在尚未被放大的較短字串上。

```typescript
for (let index = 0; index < s.length; ++index) {
  const character = s[index];
  if (character === "*") {
    // Step 3：處理 '*' 刪除指令
  } else if (character === "#") {
    // 先將待執行的反轉實際套用，使倍增的對象是已對應正確方向的字串
    if (isReversed) {
      result = reverseString(result);
      isReversed = false;
    }
    // 使用原生字串拼接；V8 會以 rope 結構維持 O(1)，直到實際物化（materialize）為止
    result = result + result;
  }

  // ...
}
```

### Step 5：處理 `%` 反轉指令

當前字元為 `%` 時，不立刻反轉字串，而是僅切換 `isReversed` 旗標。這樣連續的 `%` 可以自動抵消，且實際反轉的觸發時機被延後到「必要時」才執行。

```typescript
for (let index = 0; index < s.length; ++index) {
  const character = s[index];
  if (character === "*") {
    // Step 3：處理 '*' 刪除指令
  } else if (character === "#") {
    // Step 4：處理 '#' 複製指令
  } else if (character === "%") {
    // 延後反轉：僅切換方向旗標
    isReversed = !isReversed;
  }

  // ...
}
```

### Step 6：處理小寫字母的附加

當前字元為一般小寫字母時，需附加到結果的邏輯尾端。同樣依旗標方向判斷：反轉狀態下邏輯尾端為物理前端，反之為物理尾端。

```typescript
for (let index = 0; index < s.length; ++index) {
  const character = s[index];
  if (character === "*") {
    // Step 3：處理 '*' 刪除指令
  } else if (character === "#") {
    // Step 4：處理 '#' 複製指令
  } else if (character === "%") {
    // Step 5：處理 '%' 反轉指令
  } else {
    // 將字母附加到目前邏輯上的尾端
    if (isReversed) {
      result = character + result;
    } else {
      result = result + character;
    }
  }
}
```

### Step 7：套用最後的延後反轉並回傳結果

遍歷結束後，若旗標仍處於反轉狀態，代表還有一次延後的反轉尚未落實；此時實際反轉一次，再回傳最終結果。

```typescript
// 收尾時將任何延後的反轉恰好套用一次
if (isReversed) {
  result = reverseString(result);
}
return result;
```

## 時間複雜度

- 設 `n` 為指令字串 `s` 的長度，`L` 為處理過程中結果字串可能達到的最大長度（最壞情況下因 `#` 倍增可達 $O(2^n)$）。
- 每個指令字元最多觸發一次與當前結果等長的字串操作（切片、拼接、附加）。
- 反轉透過旗標延後執行，因此實際反轉次數不超過 `#` 的出現次數再加最後一次收尾，總反轉成本受 `O(n \cdot L)` 上界控制。
- 總時間複雜度為 $O(n \cdot L)$。

> $O(n \cdot L)$

## 空間複雜度

- 結果字串本身佔用 $O(L)$ 的空間。
- `reverseString` 在反轉時會建立等長的新字串，亦為 $O(L)$。
- 總空間複雜度為 $O(L)$。

> $O(L)$
