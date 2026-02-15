# 67. Add Binary

Given two binary strings `a` and `b`, return their sum as a binary string.

**Constraints:**

- `1 <= a.length, b.length <= 10^4`
- `a` and `b` consist only of `'0'` or `'1'` characters.
- Each string does not contain leading zeros except for the zero itself.

## 基礎思路

本題要求將兩個二進位字串相加並回傳其二進位字串表示。由於輸入長度可達 $10^4$，不可直接轉成整數後相加，因此必須以逐位相加的方式模擬二進位加法流程。

核心觀察如下：

* **逐位相加與進位傳遞**：
  每一位的結果只依賴「當前兩個位元」與「上一位傳來的進位」，因此可由最低位開始往高位推進。

* **不同長度可視為高位補 0**：
  當某一側位元先用完，剩餘位元仍需與另一側及進位持續相加，直到兩側皆結束且不再有進位。

* **每輪同時產生輸出位與下一輪進位**：
  當前輸出位由加總的最低位決定；下一輪進位由加總是否達到 2 決定。

依此可採用策略：

* 從兩字串最低位同步往前掃描。
* 每輪加總兩位元與進位，得到輸出位與新進位。
* 直到兩字串皆處理完且進位為 0，輸出累積結果。

## 解題步驟

### Step 1：初始化雙指標與加法狀態

建立兩個索引指向兩字串的最低位，並初始化進位與結果字串。

```typescript
let leftIndex = a.length - 1;
let rightIndex = b.length - 1;

let carry = 0;
let result = "";
```

### Step 2：進入迴圈並建立本輪加總基礎

只要任一字串仍有位元或仍存在進位，就持續處理。
每輪先將進位作為加總起點。

```typescript
while (leftIndex >= 0 || rightIndex >= 0 || carry !== 0) {
  // 將當前位元加總，並加入上一位的進位。
  let sum = carry;

  // ...
}
```

### Step 3：加入左側位元並推進索引

若左側仍有位元，將其加入本輪加總並移動索引。

```typescript
while (leftIndex >= 0 || rightIndex >= 0 || carry !== 0) {
  // Step 2：進入迴圈並建立本輪加總基礎

  if (leftIndex >= 0) {
    sum += a.charCodeAt(leftIndex) - 48;
    leftIndex -= 1;
  }

  // ...
}
```

### Step 4：加入右側位元並推進索引

若右側仍有位元，將其加入本輪加總並移動索引。

```typescript
while (leftIndex >= 0 || rightIndex >= 0 || carry !== 0) {
  // Step 2：進入迴圈並建立本輪加總基礎

  // Step 3：加入左側位元並推進索引

  if (rightIndex >= 0) {
    sum += b.charCodeAt(rightIndex) - 48;
    rightIndex -= 1;
  }

  // ...
}
```

### Step 5：產生本輪結果位並更新進位

由加總最低位決定輸出位元，並由高位決定下一輪進位。

```typescript
while (leftIndex >= 0 || rightIndex >= 0 || carry !== 0) {
  // Step 2：進入迴圈並建立本輪加總基礎

  // Step 3：加入左側位元並推進索引

  // Step 4：加入右側位元並推進索引

  // 將計算出的位元加到結果字串前方。
  result = ((sum & 1) === 0 ? "0" : "1") + result;

  // 只有當 sum 為 2 或 3 時進位才會是 1。
  carry = sum >>> 1;
}
```

### Step 6：回傳最終結果

當迴圈結束代表所有位元與進位皆已處理完成。

```typescript
return result;
```

## 時間複雜度

- 由最低位往高位逐位處理，每輪進行常數次運算；
- 迴圈次數與兩字串較長者的長度成正比。
- 總時間複雜度為 $O(n)$。

> $O(n)$

## 空間複雜度

- 除輸出結果外，僅使用固定數量的額外狀態；
- 輸出字串長度最多為較長輸入長度加一。
- 總空間複雜度為 $O(n)$。

> $O(n)$
