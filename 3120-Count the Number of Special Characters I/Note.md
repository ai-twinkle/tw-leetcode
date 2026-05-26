# 3120. Count the Number of Special Characters I

You are given a string `word`. 
A letter is called special if it appears both in lowercase and uppercase in `word`.

Return the number of special letters in `word`.

**Constraints:**

- `1 <= word.length <= 50`
- `word` consists of only lowercase and uppercase English letters.

## 基礎思路

本題要求計算字串中「同時以小寫與大寫形式出現」的字母數量。由於英文字母只有 26 個，且每個字母僅需判斷「是否存在」，因此非常適合以位元集合的方式進行表示與運算。

在思考解法時，可掌握以下核心觀察：

- **字母集合的本質為存在性查詢**：
  我們不需要知道某個字母出現幾次，只需要知道它是否曾經以小寫或大寫形式出現過，這正是位元遮罩最擅長處理的場景。

- **大小寫字母可由 ASCII 範圍直接區分**：
  小寫字母與大寫字母的 ASCII 區間不重疊，因此在掃描字串時可僅憑單一條件即可分流，無須額外的字元判斷函式。

- **同時出現等同於兩集合的交集**：
  若某字母同時存在於小寫集合與大寫集合中，則該位元在兩個遮罩中皆為 1，因此使用位元 AND 運算即可一次取得所有「同時出現」的字母集合。

- **計算集合大小可化為計算位元中 1 的數量**：
  最後只需計算交集遮罩中為 1 的位元數，即為答案。

依據以上特性，可以採用以下策略：

- **使用兩個 32 位元整數分別作為小寫與大寫字母的存在性位元集合**。
- **單次掃描字串，依 ASCII 範圍將字元分流至對應遮罩**。
- **以 AND 運算取得交集，並以 SWAR（SIMD Within A Register）平行位元計數法在常數時間內計算位元數**。

此策略能將整體流程壓縮至一次線性掃描搭配常數時間的位元計數運算，效率極佳。

## 解題步驟

### Step 1：初始化兩個位元遮罩與字串長度

我們使用兩個整數分別代表小寫字母與大寫字母的存在性集合，每個位元對應一個字母。同時取得字串長度供後續迴圈使用。

```typescript
// 位元遮罩，第 i 個位元代表第 i 個英文字母
let lowercaseMask = 0;
let uppercaseMask = 0;
const length = word.length;
```

### Step 2：單次掃描字串並依 ASCII 範圍分流設定位元

針對每個字元，先取得其 ASCII 編碼，再依據編碼判斷其屬於小寫（≥ 97）或大寫（< 97），並將對應的位元設為 1。透過 `1 << (charCode - 97)` 或 `1 << (charCode - 65)` 將字母對應至位元位置。

```typescript
// 單趟掃描：依 ASCII 範圍分類每個字元並設定對應位元
for (let index = 0; index < length; index++) {
  const charCode = word.charCodeAt(index);
  // 小寫字母 ASCII 為 97-122，大寫字母 ASCII 為 65-90
  if (charCode >= 97) {
    lowercaseMask |= 1 << (charCode - 97);
  } else {
    uppercaseMask |= 1 << (charCode - 65);
  }
}
```

### Step 3：以位元 AND 取得同時出現於大小寫的字母集合

兩個遮罩做 AND 後，僅保留「同時存在於小寫與大寫」的位元，這正是所有特殊字母的集合。

```typescript
// 同時存在於兩個遮罩的字母即為特殊字母
let intersection = lowercaseMask & uppercaseMask;
```

### Step 4：以 SWAR 平行位元計數法計算交集中 1 的個數

使用經典的 SWAR popcount 技巧，透過三步位元並行運算，在常數時間內計算 32 位元整數中為 1 的位元數量，並回傳結果作為答案。

```typescript
// SWAR popcount：以位元並行算術在 O(1) 時間內計算被設定的位元數
intersection = intersection - ((intersection >> 1) & 0x55555555);
intersection = (intersection & 0x33333333) + ((intersection >> 2) & 0x33333333);
return (((intersection + (intersection >> 4)) & 0x0f0f0f0f) * 0x01010101) >> 24;
```

## 時間複雜度

- 字串掃描階段需要 $O(n)$ 的線性時間，其中 $n$ 為字串長度；
- 位元 AND 與 SWAR popcount 皆為常數時間運算；
- 總時間複雜度為 $O(n)$。

> $O(n)$

## 空間複雜度

- 僅使用固定數量的整數變數作為位元遮罩與中介值；
- 無任何額外陣列或動態空間配置；
- 總空間複雜度為 $O(1)$。

> $O(1)$
