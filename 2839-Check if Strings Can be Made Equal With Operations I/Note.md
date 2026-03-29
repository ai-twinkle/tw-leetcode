# 2839. Check if Strings Can be Made Equal With Operations I

You are given two strings `s1` and `s2`, both of length `4`, consisting of lowercase English letters.

You can apply the following operation on any of the two strings any number of times:

- Choose any two indices `i` and `j` such that `j - i = 2`, then swap the two characters at those indices in the string.

Return `true` if you can make the strings `s1` and `s2` equal, and `false` otherwise.

**Constraints:**

- `s1.length == s2.length == 4`
- `s1` and `s2` consist only of lowercase English letters.

## 基礎思路

本題要求判斷兩個長度為 4 的字串，能否透過「交換距離為 2 的兩個字元」這個操作，使得兩字串相等。關鍵在於理解這個操作的本質，而非逐步模擬所有可能的交換序列。

在思考解法時，可掌握以下核心觀察：

- **操作只允許在距離為 2 的位置間交換**：
  對長度為 4 的字串而言，合法的交換對只有 `(0, 2)` 與 `(1, 3)` 兩組，因此偶數位置（索引 0、2）之間可以互換，奇數位置（索引 1、3）之間可以互換，但兩組之間永遠無法互通。

- **偶數組與奇數組完全獨立**：
  無論執行多少次操作，偶數位置的字元只會在 `{index 0, index 2}` 之間流動，奇數位置同理；兩組的可達狀態彼此互不影響。

- **每組只有兩種排列**：
  由於每組僅有兩個位置且操作等同於一次對換，每組最多只有「原始順序」與「交換後順序」兩種可能，因此只需針對每組分別比對這兩種情況即可。

依據以上特性，可以採用以下策略：

- **將字串拆分為偶數組與奇數組，分別獨立判斷是否相容**。
- **對每組，檢驗兩字串在該組的字元是否在原始或交換後的排列下完全吻合**。
- **兩組均相容，才回傳 `true`**；只要有一組不吻合，即可提前確定無解。

此策略將問題化約為兩次獨立的二選一比對，無需模擬操作序列，邏輯簡潔且效率極高。

## 解題步驟

### Step 1：預先取出所有字元編碼

為避免在後續比對中重複呼叫字串屬性查詢，一次性將兩個字串的四個字元分別轉換為字元編碼並儲存。

```typescript
// 預先取出字元編碼，以避免重複的屬性查詢
const s1Code0 = s1.charCodeAt(0);
const s1Code1 = s1.charCodeAt(1);
const s1Code2 = s1.charCodeAt(2);
const s1Code3 = s1.charCodeAt(3);

const s2Code0 = s2.charCodeAt(0);
const s2Code1 = s2.charCodeAt(1);
const s2Code2 = s2.charCodeAt(2);
const s2Code3 = s2.charCodeAt(3);
```

### Step 2：判斷偶數位置組是否相容

偶數位置（索引 0 與索引 2）之間可以自由互換，因此只需確認兩字串在這兩個位置的字元，無論是原始順序還是互換後，是否能夠對齊。

```typescript
// 偶數索引位置（0、2）之間可以自由互換
// 檢查偶數組在原始或交換後的排列下是否吻合
const evenGroupMatches =
  (s1Code0 === s2Code0 && s1Code2 === s2Code2) ||
  (s1Code0 === s2Code2 && s1Code2 === s2Code0);
```

### Step 3：判斷奇數位置組是否相容

奇數位置（索引 1 與索引 3）同理，只需確認兩字串在這兩個位置的字元，無論是原始順序還是互換後，是否能夠對齊。

```typescript
// 奇數索引位置（1、3）之間可以自由互換
// 檢查奇數組在原始或交換後的排列下是否吻合
const oddGroupMatches =
  (s1Code1 === s2Code1 && s1Code3 === s2Code3) ||
  (s1Code1 === s2Code3 && s1Code3 === s2Code1);
```

### Step 4：兩組均相容時才回傳 true

僅當偶數組與奇數組都能對齊時，兩字串才可能透過操作變得相等。

```typescript
return evenGroupMatches && oddGroupMatches;
```

## 時間複雜度

- 字串長度固定為 4，所有操作（字元編碼取出、比對）皆為常數次；
- 不存在任何隨輸入規模增長的迴圈或遞迴。
- 總時間複雜度為 $O(1)$。

> $O(1)$

## 空間複雜度

- 僅使用固定數量的變數儲存字元編碼與布林結果；
- 無任何動態配置的陣列或額外資料結構。
- 總空間複雜度為 $O(1)$。

> $O(1)$
