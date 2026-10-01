# 20. Valid Parentheses

Given a string `s` containing just the characters `'('`, `')'`, `'{'`, `'}'`, `'['` and `']'`, 
determine if the input string is valid.

An input string is valid if:

1. Open brackets must be closed by the same type of brackets.
2. Open brackets must be closed in the correct order.
3. Every close bracket has a corresponding open bracket of the same type.

**Constraints:**

- `1 <= s.length <= 10^4`
- `s` consists of parentheses only `'()[]{}'`.

## 基礎思路

本題要求判斷一串僅由三種括號組成的字串是否合法，合法的條件為：每個開括號都被相同型別的閉括號關閉，且關閉順序必須正確。

在思考解法時，可掌握以下核心觀察：

- **後進先出是括號配對的本質**：
  最晚出現的開括號必定最先被關閉，因此這是一個天然的堆疊問題，只需在遇到閉括號時與最近一個尚未關閉的開括號比對即可。

- **長度為奇數必然不合法**：
  每一組括號都由兩個字元構成，因此字元總數必為偶數，奇數長度可在進入主要流程前直接否決。

- **待配對的開括號數量有上界**：
  由於總長度固定，尚未關閉的開括號最多只會是總長的一半，這讓所需的暫存空間能夠一次性預先配置，無須動態成長。

- **型別比對可轉換為字元編碼的查表**：
  三種開括號與其對應閉括號的關係是固定的映射，可預先建表，使比對過程退化為一次陣列索引，避免逐一條件判斷。

- **結尾必須不留殘餘**：
  掃描結束時若仍有尚未關閉的開括號，整體即為不合法。

依據以上特性，可以採用以下策略：

- **先以長度的奇偶性做最快速的否決**。
- **以固定容量的堆疊記錄「目前期待出現的閉括號」**，遇開括號時推入其對應的閉括號，遇閉括號時彈出並比對。
- **任一次比對失敗、堆疊為空卻出現閉括號、或待配對數量超出上界時，立即判定不合法**。
- **掃描完畢後，以堆疊是否清空作為最終判定。**

此策略僅需單次線性掃描即可完成驗證，且所有比對皆為常數時間操作。

## 解題步驟

### Step 1：預先建立開括號對應閉括號的查表

以字元編碼為索引建立一張對照表，將每種開括號映射到其所期待的閉括號編碼；表中為 0 的項目即代表該字元並非開括號，使後續判斷能以單次查表完成。

```typescript
/**
 * 將開括號的字元編碼映射到其所期待的閉括號編碼之查找表。
 * 項目為 0 代表該字元並非開括號。
 * 使用到的索引：'(' = 40、'[' = 91、'{' = 123。
 */
const EXPECTED_CLOSING_CODE = new Uint8Array(126);
EXPECTED_CLOSING_CODE[40] = 41;
EXPECTED_CLOSING_CODE[91] = 93;
EXPECTED_CLOSING_CODE[123] = 125;
```

### Step 2：取得長度並以奇偶性快速否決

先取得字串長度；由於括號必定成雙成對，長度為奇數時不可能完全配對，可直接回傳 `false`。

```typescript
const length = s.length;

// 括號數量為奇數時永遠無法完全配對。
if ((length & 1) === 1) {
  return false;
}
```

### Step 3：配置固定容量的堆疊

待配對的開括號最多只會達到總長的一半，因此以此為容量一次配置好堆疊空間，並初始化堆疊大小。

```typescript
// 最多只會有 length / 2 個開括號處於待配對狀態，因此堆疊不會超過此容量。
const capacity = length >> 1;
const pendingClosingCodes = new Uint8Array(capacity);
let stackSize = 0;
```

### Step 4：逐字掃描並查出該字元所期待的閉括號

依序走訪每個字元，取得其字元編碼後查表，得到其所對應的閉括號編碼；該值是否為 0 即可區分此字元是開括號還是閉括號。

```typescript
for (let index = 0; index < length; index++) {
  const characterCode = s.charCodeAt(index);
  const closingCode = EXPECTED_CLOSING_CODE[characterCode];

  // ...
}
```

### Step 5：遇到開括號時推入其期待的閉括號

若查表結果非 0，代表當前為開括號。此時先確認堆疊尚未達到容量上限，超過即表示剩餘的閉括號不足以完成配對，可直接否決；通過後將期待的閉括號推入堆疊並處理下一個字元。

```typescript
for (let index = 0; index < length; index++) {
  // Step 4：取得字元編碼並查表

  if (closingCode !== 0) {
    // 開括號超過 length / 2 個，代表剩下的閉括號已經不夠配對。
    if (stackSize === capacity) {
      return false;
    }

    pendingClosingCodes[stackSize++] = closingCode;
    continue;
  }

  // ...
}
```

### Step 6：遇到閉括號時與最近的待配對項比對

若查表結果為 0，代表當前為閉括號。此時堆疊若為空則無對象可配對，或彈出的期待值與當前字元不符，皆代表型別或順序錯誤，立即回傳 `false`。

```typescript
for (let index = 0; index < length; index++) {
  // Step 4：取得字元編碼並查表

  // Step 5：處理開括號並推入堆疊

  // 閉括號必須與最近一個待配對的開括號完全相符。
  if (stackSize === 0 || pendingClosingCodes[--stackSize] !== characterCode) {
    return false;
  }
}
```

### Step 7：以堆疊是否清空作為最終判定

掃描結束後，若仍有尚未關閉的開括號殘留於堆疊中，則整體不合法；堆疊為空時才代表所有括號皆已正確配對。

```typescript
return stackSize === 0;
```

## 時間複雜度

- 查找表的建立為固定大小，屬常數時間；
- 字串僅被掃描一次，每個字元的查表、推入與彈出皆為常數時間操作；
- 總時間複雜度為 $O(n)$。

> $O(n)$

## 空間複雜度

- 查找表大小固定，不隨輸入規模變化；
- 堆疊最多容納 $n / 2$ 個待配對項目；
- 總空間複雜度為 $O(n)$。

> $O(n)$
