# 796. Rotate String

Given two strings `s` and `goal`, 
return true if and only if `s` can become `goal` after some number of shifts on `s`.

A shift on `s` consists of moving the leftmost character of `s` to the rightmost position.

For example, if `s = "abcde"`, then it will be `"bcdea"` after one shift.

**Constraints:**

- `1 <= s.length, goal.length <= 100`
- `s` and `goal` consist of lowercase English letters.

## 基礎思路

本題要求判斷字串 `s` 是否能透過若干次向左旋轉後變成字串 `goal`。每次旋轉將最左邊的字元移到最右端，等同於循環位移。

在思考解法時，可掌握以下核心觀察：

- **長度不同則旋轉必定不可能**：
  旋轉操作不改變字串長度，因此若兩字串長度不同，可立即排除。

- **旋轉的本質是子字串問題**：
  將 `s` 與自身拼接後，所得的雙倍字串包含了 `s` 所有可能的旋轉結果；只需判斷 `goal` 是否為該雙倍字串的子字串即可。

- **空字串為特例**：
  長度為 0 的字串在任何旋轉次數下都等於自身，需單獨處理以避免後續邏輯誤判。

- **子字串搜尋可藉助引擎優化**：
  原生字串搜尋通常由執行環境以高效演算法實作，相較於手動逐位比對，能更穩定地達到良好效能。

依據以上特性，可以採用以下策略：

- **優先以長度與空字串兩個條件快速過濾**，排除不可能的情形。
- **將 `s` 與自身拼接，再對其執行子字串搜尋**，以單次操作涵蓋所有旋轉結果的比對。

此策略將問題從「枚舉所有旋轉」轉化為「一次子字串搜尋」，邏輯簡潔且高效。

## 解題步驟

### Step 1：長度不同時直接回傳 false

旋轉不改變字串長度，因此若兩字串長度不相等，可立即判定無法透過旋轉達成，省去後續所有運算。

```typescript
// 長度不同代表旋轉不可能成立——O(1) 的提前排除
if (s.length !== goal.length) {
  return false;
}
```

### Step 2：空字串時直接回傳 true

長度為 0 的字串在任意次旋轉後仍為空字串，兩者必然相等，可直接回傳 `true`。

```typescript
// 空字串在旋轉意義下顯然相等
if (s.length === 0) {
  return true;
}
```

### Step 3：將 s 與自身拼接並判斷 goal 是否為其子字串

將 `s` 拼接到自身後，雙倍字串中包含了 `s` 所有可能的旋轉結果；
只需判斷 `goal` 是否出現在其中，即可一次涵蓋所有旋轉情形的比對。

```typescript
// s 與自身拼接後，所有旋轉結果都會以子字串形式出現其中
// 使用原生 includes 可借助 V8 優化的字串搜尋（通常為 Boyer-Moore-Horspool 變體）
return (s + s).includes(goal);
```

## 時間複雜度

- 字串長度為 $n$，拼接產生長度 $2n$ 的字串，耗時 $O(n)$；
- 子字串搜尋在長度 $2n$ 的字串中尋找長度 $n$ 的模式，耗時 $O(n)$；
- 總時間複雜度為 $O(n)$。

> $O(n)$

## 空間複雜度

- 拼接操作產生一個長度 $2n$ 的新字串；
- 除此之外無任何額外動態空間。
- 總空間複雜度為 $O(n)$。

> $O(n)$
