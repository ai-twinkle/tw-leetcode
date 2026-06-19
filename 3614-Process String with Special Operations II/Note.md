# 3614. Process String with Special Operations II

You are given a string `s` consisting of lowercase English letters and the special characters: `'*'`, `'#'`, and `'%'`.

You are also given an integer `k`.

Build a new string `result` by processing `s` according to the following rules from left to right:

- If the letter is a lowercase English letter append it to `result`.
- A `'*'` removes the last character from `result`, if it exists.
- A `'#'` duplicates the current `result` and appends it to itself.
- A `'%'` reverses the current `result`.

Return the $k^{th}$ character of the final string `result`. 
If `k` is out of the bounds of `result`, return `'.'`.

**Constraints:**

- `1 <= s.length <= 10^5`
- `s` consists of only lowercase English letters and special characters `'*'`, `'#'`, and `'%'`.
- `0 <= k <= 10^15`
- The length of `result` after processing `s` will not exceed `10^15`.

## 基礎思路

本題要求在一個由「字母、`'*'`、`'#'`、`'%'`」組成的字串上，依序套用「附加、刪除、複製、反轉」四種操作，並回傳最終結果字串的第 `k` 個字元；若 `k` 超出範圍則回傳 `'.'`。

關鍵困難在於：由於 `'#'` 會使長度倍增，最終結果長度可達 `10^15`，因此**完全無法實際建構出整條字串**，必須以「不還原字串」的方式定位目標字元。

在思考解法時，可掌握以下核心觀察：

- **長度資訊與字元內容可分離**：
  四種操作對「長度」的影響是確定且可推算的——字母加一、複製倍增、刪除減一、反轉不變。因此可以只追蹤每一步操作後的結果長度，而完全不必保存實際字元。

- **目標位置可逆向回溯**：
  既然每個操作對長度的影響已知，那麼某個位置在執行完某操作後的索引，必能反推回執行該操作前的對應索引。透過由後往前回溯目標索引，最終可定位到產生該字元的那個原始字母。

- **每種操作對應一種索引映射**：
  複製操作會讓後半段鏡射前半段，故落在後半段的索引可折回原始段；反轉操作會讓索引映射到其鏡射位置；刪除操作則不影響仍保留下來的位置；字母則是在「位於當前最後一位」時即為答案來源。

依據以上特性，可以採用以下策略：

- **前向掃描只計算並記錄每一步的結果長度**，並以前綴長度陣列保存，供回溯時查詢。
- **越界判斷只需比較 `k` 與最終長度**，超界即回傳 `'.'`。
- **後向掃描將目標索引依操作型態逐步折疊**，直到命中產生該字元的原始字母並回傳。

此策略以線性時間完成定位，完全迴避了實際建構超大字串所造成的記憶體與時間爆炸。

## 解題步驟

### Step 1：初始化操作數量與各項輔助結構

先取得操作總數，並配置兩個 typed array：一個快取每個操作的字元碼，另一個記錄各前綴的結果長度；同時初始化目前長度為 0。

```typescript
const operationCount = s.length;

// 將字元碼快取於 typed array，使反向掃描時無須再存取字串
const operationCodes = new Uint8Array(operationCount);

// prefixLengths[i] 代表執行前 i 個操作後的結果長度
// Float64Array 可精確表示至 2^53 的整數，足以涵蓋 10^15 的上界
const prefixLengths = new Float64Array(operationCount + 1);

let currentLength = 0;
```

### Step 2：開始前向掃描並快取每個操作的字元碼

從左到右逐一處理操作，先取出目前操作的字元碼並存入快取陣列，以利後續反向掃描直接讀取。

```typescript
// 前向掃描：只追蹤長度，永不記錄實際字元
for (let index = 0; index < operationCount; index++) {
  const characterCode = s.charCodeAt(index);
  operationCodes[index] = characterCode;

  // ...
}
```

### Step 3：依操作型態更新目前結果長度

依字元碼判斷操作型態並更新長度：字母加一、`'#'` 長度加倍、`'*'` 在尚有字元時減一；`'%'` 不改變長度。為效能考量，先做最常見的字母範圍檢查。

