# 3403. Find the Lexicographically Largest String From the Box I

You are given a string `word`, and an integer `numFriends`.

Alice is organizing a game for her `numFriends` friends. 
There are multiple rounds in the game, where in each round:

- `word` is split into `numFriends` non-empty strings, such that no previous round has had the exact same split.
- All the split words are put into a box.

Find the lexicographically largest string from the box after all the rounds are finished.

**Constraints:**

- `1 <= word.length <= 5 * 10^3`
- `word` consists only of lowercase English letters.
- `1 <= numFriends <= word.length`

## 基礎思路

這道題目的本質，是從所有合法拆分字串的方法中，取出「最有潛力成為最大字典序子字串」的那一段。為了達成此目的，我們可利用以下關鍵觀察：

- 一個字串若被拆分為 $numFriends$ 個子字串，每個子字串必須為非空。
  因此，若希望取得字典序最大的子字串，應儘可能挑選較長、且靠近字串尾端的部分。
- 進一步推導可知，最大字典序的候選子字串，長度必然最多為 $word.length - numFriends + 1$，因為剩餘至少要保留 $(numFriends - 1)$ 個字元給其他朋友使用。
- 由於可以多次進行不同的拆分，我們可觀察到：每個合法拆分的子字串必定是從原始字串 `word` 內某個位置開始，向右擷取一個長度最多為 $maxPieceLength$ 的子字串。
  
因此，本題的核心問題可轉換成：

- **在原字串中所有長度為 $maxPieceLength$ 的子字串內，找出字典序最大的子字串即可。**

## 解題步驟

### Step 1：特殊情況處理及初始化輔助變數

- 當僅有一位朋友 (`numFriends === 1`) 時，代表直接使用整個原始字串即可，無需額外拆分，立即回傳答案。
- 若有多位朋友則計算出字串的長度 (`length`) 和可取的子字串最大長度 (`maxPieceLength`)。
- 同時我們須設置變數 `best` 用來保存目前找到的最大字典序子字串。

```typescript
if (numFriends === 1) {
  return word;
}

const length = word.length;
// 預先計算子字串的最大可能長度，避免後續重複運算
const maxPieceLength = length - numFriends + 1;

let best = "";
```

### Step 2：遍歷所有可能的起點，一次取得最有潛力的候選子字串

一次性從原字串中取出可能的最長合法候選子字串。
- 使用 JavaScript 原生字串比較特性，自動判斷字典序大小。
- 若候選子字串比目前記錄的更佳，則更新保存最佳子字串。

```typescript
for (let startIndex = 0; startIndex < length; ++startIndex) {
  // 此處決定子字串的結尾位置，避免超過原字串範圍
  const endIndex = Math.min(startIndex + maxPieceLength, length);
  const candidate = word.substring(startIndex, endIndex);

  // 若目前子字串字典序較佳，更新最佳答案
  if (candidate > best) {
    best = candidate;
  }
}
```

### Step 3：返回最終結果

全部掃描完畢後，最佳子字串即為最終答案。

```typescript
return best;
```

## 時間複雜度

- 主迴圈遍歷整個字串，共執行 $O(n)$ 次（$n = word.length$）。
- 每次迴圈內取字串與比較的操作，最差情況為 $O(n)$。
- 總時間複雜度為 $O(n) \times O(n) = O(n^2)$。

> $O(n^2)$

## 空間複雜度

- 額外輔助變數 (`length`, `maxPieceLength`, `best`) 僅使用 $O(1)$。
- 每次子字串擷取 (`substring`) 最多佔用 $O(n)$ 空間，且臨時字串會於迴圈結束後即刻釋放，因此實際使用空間仍為 $O(n)$。
- 總空間複雜度為 $O(n)$。

> $O(n)$
