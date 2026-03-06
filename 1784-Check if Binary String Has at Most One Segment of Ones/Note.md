# 1784. Check if Binary String Has at Most One Segment of Ones

Given a binary string `s` without leading zeros, return `true` if `s` contains at most one contiguous segment of ones. 
Otherwise, return `false`.

**Constraints:**

- `1 <= s.length <= 100`
- `s[i]` is either `'0'` or `'1'`.
- `s[0]` is `'1'`.

## 基礎思路

本題要求判斷一個二進位字串是否**最多只包含一段連續的 `1`**。若字串中存在兩段或以上彼此被 `0` 分隔的 `1`，則不符合條件。

可以從以下觀察理解問題本質：

* **字串一定以 `1` 開頭**
  題目已保證 `s[0]` 為 `1`，因此第一段 `1` 必定從字串開頭開始。

* **一旦出現 `0`，後續不應再出現 `1`**
  若字串中某處出現 `0`，之後又出現 `1`，代表產生第二段 `1`，違反題目條件。

* **問題可轉化為單次掃描的狀態判斷**
  在掃描字串時，只需記錄是否已經遇到 `0`。
  若曾出現 `0` 且之後再次遇到 `1`，即可立即判定不合法。

因此整體策略為：

* 從第二個字元開始掃描字串。
* 使用一個布林變數記錄是否已經出現 `0`。
* 若在出現 `0` 之後又遇到 `1`，立即回傳 `false`。
* 若掃描完整個字串都未違反條件，則回傳 `true`。

此方法僅需一次線性掃描即可完成判斷。

## 解題步驟

### Step 1：初始化狀態變數以記錄是否出現過 `0`

建立一個布林變數，用來記錄掃描過程中是否已經遇到 `0`。
若之後再次遇到 `1`，即可判定出現第二段 `1`。

```typescript
let hasSeenZero = false;
```

### Step 2：從第二個字元開始掃描並檢查是否出現第二段 `1`

由於字串第一個字元必定為 `1`，掃描可以從索引 `1` 開始。
每次取得目前字元的 ASCII 編碼並進行判斷：

* 若為 `0`，代表第一段 `1` 已結束，更新狀態。
* 若為 `1` 且之前已經出現 `0`，代表出現第二段 `1`，立即回傳 `false`。

```typescript
for (let index = 1; index < s.length; index++) {
  const currentCharacterCode = s.charCodeAt(index);

  // 一旦出現 0，若之後再出現 1 則字串不合法
  if (currentCharacterCode === 48) {
    hasSeenZero = true;
  } else if (hasSeenZero) {
    return false;
  }
}
```

### Step 3：若整個掃描過程未違反條件則回傳合法結果

若掃描完整個字串都沒有在 `0` 之後再次出現 `1`，
表示字串最多只有一段連續的 `1`。

```typescript
return true;
```

## 時間複雜度

- 需要對字串進行一次線性掃描。
- 每個字元只會被檢查一次。
- 總時間複雜度為 $O(n)$。

> $O(n)$

## 空間複雜度

- 僅使用一個布林變數作為狀態標記。
- 未使用任何額外資料結構。
- 總空間複雜度為 $O(1)$。

> $O(1)$