```typescript
for (let index = 0; index < operationCount; index++) {
  // Step 2：快取目前操作的字元碼

  // 字母佔輸入多數，故先做成本最低的範圍檢查
  if (characterCode >= 97) {
    // 小寫字母會附加一個字元
    currentLength = currentLength + 1;
  } else if (characterCode === 35) {
    // '#' 會複製結果，使長度加倍
    currentLength = currentLength * 2;
  } else if (characterCode === 42) {
    // '*' 僅在尚有字元時移除最後一個字元
    if (currentLength > 0) {
      currentLength = currentLength - 1;
    }
  }
  // '%'（字元碼 37）會反轉結果，長度維持不變

  // ...
}
```

### Step 4：記錄此前綴的結果長度

在本輪操作結束時，將目前長度寫入前綴長度陣列，作為日後反向回溯時查詢各階段長度的依據。

```typescript
for (let index = 0; index < operationCount; index++) {
  // Step 2：快取目前操作的字元碼

  // Step 3：依操作型態更新目前結果長度

  prefixLengths[index + 1] = currentLength;
}
```

### Step 5：判斷目標索引是否越界

若 `k` 大於或等於最終結果長度（包含結果為空的情形），代表查詢落在合法範圍之外，直接回傳 `'.'`。

```typescript
// 越界查詢（包含結果為空）一律回傳 '.'
if (k >= currentLength) {
  return ".";
}
```

### Step 6：初始化欲回溯的目標索引

以 `targetIndex` 保存欲定位的位置，初始值即為 `k`，之後將依序沿各操作往回折疊。

```typescript
let targetIndex = k;
```

### Step 7：開始反向掃描並讀取每個操作的字元碼

由最後一個操作往前回溯，先讀出該操作的字元碼，準備依其型態對目標索引進行對應的折疊映射。

```typescript
// 反向掃描：將目標索引沿每個操作回溯，直到對應的來源字母
for (let index = operationCount - 1; index >= 0; index--) {
  const characterCode = operationCodes[index];

  // ...
}
```

### Step 8：依操作型態折疊目標索引並定位來源字母

依字元碼分流處理：字母在「目標索引正好位於當前最後一位」時即為答案，直接回傳；`'#'` 將落在後半段的索引折回原始段；`'%'` 將索引映射為其鏡射位置；而 `'*'` 不影響仍保留的位置，無須處理。

```typescript
for (let index = operationCount - 1; index >= 0; index--) {
  // Step 7：讀取目前操作的字元碼

  if (characterCode >= 97) {
    // 唯有當字母正好位於目前最後一個位置時，它才是答案
    const lengthAfter = prefixLengths[index + 1];
    if (targetIndex === lengthAfter - 1) {
      return String.fromCharCode(characterCode);
    }
  } else if (characterCode === 35) {
    // '#'：附加的副本鏡射前半段，因此將索引折回原始段
    const lengthBefore = prefixLengths[index];
    if (targetIndex >= lengthBefore) {
      targetIndex = targetIndex - lengthBefore;
    }
  } else if (characterCode === 37) {
    // '%'：被反轉的位置映射到它的鏡射位置
    const lengthAfter = prefixLengths[index + 1];
    targetIndex = lengthAfter - 1 - targetIndex;
  }
  // '*'（字元碼 42）：移除操作不會影響仍然保留下來的位置
}
```

### Step 9：補上理論上不可達的最終回傳

對於合法且在範圍內的 `k`，回溯必定會在迴圈內命中字母並回傳；此處的回傳僅為使函數成為完整的全函數而保留。

```typescript
// 對於合法且在範圍內的 k 不會執行到此，但保留它使函數成為全函數
return ".";
```

## 時間複雜度

- 前向掃描走訪每個操作一次，僅做常數時間的長度更新與記錄；
- 後向掃描同樣走訪每個操作一次，每步只做常數時間的索引折疊；
- 設 `n` 為字串長度，兩趟掃描皆為線性。
- 總時間複雜度為 $O(n)$。

> $O(n)$

## 空間複雜度

- 使用 `operationCodes` 快取所有字元碼，佔用 $O(n)$；
- 使用 `prefixLengths` 記錄各前綴長度，佔用 $O(n)$；
- 其餘僅為固定數量的純量變數。
- 總空間複雜度為 $O(n)$。

> $O(n)$
