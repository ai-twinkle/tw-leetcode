# 2130. Maximum Twin Sum of a Linked List

`n` a linked list of size `n`, where `n` is even, 
the $i^{th}$ node (0-indexed) of the linked list is known as the twin of the $(n-1-i)^{th}$ node, if `0 <= i <= (n / 2) - 1`.

- For example, if `n = 4`, then node `0` is the twin of node `3`, and node `1` is the twin of node `2`. 
  These are the only nodes with twins for `n = 4`.

The twin sum is defined as the sum of a node and its twin.

Given the `head` of a linked list with even length, return the maximum twin sum of the linked list.

**Constraints:**

- The number of nodes in the list is an even integer in the range `[2, 10^5]`.
- `1 <= Node.val <= 10^5`

## 基礎思路

本題要求在偶數長度的鏈結串列中，找出所有「孿生節點對」（即第 `i` 個與第 `n-1-i` 個節點）中，節點值總和的最大值。由於鏈結串列僅支援單向走訪，無法直接以索引存取尾端附近的節點，因此若想對「首尾配對」進行高效運算，必須先將節點資料轉換為可隨機存取的結構。

在思考解法時，可掌握以下核心觀察：

- **孿生關係本質為首尾配對**：
  第 `i` 個節點與第 `n-1-i` 個節點配對，等同於將序列由兩端往中間逐對對應。

- **鏈結串列不利於索引存取**：
  若以節點為單位來回追蹤兩端，將會耗費大量指針操作；改以陣列保存節點值後，每筆存取即可降為常數時間。

- **雙指針從兩端推進可一次走訪所有孿生對**：
  左右指針各自向中央移動，每一步恰好對應一組孿生節點，總計只需 n/2 步即可掃描完畢。

依據以上特性，可採用以下策略：

- **以兩次走訪將鏈結串列轉換成型別陣列**：第一次走訪取得長度以配置精確大小，第二次走訪將節點值依序寫入。
- **以雙指針從兩端對撞，逐對計算孿生和並維護最大值**，避免在熱迴圈中產生額外的呼叫開銷。

此策略能在線性時間內完成所有孿生對的計算，同時兼顧記憶體存取的緊湊性與快取友善性。

## 解題步驟

### Step 1：第一次走訪以取得鏈結串列長度

在配置型別陣列之前，必須先確認節點總數，因此先走訪一次整個鏈結串列累計長度。

```typescript
// 第一次走訪：計算節點數，使型別陣列可一次配置到正確大小
let length = 0;
let node = head;
while (node !== null) {
  length++;
  node = node.next;
}
```

### Step 2：再次走訪並將節點值複製到型別陣列

利用前一步得到的 `length` 配置一個大小固定的 `Int32Array`，並重新走訪一次鏈結串列，將每個節點的值依序寫入陣列中，使後續可以索引方式快速存取。

```typescript
// 將節點值複製到型別陣列，獲得緊湊且對快取友善的索引存取
const values = new Int32Array(length);
node = head;
let index = 0;
while (node !== null) {
  values[index] = node.val;
  index++;
  node = node.next;
}
```

### Step 3：初始化雙指針與最大孿生和

設定左指針指向陣列起始位置、右指針指向陣列末端，並以 0 作為當前最大孿生和的初始值（題目保證節點值皆為正整數，故 0 為合法下界）。

```typescript
// 從兩端進行雙指針掃描，能在不追蹤節點的情況下評估每組孿生和
let maxTwinSum = 0;
let left = 0;
let right = length - 1;
```

### Step 4：以雙指針從兩端對撞計算孿生和並維護最大值

在 `left < right` 期間，每次取出兩端元素相加得到當前的孿生和；若新算出的值超過目前紀錄，則更新 `maxTwinSum`，最後將左右指針各自向中央收斂一步，直到兩指針會合為止。

```typescript
while (left < right) {
  const twinSum = values[left] + values[right];
  // 手動比較可避免在熱迴圈中呼叫 Math.max 所帶來的額外開銷
  if (twinSum > maxTwinSum) {
    maxTwinSum = twinSum;
  }
  left++;
  right--;
}
```

### Step 5：回傳最終的最大孿生和

雙指針會合後，所有孿生對皆已比較完畢，`maxTwinSum` 即為所求答案。

```typescript
return maxTwinSum;
```

## 時間複雜度

- 第一次走訪以計算長度為 $O(n)$；
- 第二次走訪將值複製進型別陣列為 $O(n)$；
- 雙指針掃描共處理 n/2 對孿生節點，為 $O(n)$。
- 總時間複雜度為 $O(n)$。

> $O(n)$

## 空間複雜度

- 使用一個長度為 n 的 `Int32Array` 暫存節點值，為 $O(n)$；
- 其餘僅使用固定數量的指針與計數變數。
- 總空間複雜度為 $O(n)$。

> $O(n)$
