# 657. Robot Return to Origin

There is a robot starting at the position `(0, 0)`, the origin, on a 2D plane. 
Given a sequence of its moves, judge if this robot ends up at `(0, 0)` after it completes its moves.

You are given a string `moves` that represents the move sequence of the robot 
where `moves[i]` represents its $i^{th}$ move. 
Valid moves are `'R'` (right), `'L'` (left), `'U'` (up), and `'D'` (down).

Return `true` if the robot returns to the origin after it finishes all of its moves, or `false` otherwise.

Note: The way that the robot is "facing" is irrelevant. 
`'R'` will always make the robot move to the right once, `'L'` will always make it move left, etc. 
Also, assume that the magnitude of the robot's movement is the same for each move.

**Constraints:**

- `1 <= moves.length <= 2 * 10^4`
- `moves` only contains the characters `'U'`, `'D'`, `'L'` and `'R'`.

## 基礎思路

本題要求判斷機器人在執行完所有移動指令後，是否恰好回到原點 `(0, 0)`。由於每次移動的距離固定且僅有四個方向，問題本質上是對兩個獨立軸的位移做加減計算，最終確認兩軸位移是否各自歸零。

在思考解法時，可掌握以下核心觀察：

- **兩軸互相獨立**：
  水平方向（左右）與垂直方向（上下）彼此不影響，可分別累計位移，最後同時檢查是否均為零。

- **回到原點的充要條件**：
  每個方向的移動次數必須與其反方向的移動次數相等，即左右次數相消、上下次數相消，才能使最終位移為零。

- **字元比對可用數值代碼優化**：
  對長字串逐字元取值時，使用字元數值代碼（character code）進行比對，可避免每次存取字元時產生字串物件的額外開銷，四個方向的代碼可在函數呼叫前預先計算完畢，供所有呼叫共用。

依據以上特性，可以採用以下策略：

- **預先計算四個方向字元的數值代碼**，避免每次呼叫重複計算。
- **以兩個整數分別追蹤水平與垂直方向的累計位移**，遇到對應方向則加一或減一。
- **單次線性掃描所有指令**，每個字元只需進行常數次比對即可更新狀態。
- **掃描結束後，同時判斷兩軸位移是否皆為零**，即可得出答案。

此策略僅需一次遍歷，時間與空間皆最優。

## 解題步驟

### Step 1：預先計算四個方向字元的數值代碼

在所有函數呼叫之外預先取得四個合法指令字元對應的數值代碼，供後續比對時直接使用，避免重複運算。

```typescript
// 預先計算字元代碼常數，避免重複進行字串比對
const CHAR_R = "R".charCodeAt(0);
const CHAR_L = "L".charCodeAt(0);
const CHAR_U = "U".charCodeAt(0);
const CHAR_D = "D".charCodeAt(0);
```

### Step 2：初始化位移累計器與字串長度

分別以兩個變數追蹤水平與垂直方向的累計位移，並預先讀取字串長度以避免迴圈中重複存取。

```typescript
let horizontal = 0;
let vertical = 0;
const length = moves.length;
```

### Step 3：逐字元讀取指令並更新對應軸的位移

使用字元數值代碼逐一比對每個移動指令，以避免字串存取的額外開銷；
遇到 `'R'` 時水平向右加一，遇到 `'L'` 時向左減一，遇到 `'U'` 時垂直向上加一，遇到 `'D'` 時向下減一。

```typescript
// 使用 charCodeAt 迭代，避免每個字元產生字串物件
for (let index = 0; index < length; index++) {
  const code = moves.charCodeAt(index);

  if (code === CHAR_R) {
    horizontal++;
  } else if (code === CHAR_L) {
    horizontal--;
  } else if (code === CHAR_U) {
    vertical++;
  } else if (code === CHAR_D) {
    vertical--;
  }
}
```

### Step 4：判斷兩軸位移是否皆歸零並回傳結果

所有指令處理完畢後，若水平與垂直位移同時為零，代表機器人回到原點，回傳 `true`；否則回傳 `false`。

```typescript
return horizontal === 0 && vertical === 0;
```

## 時間複雜度

- 對長度為 $n$ 的字串進行單次線性掃描，每個字元僅執行常數次比對與加減操作；
- 預計算字元代碼與長度均為常數時間。
- 總時間複雜度為 $O(n)$。

> $O(n)$

## 空間複雜度

- 僅使用固定數量的整數變數儲存位移與索引；
- 無任何額外陣列或動態空間。
- 總空間複雜度為 $O(1)$。

> $O(1)$
