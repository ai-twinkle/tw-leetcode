# 696. Count Binary Substrings

Given a binary string `s`, return the number of non-empty substrings that have the same number of `0`'s and `1`'s, 
and all the `0`'s and all the `1`'s in these substrings are grouped consecutively.

Substrings that occur multiple times are counted the number of times they occur.

**Constraints:**

- `1 <= s.length <= 10^5`
- `s[i]` is either `'0'` or `'1'`.

## 基礎思路

本題要計算所有符合條件的非空子字串數量：子字串中 `0` 與 `1` 的數量相同，且兩種字元必須各自形成連續的一段（例如 `0011`、`01`），不能交錯出現（例如 `0101` 不符合）。由於字串長度可達 $10^5$，必須用線性掃描的方式完成統計。

可掌握以下核心觀察：

* **合法子字串必然跨越一次相鄰區段的邊界**：
  因為子字串必須由「一段連續的某字元」接著「一段連續的另一字元」組成，所以它一定對應到原字串中某兩個相鄰的連續區段（run）。

* **每一對相鄰區段可貢獻的答案數量只取決於兩段長度**：
  若相鄰兩段長度分別為 $a$ 與 $b$，則可形成的合法子字串數量為 $\min(a, b)$。因為子字串需要兩段長度相同，最多只能取到較短段的長度。

* **整體答案可由所有相鄰區段的貢獻加總得到**：
  只要線性掃描字串，持續維護「目前區段長度」與「前一區段長度」，在每次遇到區段切換時累加一次 $\min(\text{前一段}, \text{目前段})$，即可在 $O(n)$ 完成。

依據上述策略，抽象流程如下：

* 線性掃描字串，統計連續區段長度。
* 每當偵測到字元切換，將「前一段」與「目前段」能配對出的數量加入總和。
* 掃描結束後，補上最後一組相鄰區段的貢獻。

## 解題步驟

### Step 1：初始化邊界與區段統計狀態

先處理長度過短的情況，並初始化用於追蹤相鄰連續區段長度的狀態，以便後續線性掃描時能即時計算相鄰區段的貢獻。

```typescript
const length = s.length;
if (length <= 1) {
  return 0;
}

// 快取前一個字元以避免重複索引讀取（在 JS 引擎中可能有成本）。
let previousCharacter = s.charCodeAt(0);

// 目前區段與前一區段的長度。
let currentRunLength = 1;
let previousRunLength = 0;

let totalSubstrings = 0;
```

### Step 2：線性掃描字串並累積每次區段切換的貢獻

從左到右掃描字串：若字元延續則增加目前區段長度；若字元切換則將相鄰兩段能形成的數量加入總和，並更新「前一段」與「目前段」的狀態，以繼續處理下一段。

```typescript
for (let index = 1; index < length; index++) {
  const currentCharacter = s.charCodeAt(index);

  if (currentCharacter === previousCharacter) {
    currentRunLength++;
  } else {
    // 當區段切換時，加入前一段與目前段之間能形成的所有配對數量。
    totalSubstrings += currentRunLength < previousRunLength ? currentRunLength : previousRunLength;

    previousRunLength = currentRunLength;
    currentRunLength = 1;
    previousCharacter = currentCharacter;
  }
}
```

### Step 3：補上最後一組相鄰區段的貢獻並回傳結果

由於掃描迴圈只在「遇到切換」時結算貢獻，因此結束後仍需補上最後一組相鄰區段的配對數量，最後回傳累積總和。

```typescript
// 最後邊界的貢獻。
totalSubstrings += currentRunLength < previousRunLength ? currentRunLength : previousRunLength;

return totalSubstrings;
```

## 時間複雜度

- 僅需一次線性掃描整個字串，每個字元只處理一次；
- 每次迭代內皆為常數時間操作。
- 總時間複雜度為 $O(n)$。

> $O(n)$

## 空間複雜度

- 僅使用固定數量的變數維護區段長度與累積答案；
- 不需額外陣列或與輸入規模相關的儲存空間。
- 總空間複雜度為 $O(1)$。

> $O(1)$
