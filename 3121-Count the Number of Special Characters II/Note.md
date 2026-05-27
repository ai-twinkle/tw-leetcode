# 3121. Count the Number of Special Characters II

You are given a string `word`. 
A letter `c` is called special if it appears both in lowercase and uppercase in `word`, 
and every lowercase occurrence of `c` appears before the first uppercase occurrence of `c`.

Return the number of special letters in `word`.

**Constraints:**

- `1 <= word.length <= 2 * 10^5`
- `word` consists of only lowercase and uppercase English letters.

## 基礎思路

本題要求找出在字串中同時以小寫與大寫形式出現，且**所有小寫出現位置皆早於第一個大寫出現位置**的字母數量。

在思考解法時，可掌握以下核心觀察：

- **字母集合大小固定**：
  英文字母僅有 26 個，狀態可以用一個 32 位元整數的位元遮罩完整表示，極大提升判斷與合併效率。

- **「合法」與「非法」可分離追蹤**：
  一個字母是否合格取決於兩個獨立條件：是否同時出現大小寫、是否在大寫出現後又再次出現小寫。這兩個條件可以用不同的遮罩同步維護。

- **單次線性掃描即可判定所有字母**：
  每讀入一個字元，僅需更新對應的位元；若該字母已在大寫遮罩中且又遇到小寫，即可立即將其標記為「非法」，無須回頭重掃。

- **位元運算可大幅簡化條件判斷**：
  各種「集合交集 / 補集」邏輯都能透過 `AND`、`OR`、`NOT` 等位元運算一次完成，避免使用陣列或雜湊結構帶來的額外負擔。

依據以上特性，可以採用以下策略：

- **以三個位元遮罩同步追蹤**：分別記錄已見過的小寫字母、已見過的大寫字母、以及已被判定不合格的字母。
- **逐字元線性掃描更新遮罩**：遇到小寫時，若該字母已出現過大寫，則將其加入不合格遮罩；遇到大寫時，僅需更新大寫遮罩。
- **最後以位元計數取得結果**：合格字母即為「同時出現大小寫」且「未被標記為不合格」的位元，使用 Brian Kernighan's 演算法計算其位元數即為答案。

此策略能在單次線性掃描內完成所有判定，並透過位元運算將常數係數壓到極低。

## 解題步驟

### Step 1：初始化三個位元遮罩與字串長度

宣告三個遮罩分別追蹤：已見過小寫的字母、已見過大寫的字母、以及不合格的字母；同時取得字串長度以便後續迴圈使用。

```typescript
// 已以小寫形式出現過的字母遮罩（第 i 位代表 'a'+i）
let lowerSeenMask = 0;
// 已以大寫形式出現過的字母遮罩
let upperSeenMask = 0;
// 因「大寫之後又出現小寫」而被取消資格的字母遮罩
let invalidMask = 0;
const wordLength = word.length;
```

### Step 2：線性掃描字串並依字元種類進行分支處理

逐一取得每個字元的 ASCII 碼，並依其值是否 `>= 97` 判斷為小寫或大寫。
若為小寫，計算對應位元後，先以位元 `AND` 偵測該字母是否已存在於大寫遮罩中；若存在，該位元會被流入不合格遮罩，最後再將此位元更新進小寫遮罩。
若為大寫，則僅需將對應位元加入大寫遮罩。

```typescript
// 單次線性掃描，同步建立三個位元遮罩
for (let index = 0; index < wordLength; index++) {
  const charCode = word.charCodeAt(index);
  if (charCode >= 97) {
    // 小寫分支：'a' 的 ASCII 為 97
    const letterBit = 1 << (charCode - 97);
    // 無分支判斷：若該字母已出現大寫，則該位元會被流入不合格遮罩
    invalidMask |= upperSeenMask & letterBit;
    lowerSeenMask |= letterBit;
  } else {
    // 大寫分支：'A' 的 ASCII 為 65
    upperSeenMask |= 1 << (charCode - 65);
  }
}
```

### Step 3：以位元運算組合出合格字母的遮罩

合格字母需同時出現於小寫與大寫遮罩，且不在不合格遮罩中；
透過 `lowerSeenMask & upperSeenMask & ~invalidMask` 即可一次取得所有合格字母對應的位元。

```typescript
// 合格字母為「同時以大小寫出現」且「未被取消資格」者
let specialMask = lowerSeenMask & upperSeenMask & ~invalidMask;
```

### Step 4：使用 Brian Kernighan's 演算法計算位元數

每次執行 `specialMask &= specialMask - 1` 會清除最低位的 1，因此迴圈次數恰好等於遮罩中為 1 的位元數，即為合格字母總數。

```typescript
// Brian Kernighan's 演算法：每次迴圈清除最低位的 1
let specialCount = 0;
while (specialMask !== 0) {
  specialMask &= specialMask - 1;
  specialCount++;
}
return specialCount;
```

## 時間複雜度

- 對字串進行單次線性掃描，共 $n$ 次位元運算；
- 最後計算位元數的迴圈最多執行 26 次（字母總數固定），視為常數；
- 總時間複雜度為 $O(n)$。

> $O(n)$

## 空間複雜度

- 僅使用固定數量的整數變數作為位元遮罩；
- 未使用任何隨字串長度增長的額外結構；
- 總空間複雜度為 $O(1)$。

> $O(1)$
