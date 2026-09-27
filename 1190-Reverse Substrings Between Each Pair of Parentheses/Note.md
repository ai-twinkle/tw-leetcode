# 1190. Reverse Substrings Between Each Pair of Parentheses

You are given a string `s` that consists of lower case English letters and brackets.

Reverse the strings in each pair of matching parentheses, starting from the innermost one.

Your result should not contain any brackets.

**Constraints:**

- `1 <= s.length <= 2000`
- `s` only contains lower case English characters and parentheses.
- It is guaranteed that all parentheses are balanced.

## 基礎思路

本題給定一個僅含小寫英文字母與括號的字串，要求由最內層括號開始，逐層將括號內的內容反轉，最終輸出不含任何括號的結果。

若直接依題意模擬，每遇到一對括號就實際執行一次字串反轉，最壞情況下巢狀層數與字串長度同級，反覆反轉會造成大量重複搬移，效率不佳。

在思考解法時，可掌握以下核心觀察：

- **反轉的本質是「行進方向的改變」**：
  進入一層括號代表接下來的字元必須以相反順序讀出，離開該層則恢復原方向。因此反轉並非一定要真的搬動資料，而可以理解為掃描方向的切換。

- **括號是成對且保證平衡的**：
  既然題目保證所有括號都能配對，便可事先建立每個括號與其對應括號的位置關係，讓掃描過程中能以常數時間在兩端之間跳躍。

- **每個字母恰好被輸出一次**：
  無論巢狀多深，最終結果的長度等於原字串中字母的數量；只要掃描路徑正確，單趟走訪即可依正確順序收集全部字母。

- **括號本身不出現在結果中**：
  括號僅扮演「切換方向的傳送點」，遇到時不輸出，只負責跳轉與翻轉方向。

依據以上特性，可以採用以下策略：

- **先以堆疊預掃一次，建立所有括號的配對位置表**。
- **再以單趟掃描走訪字串**：遇到括號時跳到其配對位置並反轉前進方向，遇到字母則直接寫入輸出緩衝。
- **最後將緩衝區內已依正確順序排列的字元組回字串回傳**。

此策略使每個位置至多被造訪常數次，避免了逐層實際反轉所帶來的重複搬移成本。

## 解題步驟

### Step 1：預先定義括號的字元碼常數

以字元碼進行比較可避免逐字切出子字串，將判斷成本壓到最低。

```typescript
/** 兩種括號符號的字元碼，以數值比較取代字串切片。 */
const OPEN_PAREN = 40;
const CLOSE_PAREN = 41;
```

### Step 2：建立括號配對表

先取得字串長度，並以堆疊掃描一次字串：遇到左括號時記錄其位置，遇到右括號時取出最近未配對的左括號，將兩者的位置互相登記到配對表中。

```typescript
const length = s.length;

// 預先配對每個括號，使掃描時能以 O(1) 在兩端之間跳躍。
const pairIndex = new Int32Array(length);
const stack = new Int32Array(length);
let stackSize = 0;

for (let index = 0; index < length; index += 1) {
  const code = s.charCodeAt(index);

  if (code === OPEN_PAREN) {
    stack[stackSize++] = index;
  }
  else if (code === CLOSE_PAREN) {
    const openIndex = stack[--stackSize];
    pairIndex[openIndex] = index;
    pairIndex[index] = openIndex;
  }
}
```

### Step 3：單趟掃描並在遇到括號時跳轉與反轉方向

準備輸出緩衝、寫入位置與目前的前進方向，接著依方向掃描字串。當讀到的字元為任一種括號時，立即跳到其配對位置，並將前進方向取反，該括號本身不寫入結果。

```typescript
// 單趟掃描字串；遇到括號即跳至配對位置並反轉前進方向。
const output = new Uint8Array(length);
let writePosition = 0;
let direction = 1;

for (let index = 0; index < length; index += direction) {
  const code = s.charCodeAt(index);

  if (code === OPEN_PAREN || code === CLOSE_PAREN) {
    index = pairIndex[index];
    direction = -direction;
    continue;
  }

  // ...
}
```

### Step 4：將非括號字元依掃描順序寫入輸出緩衝

若當前字元並非括號，代表它是結果的一部分；由於掃描路徑已隱含了所有層級的反轉效果，直接依序寫入即為正確順序。

```typescript
for (let index = 0; index < length; index += direction) {
  // Step 3：遇到括號時跳至配對位置並反轉方向

  output[writePosition++] = code;
}
```

### Step 5：組回字串並回傳結果

掃描結束後，緩衝區前段已存放全部字母且順序正確，取出有效範圍並轉回字串回傳。

```typescript
// 緩衝區前段即為最終答案，轉回字串後回傳
return String.fromCharCode(...output.subarray(0, writePosition));
```

## 時間複雜度

- 建立括號配對表需完整掃描字串一次，為 $O(n)$；
- 主掃描中每個位置至多被造訪常數次，括號跳轉為常數時間，整體為 $O(n)$；
- 最後組回字串需 $O(n)$。
- 總時間複雜度為 $O(n)$。

> $O(n)$

## 空間複雜度

- 配對表與輔助堆疊各需與字串等長的空間，為 $O(n)$；
- 輸出緩衝區亦為 $O(n)$；
- 其餘僅使用固定數量的純量變數。
- 總空間複雜度為 $O(n)$。

> $O(n)$
