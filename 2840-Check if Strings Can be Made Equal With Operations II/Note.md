# 2840. Check if Strings Can be Made Equal With Operations II

You are given two strings `s1` and `s2`, both of length `n`, consisting of lowercase English letters.

You can apply the following operation on any of the two strings any number of times:

- Choose any two indices `i` and `j` such that `i < j` and the difference `j - i` is even, 
- then swap the two characters at those indices in the string.

Return `true` if you can make the strings `s1` and `s2` equal, and `false` otherwise.

**Constraints:**

- `n == s1.length == s2.length`
- `1 <= n <= 10^5`
- `s1` and `s2` consist only of lowercase English letters.

## 基礎思路

本題給定兩個等長字串，允許在任一字串中對「索引差為偶數」的兩個位置進行交換，問是否能使兩字串相等。在分析解法之前，需先理解這個操作的本質限制。

在思考解法時，可掌握以下核心觀察：

- **奇偶索引互不干擾**：
  若兩個索引的差為偶數，則它們的奇偶性必然相同（偶-偶或奇-奇）。也就是說，偶數位置上的字元只能與偶數位置互換，奇數位置上的字元只能與奇數位置互換，兩組之間永遠無法跨越。

- **同奇偶組內可自由重排**：
  在同一奇偶組內，任意兩個位置之間都可以透過一次或多次合法交換達成任意排列，因此只需關心「兩字串在偶數位置上的字元集合」與「在奇數位置上的字元集合」分別是否一致，而無需考慮具體順序。

- **問題轉化為頻率平衡**：
  針對偶數索引與奇數索引分別統計兩字串的字元頻率差，若兩組頻率差皆全為零，則兩字串可達到相等；否則不可能。

- **奇偶分區可用位移技巧合併**：
  偶數索引與奇數索引的頻率可以用同一個陣列的不同區段來追蹤，利用索引的最低位元決定偏移量，以無分支方式完成分區，減少不必要的邏輯判斷。

依據以上特性，可以採用以下策略：

- **以單一頻率陣列同時追蹤偶數與奇數索引的字元淨頻率**，遇到第一個字串時加一，遇到第二個字串時減一。
- **一趟遍歷完成頻率計算後，再對陣列做一次線性掃描**，確認所有槽位均已歸零，即可判斷結果並同步清除狀態。

此策略能在 $O(n)$ 時間內完成判斷，並透過模組層級的陣列重用，避免每次呼叫產生垃圾回收壓力。

## 解題步驟

### Step 1：宣告模組層級的字元頻率陣列

使用一個長度為 256 的 `Int32Array` 作為共用頻率表，以索引 0–127 追蹤偶數位置的字元淨頻率，以索引 128–255 追蹤奇數位置的字元淨頻率。此陣列在模組層級宣告，可避免每次函式呼叫時重新配置記憶體。

```typescript
/**
 * 以單一 Int32Array 分成兩個 128 格的半區，透過位元移位進行分區。
 * 下半區（0–127）追蹤偶數索引字元的淨頻率，
 * 上半區（128–255）追蹤奇數索引字元的淨頻率。
 * 於模組層級配置一次，以避免每次呼叫產生 GC 壓力。
 */
const charFrequency = new Int32Array(256);
```

### Step 2：取得字串長度並逐位計算偶奇分區的字元淨頻率

取得字串長度後，對每個索引利用最低位元決定要寫入頻率表的哪個半區：偶數索引映射至下半區，奇數索引映射至上半區。對第一個字串的字元加一，對第二個字串的字元減一，最終使頻率表呈現兩字串的差值。

```typescript
const stringLength = s1.length;

// 透過位元移位將奇偶性映射至上半區，以無分支方式完成偶/奇分區
for (let index = 0; index < stringLength; index++) {
  const slotBase = (index & 1) << 7;
  charFrequency[slotBase + s1.charCodeAt(index)]++;
  charFrequency[slotBase + s2.charCodeAt(index)]--;
}
```

### Step 3：驗證頻率平衡並在同一趟掃描中重置陣列

對頻率表做一次線性掃描：若發現任何槽位不為零，代表兩字串在該奇偶分組中字元無法匹配，立即清空整個陣列並回傳 `false`；若全部槽位皆為零，則清空陣列後回傳 `true`。此設計將驗證與重置合併為單趟，避免多一次 $O(256)$ 的掃描。

```typescript
// 在單一趟掃描中同時驗證平衡與重置，避免第二次 O(256) 掃描
for (let slotIndex = 0; slotIndex < 256; slotIndex++) {
  if (charFrequency[slotIndex] !== 0) {
    charFrequency.fill(0);
    return false;
  }
}

charFrequency.fill(0);
return true;
```

## 時間複雜度

- 第一個迴圈遍歷字串，對每個索引執行常數次運算，共 $O(n)$；
- 第二個迴圈掃描長度固定為 256 的頻率表，為 $O(1)$；
- 總時間複雜度為 $O(n)$。

> $O(n)$

## 空間複雜度

- 使用一個長度固定為 256 的模組層級陣列，與輸入規模無關；
- 無任何與 $n$ 相關的動態配置。
- 總空間複雜度為 $O(1)$。

> $O(1)$
