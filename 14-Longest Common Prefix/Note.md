# 14. Longest Common Prefix

Write a function to find the longest common prefix string amongst an array of strings.

If there is no common prefix, return an empty string `""`.

**Constraints:**

- `1 <= strs.length <= 200`
- `0 <= strs[i].length <= 200`
- `strs[i]` consists of only lowercase English letters if it is non-empty.

## 基礎思路

本題要求找出字串陣列中所有字串共同擁有的最長前綴。若不存在任何公共前綴，則回傳空字串。

在思考解法時，可掌握以下核心觀察：

- **公共前綴的長度上限由最短字串決定**：
  公共前綴不可能比陣列中任何一個字串更長，因此第一個字串是天然的參照基準，一旦其他字串提前結束或出現不符的字元，前綴即告終止。

- **逐欄比對是最直觀的策略**：
  將所有字串想像成對齊排列的字元矩陣，對每一個字元位置（欄）同時比對所有字串，只要有任一字串不符，就立即截斷。

- **字元比對可提前終止**：
  一旦在某個位置發現不符或某字串已無字元，就能立刻回傳當前位置之前的子字串，無需掃描後續欄位。

依據以上特性，可以採用以下策略：

- **以第一個字串的每個字元位置為基準，逐欄與其餘字串比對**，一旦遇到不符合的情況立即回傳前綴。
- **若第一個字串的所有字元均通過比對**，則整個第一字串即為最長公共前綴。

此策略能在最壞情況下以線性時間掃描完所有必要字元，並在最早發現差異時即早回傳，兼顧效率與簡潔。

## 解題步驟

### Step 1：處理陣列僅含一個字串的情況

當陣列中只有一個字串時，該字串本身即為最長公共前綴，可直接回傳。

```typescript
const stringCount = strs.length;

// 若只有一個字串，其本身即為最長公共前綴
if (stringCount === 1) {
  return strs[0];
}
```

### Step 2：以第一個字串作為基準並處理其為空字串的情況

公共前綴不可能比第一個字串更長，因此以其作為比對基準。若第一個字串為空，公共前綴必定也為空，可立即回傳。

```typescript
// 前綴長度不可能超過第一個字串的長度
const firstString = strs[0];
const firstLength = firstString.length;

if (firstLength === 0) {
  return "";
}
```

### Step 3：逐欄比對第一個字串的每個字元與其餘字串

對第一個字串的每個字元位置，同時檢查所有其餘字串在同一位置的字元；若某字串已無字元（長度不足）或字元不符，則當前位置即為前綴的終止點，回傳前綴子字串。

```typescript
// 逐一走訪第一個字串的每個字元欄位，並與其他字串比對
for (let charIndex = 0; charIndex < firstLength; charIndex++) {
  const currentCharCode = firstString.charCodeAt(charIndex);

  for (let stringIndex = 1; stringIndex < stringCount; stringIndex++) {
    const otherString = strs[stringIndex];

    // 若該字串已結束或此位置字元不符，則前綴到此為止
    if (charIndex >= otherString.length || otherString.charCodeAt(charIndex) !== currentCharCode) {
      return firstString.slice(0, charIndex);
    }
  }
}
```

### Step 4：所有字元均比對成功，回傳第一個字串作為最長公共前綴

若第一個字串的每個字元都通過了對所有字串的比對，表示整個第一字串均為公共前綴，直接回傳。

```typescript
// 第一個字串的所有字元皆與其他字串相符
return firstString;
```

## 時間複雜度

- 設字串陣列長度為 $n$，第一個字串長度為 $m$；
- 最壞情況下需逐欄比對所有 $m$ 個字元，且每欄需檢查 $n - 1$ 個字串；
- 總時間複雜度為 $O(n \cdot m)$。

> $O(n \cdot m)$

## 空間複雜度

- 僅使用固定數量的輔助變數，不隨輸入規模成長；
- 無額外陣列或動態結構。
- 總空間複雜度為 $O(1)$。

> $O(1)$
